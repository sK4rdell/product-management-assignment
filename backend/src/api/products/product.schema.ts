import { z } from "zod";
import { ValidationSchema } from "../../middlewares/validation";

export const productIdSchema: ValidationSchema = {
  params: z.object({
    productId: z.number().int(),
  }),
};

const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  sku: z.string(),
  dimensions: z.object({
    width: z.number().min(0),
    height: z.number().min(0),
    depth: z.number().min(0),
  }),
  weight: z.number().min(0),
  categoryId: z.number().int().positive(),
  stock: z.array(
    z.object({
      quantity: z.number().int(),
      location: z.string(),
    })
  ),
});

export const createProductValidationSchema: ValidationSchema = {
  body: createProductSchema,
};

export type CreateProductInput = z.infer<typeof createProductSchema>;

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  sku: z.string().optional(),
  dimensions: z
    .object({
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      depth: z.number().min(0).optional(),
    })
    .optional(),
  weight: z.number().min(0).optional(),
  categoryId: z.number().int().positive().optional(),
  stock: z
    .array(
      z.object({
        quantity: z.number().int(),
        location: z.string(),
      })
    )
    .optional(),
});

export const updateProductValidationSchema: ValidationSchema = {
  body: updateProductSchema,
  params: productIdSchema.params,
};

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
