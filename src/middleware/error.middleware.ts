/**
 * @file error.middleware.ts
 * @description Global error handling middleware.
 * Catches all errors, formats them into a consistent JSON structure, and handles specific error types (AppError, Mongoose).
 */
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

// Global Error Handler
// Destination: Used in src/server.ts as the last middleware.
// Must be the last middleware used in app.ts.
// Differentiates between operational errors (AppError) and programming errors.
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If development, log the full error
  if (process.env.NODE_ENV === "development") {
    logger.error(err);
  }

  // If it's a known operational error (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // If it's a Mongoose error (CastError, ValidationError, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "fail",
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    return res.status(400).json({
      status: "fail",
      message: messages.join(". "),
    });
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return res.status(400).json({
      status: "fail",
      message: `Duplicate field value: ${value}. Please use another value!`,
    });
  }

  // Generic Error (500)
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
};
