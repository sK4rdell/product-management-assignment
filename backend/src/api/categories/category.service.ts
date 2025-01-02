import { Result, StatusError } from "@kardell/result";
import { categoryRepo } from "./category.repo";
import { toCategoryDTO } from "./category.converter";
import { CategoryDTO } from "../../models";

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
  category: CategoryPost
): Promise<Result<CategoryDTO, StatusError>> => {
  const res = await categoryRepo.insertCategory(category);
  return res.apply(toCategoryDTO);
};

const patchCategory = async (
  id: number,
  category: CategoryPatch
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

export const categoriesService = {
  getCategoryById,
  getCategories,
  createCategory,
  patchCategory,
};
