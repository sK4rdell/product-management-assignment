import { z } from "zod";
import { ValidationSchema } from "../../middlewares/validation";

export const categoryIdSchema: ValidationSchema = {
  params: z.object({
    categoryId: z.number().int(),
  }),
};

export const createCategorySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

export const createCategoryValidationSchema: ValidationSchema = {
  body: createCategorySchema,
};

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategoryValidationSchema: ValidationSchema = {
  body: updateCategorySchema,
  params: categoryIdSchema.params,
};
