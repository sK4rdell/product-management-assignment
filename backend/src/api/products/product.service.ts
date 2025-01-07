import { Result, StatusError } from "@kardell/result";
import { productRepo } from "./product.repo";
import { sql, transaction } from "../../db";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { Product } from "../../models";
import { Sql } from "postgres";
import { producer } from "../../events/kafka";
import { EventFactory } from "../../events/model";

const getProducts = async (): Promise<Result<Product[], StatusError>> => {
  const results = await productRepo.getProducts();
  return results;
};

const mergeProduct = (
  current: Product,
  product: UpdateProductInput
): CreateProductInput => {
  return {
    categoryId: product.categoryId || current.category.id,
    name: product.name || current.name,
    description: product.description || current.description,
    price: product.price || current.price,
    sku: product.sku || current.sku,
    dimensions: product.dimensions
      ? {
          ...current.dimensions,
          ...product.dimensions,
        }
      : current.dimensions,
    weight: product.weight || current.weight,
    stock: product.stock || current.stock,
  };
};

const getProductById = async (
  id: number,
  db: Sql = sql
): Promise<Result<Product, StatusError>> => {
  return productRepo.getProductById(id, db);
};

const createProduct = async (
  productReq: CreateProductInput
): Promise<Result<Product, StatusError>> => {
  return transaction<Product, StatusError>(async (t) => {
    const { data, error } = await productRepo.insertProduct(productReq, t);
    if (error) {
      return Result.failure(error);
    }
    const { data: product, error: getProdError } = await getProductById(
      data.id,
      t
    );
    if (getProdError) {
      return Result.failure(getProdError);
    }
    console.log("Product created", product);
    const { error: eventError } = await producer.send(
      EventFactory.productCreatedEvent(product)
    );
    if (eventError) {
      console.error("Failed to send product created event", eventError);
      return Result.failure(StatusError.Internal());
    }
    return Result.of(product);
  });
};

const updateProduct = async (
  id: number,
  product: UpdateProductInput
): Promise<Result<Product, StatusError>> => {
  const { data: current, error } = await productRepo.getProductById(id);
  if (error) {
    return Result.failure(error);
  }
  return transaction<Product, StatusError>(async (t) => {
    const { error: updateError } = await productRepo.updateProduct(
      id,
      mergeProduct(current, product),
      t
    );
    if (updateError) {
      return Result.failure<Product, StatusError>(updateError);
    }
    const { data: updatedProduct, error: getError } = await getProductById(
      id,
      t
    );
    if (getError) {
      return Result.failure<Product, StatusError>(getError);
    }
    const { error: eventError } = await producer.send(
      EventFactory.productUpdatedEvent(updatedProduct)
    );
    if (eventError) {
      console.error("Failed to send product updated event", eventError);
      return Result.failure<Product, StatusError>(StatusError.Internal());
    }
    return Result.of(updatedProduct);
  });
};

const deleteProduct = async (
  id: number
): Promise<Result<null, StatusError>> => {
  return transaction<null, StatusError>(async (t) => {
    const { error: deleteError } = await productRepo.deleteProduct(id, t);
    if (deleteError) {
      return Result.failure(deleteError);
    }
    const { error: eventError } = await producer.send(
      EventFactory.productDeletedEvent(id)
    );
    if (eventError) {
      console.error("Failed to send product deleted event", eventError);
      return Result.failure(StatusError.Internal());
    }
    return Result.of(null);
  });
};

export const productsService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
