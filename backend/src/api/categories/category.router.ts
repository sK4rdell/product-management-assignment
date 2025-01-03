import { Router } from "express";
import { categoriesService } from "./category.service";
import {
  categoryIdSchema,
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
} from "./categories.schema";
import { validateRequest } from "../../middlewares/validation";

const categoryRouter = Router();

categoryRouter.get("/", async (_, res) => {
  const result = await categoriesService.getCategories();
  result.fold(
    (categories) => res.json(categories),
    (error) =>
      res
        .status(error.status)
        .json({ message: error.message, details: error.details })
  );
});

categoryRouter.post(
  "/",
  validateRequest(createCategoryValidationSchema),
  async (req, res) => {
    const result = await categoriesService.createCategory(req.body);
    result.fold(
      (category) => res.json(category),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

categoryRouter.patch(
  "/:categoryId",
  validateRequest(updateCategoryValidationSchema),
  async (req, res) => {
    const result = await categoriesService.patchCategory(
      +req.params.categoryId,
      req.body
    );
    result.fold(
      (category) => res.json(category),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

categoryRouter.get(
  "/:categoryId",
  validateRequest(categoryIdSchema),
  async (req, res) => {
    const result = await categoriesService.getCategoryById(
      +req.params.categoryId
    );
    result.fold(
      (category) => res.json(category),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

categoryRouter.delete(
  "/:categoryId",
  validateRequest(categoryIdSchema),
  async (req, res) => {
    const result = await categoriesService.deleteCategory(
      +req.params.categoryId
    );
    result.fold(
      () => res.status(204).end(),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

export { categoryRouter };
