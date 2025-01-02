export type Discount = {
  id: number;
  productId: number;
  percentage: number;
  startDate: string;
  endDate: string;
};

export type ProductDiscountsDTO = {
  active?: Discount;
  upcoming: Discount[];
  expired: Discount[];
};
