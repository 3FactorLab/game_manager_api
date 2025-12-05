/**
 * @file auth.validator.ts
 * @description Validation rules for authentication requests.
 * Uses express-validator for registration, login, and profile updates.
 */
import { body } from "express-validator";
import { validateResult } from "../middleware/validation.middleware";

// Rules for Registration
export const registerValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email").trim().isEmail().withMessage("Invalid email format"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be 'user' or 'admin'"),
  validateResult, // Call the referee at the end
];

// Rules for Login
export const loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email format"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  validateResult,
];

// Rules for Profile Update
export const updateValidator = [
  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("email").optional().trim().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateResult,
];
