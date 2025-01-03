import { Discount } from "~/api/products/discounts/discount";

type ID = {
  id: number;
};

type ProductDTO = {
  name: string;
  description: string;
  price: number;
  sku: string;
  dimensions: Dimension;
  weight: number;
  category: CategoryDTO;
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

type CategoryDTO = Pick<Category, "id" | "name" | "description">;

type DiscountDTO = Pick<
  Discount,
  "id" | "percentage" | "productId" | "startDate" | "endDate"
>;
