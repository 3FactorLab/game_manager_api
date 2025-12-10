/**
 * @file env.ts
 * @description Centralizes environment variable loading and validation.
 * Implements a "Fail-Fast" strategy: the app will crash immediately if critical variables are missing.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Strict validation function
// Ensures that critical environment variables are present. Throws an error if missing.
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(
      `❌ FATAL ERROR: Environment variable ${key} is not defined.`
    );
  }
  return value;
};

// Destination: Used throughout the application (server.ts, auth.service.ts, db.ts) for configuration.
export const PORT: string | number = process.env.PORT || 3500;
export const MONGO_URI: string = getEnv("MONGODB_URI", process.env.MONGO_URI);
export const JWT_SECRET: string = getEnv("JWT_SECRET");
export const RAWG_API_KEY: string = getEnv(
  "RAWG_API_KEY",
  process.env.RAWG_API_KEY
);

// Constants
export const SALT_ROUNDS: number = 10;
export const JWT_EXPIRES_IN: string = "4h";
