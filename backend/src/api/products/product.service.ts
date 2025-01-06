import { Result, StatusError } from "@kardell/result";
import { productRepo } from "./product.repo";
import { toProductDTO } from "./products.converter";
import { sql, transaction } from "../../db";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { ProductDTO } from "../../models";
import { Product } from "./product.model";
import { Sql } from "postgres";
import { producer } from "../../events/kafka";
import { EventFactory } from "../../events/model";

const getProducts = async (): Promise<Result<ProductDTO[], StatusError>> => {
  const results = await productRepo.getProducts();
  return results.apply((products) => products.map(toProductDTO));
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
): Promise<Result<ProductDTO, StatusError>> => {
  const result = await productRepo.getProductById(id, db);
  return result.apply(toProductDTO);
};

const createProduct = async (
  productReq: CreateProductInput
): Promise<Result<ProductDTO, StatusError>> => {
  return transaction<ProductDTO, StatusError>(async (t) => {
    const {
      data: { id },
      error,
    } = await productRepo.insertProduct(productReq, t);
    if (error) {
      return Result.failure(error);
    }
    const { data: product, error: getProdError } = await getProductById(id, t);
    if (getProdError) {
      return Result.failure(getProdError);
    }

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
): Promise<Result<ProductDTO, StatusError>> => {
  const { data: current, error } = await productRepo.getProductById(id);
  if (error) {
    return Result.failure(error);
  }
  return transaction<ProductDTO, StatusError>(async (t) => {
    const { error: updateError } = await productRepo.updateProduct(
      id,
      mergeProduct(current, product),
      t
    );
    if (updateError) {
      return Result.failure<ProductDTO, StatusError>(updateError);
    }
    const { data: updatedProduct, error: getError } = await getProductById(
      id,
      t
    );
    if (getError) {
      return Result.failure<ProductDTO, StatusError>(getError);
    }
    const { error: eventError } = await producer.send(
      EventFactory.productUpdatedEvent(updatedProduct)
    );
    if (eventError) {
      console.error("Failed to send product updated event", eventError);
      return Result.failure<ProductDTO, StatusError>(StatusError.Internal());
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
