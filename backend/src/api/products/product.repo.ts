import { Result, StatusError } from "@kardell/result";
import { sql } from "../../db";
import { Sql } from "postgres";
import { CreateProductInput } from "./product.schema";
import { Dimension, ID } from "../../models";
import { Product } from "./product.model";

const getProducts = async (
  db: Sql = sql
): Promise<Result<Product[], StatusError>> => {
  try {
    const res = await db<Product[]>`
        select
            p.id as id,
            p.name as name,
            p.description as description,
            p.price as price,
            p.sku as sku,
            p.dimensions as dimensions,
            p.weight as weight,
            p.created_at as createdAt,
            json_build_object(
                'id', c.id,
                'name', c.name,
                'description', c.description,
                'createdAt', c.created_at
            ) as category,
            json_agg(json_build_object(
                'id', s.id,
                'quantity', s.quantity,
                'location', s.location,
                'lastUpdated', s.last_updated
            )) as stock
        from products p
            join categories c on p.category_id = c.id
            left join stock s on p.id = s.product_id
        group by p.id, c.id;
    `;
    return Result.of(res);
  } catch (error) {
    console.error("Failed to get products", error);
    return Result.failure(StatusError.Internal());
  }
};

const getProductById = async (
  id: number,
  db: Sql = sql
): Promise<Result<Product, StatusError>> => {
  try {
    const [product]: [Product?] = await db`
            select
                p.id as id,
                p.name as name,
                p.description as description,
                p.price as price,
                p.sku as sku,
                p.dimensions as dimensions,
                p.weight as weight,
                p.created_at as createdAt,
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'description', c.description,
                    'createdAt', c.created_at
                    ) as category,
                    json_agg(json_build_object(
                        'id', s.id,
                        'quantity', s.quantity,
                        'location', s.location,
                        'lastUpdated', s.last_updated
                        )) as stock
            from products p
                join categories c on p.category_id = c.id
                left join stock s on p.id = s.product_id
            where p.id = ${id}
            group by p.id, c.id;
    `;
    return Result.fromNullable<Product, StatusError>(product)(
      StatusError.NotFound().withDetails("Product not found")
    );
  } catch (error) {
    console.error("Failed to get product by id", error);
    return Result.failure(StatusError.Internal());
  }
};

const insertProductRow = async (
  product: CreateProductInput,
  db: Sql = sql
): Promise<Result<ID, StatusError>> => {
  try {
    const [id] = await db<ID[]>`
      insert into products (
          name,
          description,
          price,
          sku,
          dimensions,
          weight,
          category_id
      ) values (
          ${product.name},
          ${product.description},
          ${product.price},
          ${product.sku},
          ${db.json(product.dimensions)},
          ${product.weight},
          ${product.categoryId}
      ) returning id;
   `;

    return Result.of(id);
  } catch (error) {
    console.error("Failed to insert product", error);
    return Result.failure(StatusError.Internal());
  }
};

const insertProduct = async (
  product: CreateProductInput,
  db: Sql = sql
): Promise<Result<ID, StatusError>> => {
  const idRes = await insertProductRow(product, db);
  if (idRes.error) {
    return idRes;
  }
  if (!product.stock) {
    return idRes;
  }
  const stock = product.stock.map((s) => ({ ...s, product_id: idRes.data.id }));
  try {
    console.log(`
        insert into stock ${sql(stock, "product_id", "quantity", "location")};
    `);
    await db`
        insert into stock ${sql(stock, "product_id", "quantity", "location")};
    `;
    return idRes;
  } catch (error) {
    console.error("Failed to insert product inventory", error);
    return Result.failure(StatusError.Internal());
  }
};

const updateProduct = async (
  id: number,
  product: CreateProductInput,
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  try {
    await db`
        update products
        set
            name = ${product.name},
            description = ${product.description},
            price = ${product.price},
            sku = ${product.sku},
            dimensions = ${JSON.stringify(product.dimensions)},
            weight = ${product.weight},
            category_id = ${product.categoryId}
        where id = ${id};
    `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to update product", error);
    return Result.failure(StatusError.Internal());
  }
};

const updateStock = async (
  id: number,
  product: CreateProductInput,
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  const stock = product.stock.map((s) => ({ ...s, product_id: id }));
  try {
    await db`
        delete from stock
        where product_id = ${id};
    `;
    await db`
        insert into stock (product_id, quantity, location)
        ${sql(stock)};
    `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to update product inventory", error);
    return Result.failure(StatusError.Internal());
  }
};

const deleteProduct = async (
  id: number,
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  try {
    await db`
        delete from products
        where id = ${id};
    `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to delete product", error);
    return Result.failure(StatusError.Internal());
  }
};

export const productRepo = {
  getProducts,
  getProductById,
  insertProduct,
  updateStock,
  updateProduct,
  deleteProduct,
};
