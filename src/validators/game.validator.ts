/**
 * @file game.validator.ts
 * @description Validation rules for game and collection requests.
 * Uses express-validator for game creation, updates, and collection management.
 */
import { body, query } from "express-validator";
import { validateResult } from "../middleware/validation.middleware";
import { GameStatus } from "../types/enums";

export const createGameValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("platform").notEmpty().withMessage("Platform is required"),
  body("developer").optional().isString(),
  body("publisher").optional().isString(),
  validateResult,
];

export const updateCatalogGameValidator = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("genre").optional().notEmpty().withMessage("Genre cannot be empty"),
  body("platform")
    .optional()
    .notEmpty()
    .withMessage("Platform cannot be empty"),
  body("developer").optional().isString(),
  body("publisher").optional().isString(),
  validateResult,
];

export const searchGameValidator = [
  query("query").optional().isString().trim(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("genre").optional().isString().trim(),
  query("platform").optional().isString().trim(),
  validateResult,
];

export const searchExternalValidator = [
  query("q")
    .notEmpty()
    .withMessage("Search query is required")
    .isString()
    .trim(),
  validateResult,
];

export const validateCreateFromRAWG = [
  body("rawgId").isInt().withMessage("RAWG ID must be an integer"),
  body("steamAppId")
    .optional()
    .isInt()
    .withMessage("Steam App ID must be an integer"),
  validateResult,
];

export const validateCreateGame = createGameValidator;

export const validateSearchExternal = searchExternalValidator;
