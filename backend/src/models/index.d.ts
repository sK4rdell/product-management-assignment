import { Discount } from "~/api/products/discounts/discount";

type ID = {
  id: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  dimensions: Dimension;
  weight: number;
  category: Category;
  stock: StockDTO[];
};

type Dimension = {
  width: number;
  height: number;
  depth: number;
};

type StockDTO = {
  quantity: number;
  location: string;
};

type Category = {
  id: number;
  name: string;
  description: string;
};

type DiscountDTO = Pick<
  Discount,
  "id" | "percentage" | "productId" | "startDate" | "endDate"
>;
