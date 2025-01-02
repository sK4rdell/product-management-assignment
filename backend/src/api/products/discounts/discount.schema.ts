import { z } from "zod";
import { ValidationSchema } from "../../../middlewares/validation";
import { productIdSchema } from "../product.schema";

const allIdsSchema = z.object({
  productId: z.number().int(),
  id: z.number().int(),
});

// POST /products/:productId/discounts
const createDiscountSchema = z.object({
  percentage: z.number().min(0).max(100),
  productId: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;

export const createDiscountValidationSchema: ValidationSchema = {
  params: productIdSchema.params,
  body: createDiscountSchema,
};

// PUT /products/:productId/discounts/:id
const updateDiscountSchema = z.object({
  percentage: z.number().min(0).max(100).optional(),
  productId: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

export const updateDiscountValidationSchema: ValidationSchema = {
  params: allIdsSchema,
  body: updateDiscountSchema,
};

// GET /products/:productId/discounts
export const getProductDiscountsValidationSchema: ValidationSchema = {
  params: productIdSchema.params,
};

// DELETE /products/:productId/discounts/:id
export const deleteDiscountValidationSchema: ValidationSchema = {
  params: allIdsSchema,
};

// GET /products/:productId/discounts/:id
export const getDiscountValidationSchema = deleteDiscountValidationSchema;
