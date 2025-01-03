import { categoryRepo } from "../../src/api/categories/category.repo";
import { Category } from "../../src/api/categories/category.model";

import { randProductCategory, randProductDescription } from "@ngneat/falso";

export const createTestCategory = async (input?: {
  name?: string;
  description?: "Test category";
}): Promise<Category> => {
  let { data, error } = await categoryRepo.insertCategory({
    name: input?.name ?? randProductCategory(),
    description: input?.description ?? randProductDescription(),
  });
  if (error) {
    throw new Error("Failed to create category");
  }
  const res = await categoryRepo.getCategoryById(data.id);
  return res.fold(
    (data) => data,
    () => {
      throw new Error("Failed to create category");
    }
  );
};
