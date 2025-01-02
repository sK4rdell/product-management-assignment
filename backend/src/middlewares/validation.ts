import { StatusError } from "@kardell/result";
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export interface ValidationSchema {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

const validate = (
  data: unknown,
  schema: ZodSchema
): StatusError | undefined => {
  try {
    schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((issue) => issue.path.join("."));
      return StatusError.BadRequest("Invalid data").withDetails(
        JSON.stringify(errorMessages)
      );
    } else {
      console.error("Failed to validate data", error);
      return StatusError.Internal("Internal Server Error");
    }
  }
};

const writeError = (res: Response, error: StatusError) => {
  const { status, message, details } = error;
  res.status(status).json({ message, details });
};

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schema.params) {
      const error = validate(req.params, schema.params);
      if (error) {
        writeError(res, error);
        return;
      }
    }

    if (schema.query) {
      const error = validate(req.query, schema.query);
      if (error) {
        writeError(res, error);
        return;
      }
    }

    if (schema.body) {
      const error = validate(req.body, schema.body);
      if (error) {
        writeError(res, error);
        return;
      }
    }

    next();
  };
}
