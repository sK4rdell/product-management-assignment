import { Router } from "express";
import {
  createDiscountValidationSchema,
  deleteDiscountValidationSchema,
  getProductDiscountsValidationSchema,
  updateDiscountValidationSchema,
} from "./discount.schema";
import { validateRequest } from "../../../middlewares/validation";
import { discountsService } from "./discount.service";

const discountRouter = Router();

discountRouter.get(
  "/",
  validateRequest(getProductDiscountsValidationSchema),
  async (req, resp) => {
    const res = await discountsService.getDiscounts(+req.params.productId);
    return res.fold(
      (data) => resp.json(data),
      (error) => resp.status(error.status).json(error.message)
    );
  }
);

discountRouter.post(
  "/",
  validateRequest(createDiscountValidationSchema),
  async (req, resp) => {
    const res = await discountsService.createDiscount(req.body);
    return res.fold(
      (data) => resp.json(data),
      (error) => resp.status(error.status).json(error.message)
    );
  }
);

discountRouter.patch(
  "/:id",
  validateRequest(updateDiscountValidationSchema),
  async (req, resp) => {
    const res = await discountsService.updateDiscount(+req.params.id, req.body);
    return res.fold(
      (data) => resp.json(data),
      (error) => resp.status(error.status).json(error.message)
    );
  }
);

discountRouter.delete(
  "/:id",
  validateRequest(deleteDiscountValidationSchema),
  async (req, resp) => {
    const res = await discountsService.deleteDiscount(+req.params.id);
    return res.fold(
      () => resp.status(204).send(),
      (error) => resp.status(error.status).json(error.message)
    );
  }
);

discountRouter.get(
  "/:id",
  validateRequest(deleteDiscountValidationSchema),
  async (req, resp) => {
    const res = await discountsService.getDiscountById(+req.params.id);
    return res.fold(
      (data) => resp.json(data),
      (error) => resp.status(error.status).json(error.message)
    );
  }
);

export { discountRouter };
