/**
 * @file payment.service.test.ts
 * @description Unit tests for payment service.
 * Target: src/services/payment.service.ts
 */
import { processPayment } from "../src/services/payment.service";
import Order from "../src/models/order.model";
import UserGame from "../src/models/userGame.model";
import { OrderStatus, GameStatus } from "../src/types/enums";

// Mock models
jest.mock("../src/models/order.model");
jest.mock("../src/models/userGame.model");

describe("Payment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processPayment", () => {
    it("should process payment, create order, and add games to library", async () => {
      const mockUser = { _id: "user123" } as any;
      const mockGames = [
        { _id: "game1", price: 10 },
        { _id: "game2", price: 20 },
      ] as any[];

      // Mock Order.create
      const mockOrder = {
        _id: "order123",
        user: "user123",
        games: ["game1", "game2"],
        totalAmount: 30,
        status: OrderStatus.COMPLETED,
      };
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);

      // Mock UserGame.findOneAndUpdate
      (UserGame.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await processPayment(mockUser, mockGames);

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "user123",
          totalAmount: 30,
          status: OrderStatus.COMPLETED,
        })
      );

      expect(UserGame.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order123");
    });

    it("should throw error if no games provided", async () => {
      const mockUser = { _id: "user123" } as any;
      await expect(processPayment(mockUser, [])).rejects.toThrow(
        "No games provided"
      );
    });
  });
});
