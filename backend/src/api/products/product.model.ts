import { StockDTO, CategoryDTO, Dimension } from "~/models";
type Stock = StockDTO & {
  id: number;
  lastUpdated: Date;
};

type Category = CategoryDTO & {
  id: number;
  createdAt: Date;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  dimensions: Dimension;
  weight: number;
  category: Category;
  stock: Stock[];
  createdAt: Date;
};
