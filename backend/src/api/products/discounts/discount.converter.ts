import { DiscountDTO } from "../../../models";
import { Discount, ProductDiscountsDTO } from "./discount";

const isActive = (discount: Discount): boolean => {
  const now = new Date().toISOString();
  return now >= discount.startDate && now <= discount.endDate;
};

const isUpcoming = (discount: Discount): boolean => {
  const now = new Date().toISOString();
  return now < discount.startDate;
};

const isExpired = (discount: Discount): boolean => {
  const now = new Date().toISOString();
  return now > discount.endDate;
};

export const toProductDiscountsDTO = (
  discount: Discount[]
): ProductDiscountsDTO => {
  return {
    active: discount.find(isActive),
    upcoming: discount.filter(isUpcoming),
    expired: discount.filter(isExpired),
  };
};

export const toDiscountDTO = (discount: Discount): DiscountDTO => {
  return {
    id: discount.id,
    productId: discount.productId,
    percentage: discount.percentage,
    startDate: discount.startDate,
    endDate: discount.endDate,
  };
};
