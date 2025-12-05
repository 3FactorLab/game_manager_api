/**
 * @file payment.validator.ts
 * @description Validation rules for payment requests.
 */
import { body } from "express-validator";
import { validateResult } from "../middleware/validation.middleware";

// Destination: Used in src/routes/payment.routes.ts to validate POST /checkout requests
export const createCheckoutSessionValidator = [
  body("gameIds")
    .isArray({ min: 1 })
    .withMessage("gameIds must be a non-empty array"),
  body("gameIds.*")
    .isString()
    .withMessage("Each game ID must be a string")
    .notEmpty()
    .withMessage("Game ID cannot be empty"),
  validateResult,
];
