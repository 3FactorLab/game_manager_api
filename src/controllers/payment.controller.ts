/**
 * @file payment.controller.ts
 * @description Controller for handling payment requests.
 */
import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/payment.service";
import Game from "../models/game.model";
import User from "../models/user.model";
import { CreateCheckoutSessionDto } from "../dtos";

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
