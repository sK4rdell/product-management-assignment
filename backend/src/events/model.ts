import { ProductDTO } from "../models";

type Topic =
  | "product-events.created.v1"
  | "product-events.updated.v1"
  | "product-events.deleted.v1";

type Subject =
  | "product_created-value"
  | "product_updated-value"
  | "product_deleted-value";

export type ServiceEvent<V> = { subject: Subject; topic: Topic; payload: V };

export type ValidEvent =
  | {
      subject: "product_created-value";
      topic: "product-events.created.v1";
      payload: ProductDTO;
    }
  | {
      subject: "product_updated-value";
      topic: "product-events.updated.v1";
      payload: ProductDTO;
    }
  | {
      subject: "product_deleted-value";
      topic: "product-events.deleted.v1";
      payload: { id: number };
    };

export class EventFactory {
  static productCreatedEvent(product: ProductDTO): ServiceEvent<ProductDTO> {
    return {
      subject: "product_created-value",
      topic: "product-events.created.v1",
      payload: product,
    };
  }

  static productUpdatedEvent(product: ProductDTO): ServiceEvent<ProductDTO> {
    return {
      subject: "product_updated-value",
      topic: "product-events.updated.v1",
      payload: product,
    };
  }

  static productDeletedEvent(id: number): ServiceEvent<{ id: number }> {
    return {
      subject: "product_deleted-value",
      topic: "product-events.deleted.v1",
      payload: { id },
    };
  }
}
