import { Kafka, Producer, RetryOptions } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { Result } from "@kardell/result";
import { MemCache } from "./cache";

type KafkaPayload = Buffer<ArrayBufferLike>;

export type SchemaType =
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED";

class KafkaError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "KafkaError";
  }
}

interface SchemaPayload {
  PRODUCT_CREATED: { eventTime: number; product: Record<string, any> };
  PRODUCT_UPDATED: { eventTime: number; product: Record<string, any> };
  PRODUCT_DELETED: { productId: string; timestamp: number };
}

class KafkaProducerClient {
  private registry: SchemaRegistry;
  private producer: Producer;
  private kafka: Kafka;
  private schemaCache: MemCache<number>;

  constructor(
    registryURL: string,
    brokers: string[],
    retryOptions: RetryOptions = {
      retries: 5,
      initialRetryTime: 100,
      maxRetryTime: 30000,
    }
  ) {
    this.kafka = new Kafka({
      brokers,
      retry: retryOptions,
    });
    this.registry = new SchemaRegistry({ host: registryURL });
    this.producer = this.kafka.producer();
    this.schemaCache = new MemCache<number>();
  }

  async connect(): Promise<Result<void, KafkaError>> {
    try {
      await this.producer.connect();
      return Result.of(undefined);
    } catch (error) {
      return Result.failure(
        new KafkaError("Failed to connect to Kafka", error as Error)
      );
    }
  }

  async disconnect(): Promise<Result<void, KafkaError>> {
    try {
      await this.producer.disconnect();
      return Result.of(undefined);
    } catch (error) {
      return Result.failure(
        new KafkaError("Failed to disconnect from Kafka", error as Error)
      );
    }
  }

  private async getSchemaId(
    type: SchemaType
  ): Promise<Result<number, KafkaError>> {
    const cachedId = this.schemaCache.get(type);
    if (cachedId) {
      return Result.of(cachedId);
    }
    try {
      const id = await this.registry.getLatestSchemaId(
        `${type.toLowerCase()}-value`
      );
      this.schemaCache.put(type, id);
      return Result.of(id);
    } catch (error) {
      return Result.failure(
        new KafkaError("Failed to get schema ID", error as Error)
      );
    }
  }

  async send<T extends SchemaType>(
    topic: string,
    type: T,
    payload: SchemaPayload[T]
  ): Promise<Result<void, KafkaError>> {
    const schemaResult = await this.getSchemaId(type);
    if (schemaResult.error) return Result.failure(schemaResult.error);

    const encodedResult = await this.encode(schemaResult.data, payload);
    if (encodedResult.error) return Result.failure(encodedResult.error);

    try {
      await this.producer.send({
        topic,
        messages: [{ value: encodedResult.data }],
      });
      return Result.of(undefined);
    } catch (error) {
      return Result.failure(
        new KafkaError("Failed to send message", error as Error)
      );
    }
  }

  private async encode(
    schemaID: number,
    payload: any
  ): Promise<Result<KafkaPayload, KafkaError>> {
    try {
      const encodedValue = await this.registry.encode(schemaID, payload);
      return Result.of(encodedValue);
    } catch (error) {
      return Result.failure(
        new KafkaError("Failed to encode message", error as Error)
      );
    }
  }
}

const brokers = process.env.KAFKA_BROKERS?.split(",") ?? [];
const registryURL = process.env.SCHEMA_REGISTRY_URL ?? "";

export const producer = new KafkaProducerClient(registryURL, brokers);
