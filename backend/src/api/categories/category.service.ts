import { Result, StatusError } from "@kardell/result";
import { categoryRepo } from "./category.repo";
import { toCategoryDTO } from "./category.converter";
import { CategoryDTO } from "../../models";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.model";

const getCategoryById = async (
  id: number
): Promise<Result<CategoryDTO, StatusError>> => {
  const res = await categoryRepo.getCategoryById(id);
  return res.apply(toCategoryDTO);
};

const getCategories = async (): Promise<Result<CategoryDTO[], StatusError>> => {
  const res = await categoryRepo.getAllCategories();
  return res.apply((categories) => categories.map(toCategoryDTO));
};

const createCategory = async (
  category: CreateCategoryInput
): Promise<Result<CategoryDTO, StatusError>> => {
  const { data, error } = await categoryRepo.insertCategory(category);
  if (error) {
    return Result.failure(error);
  }
  return getCategoryById(data.id);
};

const patchCategory = async (
  id: number,
  category: UpdateCategoryInput
): Promise<Result<CategoryDTO, StatusError>> => {
  const { data: current, error } = await categoryRepo.getCategoryById(id);
  if (error) {
    return Result.failure(error);
  }
  const res = await categoryRepo.updateCategory({
    ...current,
    ...category,
    id,
  });
  return res.fold(
    () => getCategoryById(id),
    (error) => Result.failure(error)
  );
};

const deleteCategory = async (
  id: number
): Promise<Result<void, StatusError>> => {
  // first check if any products are using this category
  const { data: productIDs, error } =
    await categoryRepo.getProductIDsByCategory(id);

  if (error) {
    console.error("Failed to get products by category", error);
    return Result.failure(StatusError.Internal());
  }
  // if there are products using this category, return an error
  if (productIDs.length > 0) {
    return Result.failure(
      StatusError.BadRequest().withDetails(
        `category is in use by products: [${productIDs
          .map((x) => x.id)
          .join(", ")}]`
      )
    );
  }
  return categoryRepo.deleteCategory(id);
};

export const categoriesService = {
  getCategoryById,
  getCategories,
  createCategory,
  patchCategory,
  deleteCategory,
};
