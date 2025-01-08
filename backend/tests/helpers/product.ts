import { productRepo } from "../../src/api/products/product.repo";
import * as falso from "@ngneat/falso";
import { CreateProductInput } from "../../src/api/products/product.schema";

export const createTestProduct = async (
  categoryId: number,
  product: Partial<CreateProductInput> = {}
) => {
  const defaultProduct: CreateProductInput = {
    name: falso.randProductName(),
    price: falso.randNumber({ min: 1, max: 100000, fixed: 0 }),
    dimensions: {
      width: falso.randNumber({ min: 1, max: 200, fixed: 0 }),
      height: falso.randNumber({ min: 1, max: 200, fixed: 0 }),
      depth: falso.randNumber({ min: 1, max: 200, fixed: 0 }),
    },
    sku: falso.randAbbreviation({ length: 20 }).join(""),
    stock: [
      {
        location: falso.randCity(),
        quantity: falso.randNumber({ min: 1, max: 10000, fixed: 0 }),
      },
      {
        location: falso.randCity(),
        quantity: falso.randNumber({ min: 1, max: 10000, fixed: 0 }),
      },
    ],
    description: falso.randProductDescription(),
    weight: falso.randNumber({ min: 1, max: 10000, fixed: 0 }),
    categoryId,
  };

  const { data, error } = await productRepo.insertProduct({
    ...defaultProduct,
    ...product,
  });

  if (error) {
    throw new Error("Failed to create product");
  }

  const res = await productRepo.getProductById(data.id);
  return res.data;
};
