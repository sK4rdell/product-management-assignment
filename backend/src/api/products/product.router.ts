import { Router } from "express";
import { productsService } from "./product.service";
import {
  createProductValidationSchema,
  productIdSchema,
  updateProductValidationSchema,
} from "./product.schema";
import { discountRouter } from "./discounts";
import { validateRequest } from "../../middlewares/validation";

const productRouter = Router();

productRouter.get("/", async (_, res) => {
  const result = await productsService.getProducts();
  result.fold(
    (products) => res.json(products),
    (error) =>
      res
        .status(error.status)
        .json({ message: error.message, details: error.details })
  );
});

productRouter.post(
  "/",
  validateRequest(createProductValidationSchema),
  async (req, res) => {
    const result = await productsService.createProduct(req.body);
    result.fold(
      (product) => res.json(product),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

productRouter.patch(
  "/:productId",
  validateRequest(updateProductValidationSchema),
  async (req, res) => {
    const result = await productsService.updateProduct(
      +req.params.productId,
      req.body
    );
    result.fold(
      (product) => res.json(product),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

productRouter.get(
  "/:productId",
  validateRequest(productIdSchema),
  async (req, res) => {
    const result = await productsService.getProductById(+req.params.productId);
    result.fold(
      (product) => res.json(product),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

productRouter.delete(
  "/:productId",
  validateRequest(productIdSchema),
  async (req, res) => {
    const result = await productsService.deleteProduct(+req.params.productId);
    result.fold(
      () => res.status(204).end(),
      (error) =>
        res
          .status(error.status)
          .json({ message: error.message, details: error.details })
    );
  }
);

productRouter.use("/:productId/discounts", discountRouter);

export { productRouter };
