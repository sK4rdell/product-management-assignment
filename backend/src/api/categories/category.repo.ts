import { Result, StatusError } from "@kardell/result";
import { sql } from "../../db";
import { Sql } from "postgres";
import { Category, ID } from "../../models";
import { CreateCategoryInput } from "./categories.schema";

const getCategoryById = async (
  id: number,
  db: Sql = sql
): Promise<Result<Category, StatusError>> => {
  try {
    const [category]: [Category?] = await sql`
        select
            id,
            name,
            description
        from categories
        where id = ${id}
    `;
    return Result.fromNullable<Category, StatusError>(category)(
      StatusError.NotFound()
    );
  } catch (error) {
    console.error("Failed to get category", error);
    return Result.failure(StatusError.Internal());
  }
};

const getAllCategories = async (
  db: Sql = sql
): Promise<Result<Category[], StatusError>> => {
  try {
    const categories = await sql<Category[]>`
            select
                id,
                name,
                description
            from categories
        `;
    return Result.of(categories);
  } catch (error) {
    console.error("Failed to get categories", error);
    return Result.failure(StatusError.Internal());
  }
};

const insertCategory = async (
  category: CreateCategoryInput,
  db: Sql = sql
): Promise<Result<ID, StatusError>> => {
  try {
    const [id]: [ID] = await db`
            insert into categories (name, description)
            values (${category.name}, ${category.description})
            returning id
        `;
    return Result.of(id);
  } catch (error) {
    console.error("Failed to insert category", error);
    return Result.failure(StatusError.Internal());
  }
};

const updateCategory = async (
  category: CreateCategoryInput & { id: number },
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  try {
    await db`
            update categories
            set name = ${category.name},
                description = ${category.description},
                updated_at = now()
            where id = ${category.id}
            `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to update category", error);
    return Result.failure(StatusError.Internal());
  }
};

const deleteCategory = async (
  id: number,
  db: Sql = sql
): Promise<Result<void, StatusError>> => {
  try {
    const [{ count }]: [{ count: number }] = await db`
        with deleted as (
            delete from categories
            where id = ${id}
            returning *
        ) select count(*) from deleted
        `;
    if (count == 0) {
      return Result.failure(StatusError.NotFound());
    }
    return Result.of(undefined);
  } catch (error) {
    console.error("Failed to delete category", error);
    return Result.failure(StatusError.Internal());
  }
};

const getProductIDsByCategory = async (
  categoryId: number,
  db: Sql = sql
): Promise<Result<ID[], StatusError>> => {
  try {
    const ids = await db<ID[]>`
        select id
        from products
        where category_id = ${categoryId}
    `;
    return Result.of(ids);
  } catch (error) {
    console.error("Failed to get products by category", error);
    return Result.failure(StatusError.Internal());
  }
};

export const categoryRepo = {
  getAllCategories,
  insertCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  getProductIDsByCategory,
};
