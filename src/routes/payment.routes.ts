/**
 * @file payment.routes.ts
 * @description Routes for payment processing.
 */
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import checkAuth from "../middleware/auth.middleware";
import express from "express";

const router = Router();

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Process a mock payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameIds]
 *             properties:
 *               gameIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 orderId: { type: string }
 *                 message: { type: string }
 */
import { createCheckoutSessionValidator } from "../validators/payment.validator";

router.post(
  "/checkout",
  checkAuth,
  createCheckoutSessionValidator,
  paymentController.createCheckoutSession
);

export default router;
