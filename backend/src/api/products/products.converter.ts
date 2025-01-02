import { ProductDTO } from "../../models";
import { Product } from "./product.model"; // Ensure this path is correct

export const toProductDTO = (product: Product): ProductDTO => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    sku: product.sku,
    dimensions: product.dimensions,
    weight: product.weight,
    category: {
      name: product.category.name,
      description: product.category.description,
    },
    stock: product.stock.map((s) => ({
      quantity: s.quantity,
      location: s.location,
    })),
  };
};
