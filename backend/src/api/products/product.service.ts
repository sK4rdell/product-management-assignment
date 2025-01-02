import { Result, StatusError } from "@kardell/result";
import { productRepo } from "./product.repo";
import { toProductDTO } from "./products.converter";
import { transaction } from "../../db";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { ID, ProductDTO } from "../../models";
import { Product } from "./product.model";

const getProducts = async (): Promise<Result<ProductDTO[], StatusError>> => {
  const results = await productRepo.getProducts();
  return results.apply((products) => products.map(toProductDTO));
};

const mergeProduct = (
  current: Product,
  product: UpdateProductInput
): CreateProductInput => {
  return {
    categoryId: product.categoryId || current.category.id,
    name: product.name || current.name,
    description: product.description || current.description,
    price: product.price || current.price,
    sku: product.sku || current.sku,
    dimensions: product.dimensions
      ? {
          ...current.dimensions,
          ...product.dimensions,
        }
      : current.dimensions,
    weight: product.weight || current.weight,
    stock: product.stock || current.stock,
  };
};

const getProductById = async (
  id: number
): Promise<Result<ProductDTO, StatusError>> => {
  const result = await productRepo.getProductById(id);
  return result.apply(toProductDTO);
};

const createProduct = async (
  product: CreateProductInput
): Promise<Result<ProductDTO, StatusError>> => {
  const res = await transaction<ID, StatusError>(async (db) =>
    productRepo.insertProduct(product, db)
  );
  return res.fold(
    ({ id }) => getProductById(id),
    (error) => Result.failure(error)
  );
};

const updateProduct = async (
  id: number,
  product: UpdateProductInput
): Promise<Result<ProductDTO, StatusError>> => {
  const res = await transaction<null, StatusError>(async (db) => {
    const { data: current, error } = await productRepo.getProductById(id);
    if (error) {
      return Result.failure(error);
    }
    return await productRepo.updateProduct(
      id,
      mergeProduct(current, product),
      db
    );
  });
  return res.fold(
    () => getProductById(id),
    (error) => Result.failure(error)
  );
};

const deleteProduct = async (
  id: number
): Promise<Result<null, StatusError>> => {
  return await productRepo.deleteProduct(id);
};

export const productsService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
