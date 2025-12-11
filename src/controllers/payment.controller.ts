/**
 * @file payment.controller.ts
 * @description Controller for handling payment requests.
 */
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as paymentService from "../services/payment.service";
import * as mailService from "../services/mail.service";
import Game from "../models/game.model";
import User from "../models/user.model";
import Order from "../models/order.model";
import UserGame from "../models/userGame.model";
import { CreateCheckoutSessionDto } from "../dtos";
import { OrderStatus } from "../types/enums";
import { AppError } from "../utils/AppError";

// Destination: Used in src/routes/payment.routes.ts (POST /checkout)
export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gameIds }: CreateCheckoutSessionDto = req.body;
    const userId = req.userData?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch games to ensure they exist and get prices
    const games = await Game.find({ _id: { $in: gameIds } });

    if (games.length !== gameIds.length) {
      return res.status(404).json({ message: "Some games not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process mock payment
    const result = await paymentService.processPayment(user, games);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Simulates a purchase without real payment processing.
 * Generates license keys, updates library, creates order history, and sends email.
 * Route: POST /api/payment/simulate
 */
export const simulatePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gameIds }: CreateCheckoutSessionDto = req.body;
    const userId = req.userData?.id;

    if (!userId) throw new AppError("Unauthorized", 401);

    // 1. Fetch User and Games
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const games = await Game.find({ _id: { $in: gameIds } });
    if (games.length !== gameIds.length) {
      throw new AppError("One or more games not found", 404);
    }

    // 2. Generate Keys and Prepare Order Items
    let totalAmount = 0;
    const orderItems = games.map((game) => {
      const licenseKey = `GAME-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}-${new Date().getFullYear()}`;
      const price = game.price || 0;
      totalAmount += price;

      return {
        game: game._id,
        title: game.title,
        price: price,
        licenseKey: licenseKey,
        image: game.image, // for email
      };
    });

    // 3. Create Order Record (History)
    const order = new Order({
      user: userId,
      items: orderItems.map((item) => ({
        game: item.game,
        title: item.title,
        price: item.price,
        licenseKey: item.licenseKey,
      })),
      totalAmount,
      status: OrderStatus.COMPLETED, // Auto-complete for simulation
    });
    await order.save();

    // 4. Update User Library (UserGame)
    // Avoid duplicates if user already owns (though frontend should block this, backend robustness is good)
    for (const item of orderItems) {
      const existingOwnership = await UserGame.findOne({
        user: userId,
        game: item.game,
      });
      if (!existingOwnership) {
        await UserGame.create({
          user: userId,
          game: item.game,
          isOwned: true,
          hoursPlayed: 0,
        });
      }
    }

    // 5. Send Email
    // Don't await email to prevent blocking response if SMTP is slow?
    // Actually better to await to catch errors or fire-and-forget?
    // User requested "confirmation email sent", usually async is better for UX but we want to confirm it works.
    // Given the requirement "Send Email", I'll await it but catch errors so checkout succeeds even if email fails (logged in service).
    await mailService.sendPurchaseConfirmation(
      user.email,
      user.username,
      order._id.toString(),
      orderItems,
      totalAmount
    );

    res.status(200).json({
      success: true,
      message: "Purchase simulated successfully",
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};
