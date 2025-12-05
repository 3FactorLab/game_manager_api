/**
 * @file validation.middleware.ts
 * @description Middleware to check the result of express-validator chains.
 * Returns a 400 Bad Request if validation errors are present.
 */
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// The Referee: Checks if there were errors and stops the game if so
// Destination: Used in routes (e.g., user.routes.ts) after a chain of validators.
// Used after a chain of validators (e.g., check('email').isEmail()).
export const validateResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
