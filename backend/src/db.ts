import "dotenv/config";
import { Result } from "@kardell/result";
import postgres, { Sql } from "postgres";

const sql = postgres(process.env.DATABASE_URL ?? "", { max: 10 });

const transaction = async <T, E extends Error = Error>(
  f: (arg: Sql) => Promise<Result<T, E>>
) => {
  try {
    const txRes = await sql.begin<T>(async (db) => {
      const res = await f(db);
      return res.fold(
        (value) => value,
        (error) => {
          throw error;
        }
      );
    });
    return Result.of<T, E>(txRes as T);
  } catch (error) {
    return Result.failure<T, E>(<E>error);
  }
};

const dbHealthy = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Failed to ping database", error);
    return false;
  }
};

export { sql, transaction, dbHealthy };
