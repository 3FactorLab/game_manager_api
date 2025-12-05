/**
 * @file db.ts
 * @description Handles the connection to the MongoDB database using Mongoose.
 */
import mongoose from "mongoose";
import logger from "../utils/logger";

// Function to connect to the Database
// Destination: Used in src/server.ts to initialize the DB connection on startup, and in src/seeds/seed.ts.
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(err);
    process.exit(1); // detiene la app si falla DB
  }
};

export default connectDB;
