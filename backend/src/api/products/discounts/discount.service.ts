import { Result, StatusError } from "@kardell/result";
import { ProductDiscountsDTO } from "./discount";
import { toDiscountDTO, toProductDiscountsDTO } from "./discount.converter";
import { discountsRepo } from "./discount.repo";
import { CreateDiscountInput, UpdateDiscountInput } from "./discount.schema";
import { DiscountDTO } from "../../../models";

const getDiscounts = async (
  productId: number
): Promise<Result<ProductDiscountsDTO, StatusError>> => {
  const res = await discountsRepo.getProductDiscounts(productId);
  return res.apply(toProductDiscountsDTO);
};

const getDiscountById = async (
  id: number
): Promise<Result<DiscountDTO, StatusError>> => {
  const res = await discountsRepo.getDiscountById(id);
  return res.apply(toDiscountDTO);
};

const createDiscount = async (
  discount: CreateDiscountInput
): Promise<Result<DiscountDTO, StatusError>> => {
  const { data: id, error } = await discountsRepo.insertDiscount(discount);
  if (error) {
    return Result.failure(error);
  }
  const res = await discountsRepo.getDiscountById(id.id);
  return res.apply(toDiscountDTO);
};

const updateDiscount = async (
  id: number,
  discount: UpdateDiscountInput
): Promise<Result<DiscountDTO, StatusError>> => {
  const { data: current, error } = await discountsRepo.getDiscountById(id);
  if (error) {
    return Result.failure(error);
  }
  const res = await discountsRepo.updateDiscount(id, {
    ...current,
    ...discount,
  });
  return res.fold(
    () => getDiscountById(id),
    (error) => Result.failure(error)
  );
};

const deleteDiscount = async (
  id: number
): Promise<Result<void, StatusError>> => {
  const res = await discountsRepo.deleteDiscount(id);
  return res.fold(
    () => Result.of(undefined),
    (error) => Result.failure(error)
  );
};

export const discountsService = {
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
};
