/**
 * @file user.service.test.ts
 * @description Unit tests for user service.
 * Target: src/services/user.service.ts
 */
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../src/services/user.service";
import User from "../src/models/user.model";
import Game from "../src/models/game.model";
import { AppError } from "../src/utils/AppError";

// Mock models
jest.mock("../src/models/user.model");
jest.mock("../src/models/game.model");

const mockUserId = "507f1f77bcf86cd799439011";
const mockGameId = "507f1f77bcf86cd799439012";
const mockGameId2 = "507f1f77bcf86cd799439013";

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addToWishlist", () => {
    it("should add game to wishlist if user and game exist and not duplicate", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [],
        save: jest.fn(),
      } as any;
      const mockGame = { _id: mockGameId } as any;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Game.findById as jest.Mock).mockResolvedValue(mockGame);

      const result = await addToWishlist(mockUserId, mockGameId);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Game.findById).toHaveBeenCalledWith(mockGameId);
      expect(mockUser.wishlist).toHaveLength(1);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Game added to wishlist");
    });

    it("should throw error if user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });

    it("should throw error if game not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: mockUserId });
      (Game.findById as jest.Mock).mockResolvedValue(null);

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("Game not found", 404)
      );
    });

    it("should throw error if game already in wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [mockGameId],
      } as any;
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Game.findById as jest.Mock).mockResolvedValue({ _id: mockGameId });

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("Game already in wishlist", 400)
      );
    });
  });

  describe("removeFromWishlist", () => {
    it("should remove game from wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [mockGameId, mockGameId2],
        save: jest.fn(),
      } as any;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await removeFromWishlist(mockUserId, mockGameId);

      expect(mockUser.wishlist).toHaveLength(1);
      expect(mockUser.wishlist[0]).toBe(mockGameId2);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Game removed from wishlist");
    });

    it("should throw error if user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(removeFromWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });

  describe("getWishlist", () => {
    it("should return populated wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [{ title: "Game 1" }, { title: "Game 2" }],
      } as any;

      const mockPopulate = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const result = await getWishlist(mockUserId);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockPopulate).toHaveBeenCalledWith("wishlist");
      expect(result).toHaveLength(2);
    });

    it("should throw error if user not found", async () => {
      const mockPopulate = jest.fn().mockResolvedValue(null);
      (User.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await expect(getWishlist(mockUserId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });
});
