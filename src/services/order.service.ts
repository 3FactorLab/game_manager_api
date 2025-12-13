/**
 * @file order.service.ts
 * @description Service layer for Order operations.
 * Handles retrieval of user order history.
 */
import Order from "../models/order.model";
import { AppError } from "../utils/AppError";

/**
 * Retrieves all orders for a specific user.
 *
 * @param userId - The ID of the user
 * @returns {Promise<any[]>} List of orders
 * @throws {AppError} If query fails (though unlikely with simple find)
 */
export const getUserOrders = async (userId: string) => {
  // Simple query for now, but abstraction allows for future complexity
  // like filtering, pagination, or population without changing controller.
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders;
};
