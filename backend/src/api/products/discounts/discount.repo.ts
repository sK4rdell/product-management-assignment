import { Result, StatusError } from "@kardell/result";
import { Discount } from "./discount";
import { Sql } from "postgres";
import { sql } from "../../../db";
import { CreateDiscountInput } from "./discount.schema";
import { ID } from "../../../models";

const getProductDiscounts = async (
  productId: number,
  db: Sql = sql
): Promise<Result<Discount[], StatusError>> => {
  try {
    const discounts = await db<Discount[]>`
                select
                    d.id,
                    d.product_id as productId,
                    d.percentage,
                    d.start_date as startDate,
                    d.end_date as endDate
                from discounts d
                where d.product_id = ${productId}
            `;
    return Result.of(discounts);
  } catch (error) {
    console.error("Failed to get discounts", error);
    return Result.failure(StatusError.Internal());
  }
};

const getDiscountById = async (
  id: number,
  db: Sql = sql
): Promise<Result<Discount, StatusError>> => {
  try {
    const [discount]: [Discount?] = await db`
                select
                    id,
                    product_id as productId,
                    percentage,
                    start_date as startDate,
                    end_date as endDate
                from discounts
                where id = ${id}
            `;
    return Result.fromNullable<Discount, StatusError>(discount)(
      StatusError.NotFound()
    );
  } catch (error) {
    console.error("Failed to get discount", error);
    return Result.failure(StatusError.Internal());
  }
};

const insertDiscount = async (
  discount: CreateDiscountInput,
  db: Sql = sql
): Promise<Result<ID, StatusError>> => {
  try {
    const [id]: [ID] = await db`
                insert into discounts (product_id, percentage, start_date, end_date)
                values (${discount.productId}, ${discount.percentage}, ${discount.startDate}, ${discount.endDate})
                returning id
            `;
    return Result.of(id);
  } catch (error) {
    console.error("Failed to insert discount", error);
    return Result.failure(StatusError.Internal());
  }
};

const updateDiscount = async (
  id: number,
  discount: CreateDiscountInput,
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  try {
    await db`
            update discounts
            set discount_percentage = ${discount.percentage},
                start_date = ${discount.startDate},
                end_date = ${discount.endDate}
            where id = ${id}
        `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to update discount", error);
    return Result.failure(StatusError.Internal());
  }
};

const deleteDiscount = async (
  id: number,
  db: Sql = sql
): Promise<Result<null, StatusError>> => {
  try {
    await db`
            delete from discounts
            where id = ${id}
        `;
    return Result.of(null);
  } catch (error) {
    console.error("Failed to delete discount", error);
    return Result.failure(StatusError.Internal());
  }
};

export const discountsRepo = {
  getProductDiscounts,
  insertDiscount,
  updateDiscount,
  getDiscountById,
  deleteDiscount,
};
