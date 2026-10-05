import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import config from "../config";

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err?.message || err);

  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errorDetails: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = "Validation failed";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err?.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate value. This record already exists";
      errorDetails = { fields: err.meta?.target };
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Related record was not found";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Record not found";
    }
  } else if (err?.name === "PrismaClientValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data provided";
  } else if (err?.name === "PrismaClientInitializationError") {
    statusCode = httpStatus.BAD_GATEWAY;
    message = "Cannot reach the database. Check DATABASE_URL";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails:
      errorDetails ??
      (config.env === "production"
        ? undefined
        : { name: err.name, stack: err.stack }),
  });
};
