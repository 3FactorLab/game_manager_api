/**
 * @file zod.middleware.ts
 * @description Middleware adapter to validate requests using Zod schemas.
 * Acts as a bridge between Express and Zod, formatting errors to match existing frontend expectations.
 * Destination: used in routes to replace express-validator arrays.
 */
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateZod =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse request body against schema
      // We use parseAsync to support async refinements if needed
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to the format expected by our frontend
        // Current format: { errors: [{ msg: "Message", path: "field" }] }
        const formattedErrors = error.issues.map((issue) => ({
          msg: issue.message,
          path: issue.path.join("."),
          location: "body", // Mimic express-validator location
        }));

        return res.status(400).json({ errors: formattedErrors });
      }
      // Pass other errors to global error handler
      next(error);
    }
  };
