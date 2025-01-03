import { CategoryDTO } from "../../models";
import { Category } from "./category.model";

export const toCategoryDTO = (category: Category): CategoryDTO => {
  return {
    name: category.name,
    description: category.description,
    id: category.id,
  };
};
