import { StockDTO, Dimension } from "../../models";
import { Category } from "../categories/category.model";

type Stock = StockDTO & {
  id: number;
  lastUpdated: Date;
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
