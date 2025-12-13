/**
 * @file order.controller.ts
 * @description Controller for order-related operations.
 * Delegates logic to OrderService.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getUserOrders } from "../services/order.service";
import { AppError } from "../utils/AppError";

/**
 * Get logged-in user's orders
 * @route GET /api/orders/my-orders
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const orders = await getUserOrders(userId);

  res.status(200).json(orders);
});
