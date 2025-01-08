import { describe, expect, test } from "@jest/globals";
import { Product } from "./product.model";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { http } from "../../../tests/helpers/http";
import { createTestProduct } from "../../../tests/helpers/product";
import * as falso from "@ngneat/falso";
import { createTestCategory } from "../../../tests/helpers/category";
import { Category } from "../../models";

describe("Products API", () => {
  let category: Category;

  beforeAll(async () => {
    category = await createTestCategory();
  });
  describe("POST /products", () => {
    const validInput: CreateProductInput = {
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
      categoryId: 1,
    };

    const invalidInputs: CreateProductInput | any = [
      { name: "", description: "description for something", price: 49.99 },
      { name: 123, description: "description for something", price: 49.99 },
      { name: "x", description: "description for something", price: 49.99 },
      { name: "Chair", description: "to-short", price: 49.99 },
      { name: "Chair", description: "description for something", price: -10 },
    ];

    beforeAll(async () => {
      validInput.categoryId = category.id;
    });

    test.each(invalidInputs)(
      "should return 400 if input is invalid",
      async (input: CreateProductInput | any) => {
        // Arrange
        const resp = await http.post("api/products", input);
        expect(resp.error).toBeTruthy();
        expect(resp.error?.status).toBe(400);
      }
    );

    test("should return 201 if input is valid", async () => {
      // Arrange
      const resp = await http.post<Product>("api/products", validInput);
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: validInput.name,
          dimensions: validInput.dimensions,
          sku: validInput.sku,
          description: validInput.description,
          weight: validInput.weight,
          price: validInput.price,
        })
      );
    });
  });

  describe("GET /products", () => {
    let product: Product;
    beforeAll(async () => {
      product = await createTestProduct(category.id);
    });

    test("should return 200 with a list of products", async () => {
      const resp = await http.get<Product[]>("api/products");
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data?.find((x) => x.id === product.id)).toBeTruthy();
    });
  });

  describe("PATCH /products/:id", () => {
    let product: Product;
    beforeAll(async () => {
      product = await createTestProduct(category.id);
    });

    const validInput: UpdateProductInput = {
      name: "Updated Chair",
      description: "Updated description for chair",
      price: 59.99,
    };
    const invalidInputs = [
      { name: "", description: "description for something", price: 59.99 },
      { name: 123, description: "description for something", price: 59.99 },
      { name: "x", description: "description for something", price: 59.99 },
      { name: "Chair", description: "to-short", price: 59.99 },
      { name: "Chair", description: "description for something", price: -10 },
    ];

    test.each(invalidInputs)(
      "should return 400 if input is invalid",
      async (input: UpdateProductInput | any) => {
        const resp = await http.patch(`api/products/${product.id}`, input);
        expect(resp.error).toBeTruthy();
        expect(resp.error?.status).toBe(400);
      }
    );

    test("should return 200 if input is valid", async () => {
      const resp = await http.patch<Product>(
        `api/products/${product.id}`,
        validInput
      );
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toMatchObject({
        id: product.id,
        ...validInput,
      });
    });

    test("should return 404 if product does not exist", async () => {
      const resp = await http.patch(`api/products/99999`, validInput);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });

  describe("GET /products/:id", () => {
    let product: Product;
    beforeAll(async () => {
      product = await createTestProduct(category.id);
    });

    test("should return 200 with a product", async () => {
      const resp = await http.get<Product>(`api/products/${product.id}`);
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toEqual(
        expect.objectContaining({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          sku: product.sku,
          dimensions: product.dimensions,
          weight: product.weight,
        })
      );
    });

    test("should return 404 if product does not exist", async () => {
      const resp = await http.get(`api/products/99999`);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    let product: Product;
    beforeAll(async () => {
      product = await createTestProduct(category.id);
    });

    test("should return ok if product is deleted", async () => {
      const resp = await http.delete(`api/products/${product.id}`);
      expect(resp.error).toBeFalsy();
    });

    test("should return 404 if product does not exist", async () => {
      const resp = await http.delete(`api/products/${product.id}`);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });
});
