import { create } from "domain";
import { CategoryDTO } from "../../models";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema";
import { z } from "zod";

export type Category = CategoryDTO & {
  id: number;
};

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
