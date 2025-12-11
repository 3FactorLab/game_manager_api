/**
 * @file order.controller.ts
 * @description Controller for handling order-related requests.
 */
import { Request, Response, NextFunction } from "express";
import Order from "../models/order.model";
import { AppError } from "../utils/AppError";

// Get My Orders
// Destination: Used in user.routes.ts (GET /orders/my-orders or similar).
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userData?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    // Fetch orders for the user, sorted by newest first
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    // .populate("items.game"); // Optional: if we want game details not in snapshot
    // Since we store snapshot in items, we might not need populate unless we want current images?
    // Our items array has title, price, etc.

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
