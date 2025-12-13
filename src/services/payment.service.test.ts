/**
 * @file payment.service.test.ts
 * @description Unit tests for payment service.
 * Target: src/services/payment.service.ts
 */
import { simulatePurchase } from "../services/payment.service";
import Order from "../models/order.model";
import UserGame from "../models/userGame.model";
import User from "../models/user.model";
import Game from "../models/game.model";
import * as mailService from "../services/mail.service";
import { OrderStatus } from "../types/enums";
import { AppError } from "../utils/AppError";

// Mock models
jest.mock("../models/order.model");
jest.mock("../models/userGame.model");
jest.mock("../models/user.model");
jest.mock("../models/game.model");
jest.mock("../services/mail.service");

describe("Payment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("simulatePurchase", () => {
    it("should process payment, create order, and add games to library", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameIds = [
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013",
      ];

      const mockUser = {
        _id: mockUserId,
        email: "test@test.com",
        username: "testuser",
      };

      const mockGames = [
        { _id: "507f1f77bcf86cd799439012", price: 10, title: "Game 1" },
        { _id: "507f1f77bcf86cd799439013", price: 20, title: "Game 2" },
      ];

      // Mock Data Fetching
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Game.find as jest.Mock).mockResolvedValue(mockGames);

      // Mock Order.create
      const mockOrder = {
        _id: "order123",
        user: mockUserId,
        status: OrderStatus.COMPLETED,
        toString: () => "order123",
      };
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);

      // Mock UserGame.findOneAndUpdate
      (UserGame.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      // Mock Mail Service
      (mailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(
        true
      );

      const result = await simulatePurchase(mockUserId, mockGameIds);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Game.find).toHaveBeenCalledWith({ _id: { $in: mockGameIds } });

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUserId,
          totalAmount: 30,
          status: OrderStatus.COMPLETED,
        })
      );

      expect(UserGame.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(mailService.sendPurchaseConfirmation).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order123");
    });

    it("should throw error if no games provided", async () => {
      // Validation happens before fetching user/games
      (User.findById as jest.Mock).mockResolvedValue({ _id: "u1" });
      (Game.find as jest.Mock).mockResolvedValue([]);

      await expect(simulatePurchase("u1", [])).rejects.toThrow(
        AppError // Checks for AppError instance
      );
    });

    it("should throw error if user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      await expect(simulatePurchase("u1", ["g1"])).rejects.toThrow(
        "User not found"
      );
    });

    it("should succeed and complete order even if email service fails", async () => {
      // Arrange
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameIds = ["game1"];
      const mockUser = {
        _id: mockUserId,
        email: "test@test.com",
        username: "testuser",
      };
      const mockGames = [{ _id: "game1", price: 10, title: "Game 1" }];

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Game.find as jest.Mock).mockResolvedValue(mockGames);
      (Order.create as jest.Mock).mockResolvedValue({ _id: "order123" });
      (UserGame.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      // Mock Email Failure
      (mailService.sendPurchaseConfirmation as jest.Mock).mockRejectedValue(
        new Error("SMTP Down")
      );

      // Act
      const result = await simulatePurchase(mockUserId, mockGameIds);

      // Assert
      expect(result.success).toBe(true); // Should still succeed
      expect(mailService.sendPurchaseConfirmation).toHaveBeenCalled(); // Should have tried
    });
  });
});
