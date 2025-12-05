/**
 * @file collection.validator.ts
 * @description Validation rules for user collection operations.
 */
import { body } from "express-validator";
import { validateResult } from "../middleware/validation.middleware";
import { GameStatus } from "../types/enums";

// Destination: Used in src/routes/collection.routes.ts (POST /)
export const addToCollectionValidator = [
  body("gameId").notEmpty().withMessage("Game ID is required"),
  body("status")
    .optional()
    .isIn(Object.values(GameStatus))
    .withMessage("Invalid status"),
  body("hoursPlayed")
    .optional()
    .isNumeric()
    .withMessage("Hours played must be a number")
    .custom((value) => value >= 0)
    .withMessage("Hours played cannot be negative"),
  body("score")
    .optional()
    .isNumeric()
    .custom((value) => value >= 0 && value <= 10)
    .withMessage("Score must be between 0 and 10"),
  body("review").optional().isString().withMessage("Review must be text"),
  validateResult,
];

// Destination: Used in src/routes/collection.routes.ts (PUT /:id)
export const updateCollectionItemValidator = [
  body("status")
    .optional()
    .isIn(Object.values(GameStatus))
    .withMessage("Invalid status"),
  body("hoursPlayed")
    .optional()
    .isNumeric()
    .withMessage("Hours played must be a number")
    .custom((value) => value >= 0)
    .withMessage("Hours played cannot be negative"),
  body("score")
    .optional()
    .isNumeric()
    .custom((value) => value >= 0 && value <= 10)
    .withMessage("Score must be between 0 and 10"),
  body("review").optional().isString().withMessage("Review must be text"),
  validateResult,
];
