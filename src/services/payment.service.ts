/**
 * @file payment.service.ts
 * @description Service for handling internal mock payments.
 */
import { IGame } from "../models/game.model";
import Order from "../models/order.model";
import UserGame, { GameStatus } from "../models/userGame.model";
import { IUser } from "../models/user.model";
import logger from "../utils/logger";
import { OrderStatus } from "../types/enums";

/**
 * Simulates a payment process internally.
 * Creates an order and adds games to user's library immediately.
 */
export const processPayment = async (
  user: IUser,
  games: IGame[]
): Promise<{ success: boolean; orderId: string; message: string }> => {
  if (!games || games.length === 0) {
    throw new Error("No games provided for payment");
  }

  // 1. Calculate Total (Simulation)
  const totalAmount = games.reduce((sum, game) => {
    return sum + (game.price || 1999); // Default 19.99 if no price
  }, 0);

  // 2. Create Order (Completed immediately)
  const order = await Order.create({
    user: user._id,
    games: games.map((g) => g._id),
    totalAmount,
    currency: "eur",
    status: OrderStatus.COMPLETED,
    stripePaymentIntentId: `mock_pi_${Date.now()}`, // Fake ID for record
  });

  logger.info(`Mock Order created: ${order._id}`);

  // 3. Add games to User Library
  for (const game of games) {
    await UserGame.findOneAndUpdate(
      { user: user._id, game: game._id },
      {
        $set: {
          isOwned: true,
          status: GameStatus.PENDING,
        },
        $setOnInsert: {
          hoursPlayed: 0,
          isFavorite: false,
        },
      },
      { upsert: true, new: true }
    );
  }

  logger.info(`Games added to library for user ${user._id}`);

  return {
    success: true,
    orderId: order._id.toString(),
    message: "Payment successful (Mock)",
  };
};
