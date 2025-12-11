/**
 * @file server.ts
 * @description Main entry point of the application. Configures Express, middleware, routes, and error handling.
 */
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import gameRoutes from "./routes/game.routes";
import collectionRoutes from "./routes/collection.routes";
import paymentRoutes from "./routes/payment.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware";
import logger from "./utils/logger";
import { initCronJobs } from "./services/cron.service";
import publicGameRoutes from "./routes/publicGame.routes";
import fs from "fs-extra";

dotenv.config(); // Load environment variables

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Connect to Database
// Connect to Database
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Initialize Cron Jobs
// Initialize Cron Jobs (only if not testing)
if (process.env.NODE_ENV !== "test") {
  initCronJobs();
}

const app = express();
const PORT = process.env.PORT || 3500;
// Security Middleware
// Helmet: Adds various HTTP headers to secure the app
// CORS: Enables Cross-Origin Resource Sharing
// Morgan: Logs HTTP requests for debugging
// RateLimit: Prevents brute-force attacks by limiting repeated requests
// Security Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev")); // Logger

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 1000; // Raised 10x to allow higher request volume per IP

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
// Mounts all API routes under /api prefix
// Static files served from /uploads
// Swagger documentation served at /api-docs
app.use("/api/public/games", publicGameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler (Must be last)
app.use(errorHandler);

// Export app for testing
// Destination: Used by integration tests (e.g., supertest in tests/*.test.ts) to avoid starting the server port during testing.
export default app;

// Only listen if executed directly (not if imported by tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}
