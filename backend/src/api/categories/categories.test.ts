import { describe, expect, test } from "@jest/globals";
import { CreateCategoryInput } from "./category.model";
import { http } from "../../../tests/helpers/http";
import { CategoryDTO } from "../../models";

describe("Categories API", () => {
  let category: CategoryDTO;
  describe("POST /categories", () => {
    const validInput: CreateCategoryInput = {
      name: "Kitchen",
      description: "Products for your kitchen and dining area",
    };
    const invalidInputs: CreateCategoryInput | any = [
      { name: "", description: "description for something" },
      { name: 123, description: "description for something" },
      { name: "x", description: "description for something" },
      { name: "Kitchen", description: "to-short" },
    ];
    test.each(invalidInputs)(
      "should return 400 if input is invalid",
      async (input: CreateCategoryInput | any) => {
        // Arrange
        const resp = await http.post("api/categories", input);
        expect(resp.error).toBeTruthy();
        expect(resp.error?.status).toBe(400);
      }
    );

    test("should return 201 if input is valid", async () => {
      // Arrange
      const resp = await http.post<CategoryDTO>("api/categories", validInput);
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toMatchObject({
        id: expect.any(Number),
        ...validInput,
      });
      category = resp.data;
    });
  });

  describe("GET /categories", () => {
    test("should return 200 with a list of categories", async () => {
      const resp = await http.get<CategoryDTO[]>("api/categories");
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toContainEqual(category);
    });
  });

  describe("PATCH /categories/:id", () => {
    const validInput: CreateCategoryInput = {
      name: "Updated Kitchen",
      description: "Updated description for kitchen products",
    };
    const invalidInputs = [
      { name: "", description: "description for something" },
      { name: 123, description: "description for something" },
      { name: "x", description: "description for something" },
      { name: "Kitchen", description: "to-short" },
    ];

    test.each(invalidInputs)(
      "should return 400 if input is invalid",
      async (input: CreateCategoryInput | any) => {
        const resp = await http.patch(`api/categories/${category.id}`, input);
        expect(resp.error).toBeTruthy();
        expect(resp.error?.status).toBe(400);
      }
    );

    test("should return 200 if input is valid", async () => {
      const resp = await http.patch<CategoryDTO>(
        `api/categories/${category.id}`,
        validInput
      );
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toMatchObject({
        id: category.id,
        ...validInput,
      });
    });

    test("should return 404 if category does not exist", async () => {
      const resp = await http.patch(`api/categories/99999`, validInput);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });

  describe("GET /categories/:id", () => {
    test("should return 200 with a category", async () => {
      const resp = await http.get<CategoryDTO>(`api/categories/${category.id}`);
      expect(resp.error).toBeFalsy();
      expect(resp.data).toBeTruthy();
      expect(resp.data).toMatchObject(category);
    });

    test("should return 404 if category does not exist", async () => {
      const resp = await http.get(`api/categories/99999`);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });

  describe("DELETE /categories/:id", () => {
    test("should return ok if category is deleted", async () => {
      const resp = await http.delete(`api/categories/${category.id}`);
      expect(resp.error).toBeFalsy();
    });

    test("should return 404 if category does not exist", async () => {
      const resp = await http.delete(`api/categories/${category.id}`);
      expect(resp.error).toBeTruthy();
      expect(resp.error?.status).toBe(404);
    });
  });
});
