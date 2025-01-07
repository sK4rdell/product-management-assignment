import { Product } from "../models";

type Topic =
  | "product-events.created.v1"
  | "product-events.updated.v1"
  | "product-events.deleted.v1";

type Subject =
  | "product-created-value"
  | "product-updated-value"
  | "product-deleted-value";

type EventPayload<V> = { eventTime: number; payload: V };

export type ServiceEvent<V> = {
  subject: Subject;
  topic: Topic;
  payload: EventPayload<V>;
};

export type ValidEvent =
  | {
      subject: "product-created-value";
      topic: "product-events.created.v1";
      payload: Product;
    }
  | {
      subject: "product-updated-value";
      topic: "product-events.updated.v1";
      payload: Product;
    }
  | {
      subject: "product-deleted-value";
      topic: "product-events.deleted.v1";
      payload: { id: number };
    };

export class EventFactory {
  static productCreatedEvent(product: Product): ServiceEvent<Product> {
    return {
      subject: "product-created-value",
      topic: "product-events.created.v1",
      payload: { eventTime: Date.now(), payload: product },
    };
  }

  static productUpdatedEvent(product: Product): ServiceEvent<Product> {
    return {
      subject: "product-updated-value",
      topic: "product-events.updated.v1",
      payload: { eventTime: Date.now(), payload: product },
    };
  }

  static productDeletedEvent(id: number): ServiceEvent<{ id: number }> {
    return {
      subject: "product-deleted-value",
      topic: "product-events.deleted.v1",
      payload: { eventTime: Date.now(), payload: { id } },
    };
  }
}
