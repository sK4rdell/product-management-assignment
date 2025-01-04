import { ProductDTO } from "../../models";
import { toCategoryDTO } from "../categories/category.converter";
import { Product } from "./product.model"; // Ensure this path is correct

export const toProductDTO = (product: Product): ProductDTO => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    sku: product.sku,
    dimensions: product.dimensions,
    weight: product.weight,
    category: toCategoryDTO(product.category),
    stock: product.stock.map((s) => ({
      quantity: s.quantity,
      location: s.location,
    })),
  };
};
