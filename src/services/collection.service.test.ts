/**
 * @file collection.service.test.ts
 * @description Unit tests for collection service.
 * Target: src/services/collection.service.ts
 */
import {
  addToCollection,
  getCollection,
  updateCollectionItem,
  removeFromCollection,
} from "../services/collection.service";
import UserGame from "../models/userGame.model";
import { GameStatus } from "../types/enums";
import { AppError } from "../utils/AppError";
import * as GameService from "../services/game.service";

// Mock UserGame model
jest.mock("../models/userGame.model");
// Mock GameService
jest.mock("../services/game.service");

describe("Collection Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCollection", () => {
    it("should add a game to the collection if not already present", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameId = "507f1f77bcf86cd799439012";
      const mockData = { status: GameStatus.PLAYING };

      (UserGame.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedItem = {
        _id: "507f1f77bcf86cd799439013",
        user: mockUserId,
        game: mockGameId,
        ...mockData,
      };
      (UserGame.create as jest.Mock).mockResolvedValue(mockSavedItem);

      const result = await addToCollection(mockUserId, mockGameId, mockData);

      expect(UserGame.findOne).toHaveBeenCalledWith({
        user: mockUserId,
        game: mockGameId,
      });
      expect(result).toEqual(mockSavedItem);
    });

    it("should throw an error if the game is already in the collection", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameId = "507f1f77bcf86cd799439012";

      (UserGame.findOne as jest.Mock).mockResolvedValue({ _id: "item123" });

      await expect(
        addToCollection(mockUserId, mockGameId, { status: GameStatus.PLAYING })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getCollection", () => {
    it("should return a list of games with pagination", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockItems = [{ _id: "item1", game: { title: "Game 1" } }];
      const mockCountResult = [{ total: 1 }];

      (UserGame.aggregate as jest.Mock)
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockItems);

      const result = await getCollection(mockUserId, 1, 10);

      expect(UserGame.aggregate).toHaveBeenCalledTimes(2);
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe("updateCollectionItem", () => {
    it("should update an item if it exists and belongs to the user", async () => {
      const mockId = "507f1f77bcf86cd799439013";
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockUpdates = { status: GameStatus.COMPLETED, score: 10 };

      const mockUpdatedItem = { _id: mockId, ...mockUpdates };

      // Mock chain: findOneAndUpdate(...).populate(...)
      const mockPopulate = jest.fn().mockResolvedValue(mockUpdatedItem);
      (UserGame.findOneAndUpdate as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const result = await updateCollectionItem(
        mockId,
        mockUserId,
        mockUpdates
      );

      expect(UserGame.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId, user: mockUserId },
        mockUpdates,
        { new: true }
      );
      expect(mockPopulate).toHaveBeenCalledWith("game");
      expect(result).toEqual(mockUpdatedItem);
    });

    it("should throw an error if item not found", async () => {
      const mockPopulate = jest.fn().mockResolvedValue(null);
      (UserGame.findOneAndUpdate as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await expect(
        updateCollectionItem(
          "507f1f77bcf86cd799439013",
          "507f1f77bcf86cd799439011",
          {}
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe("removeFromCollection", () => {
    it("should remove an item if it exists", async () => {
      const mockId = "507f1f77bcf86cd799439013";
      const mockUserId = "507f1f77bcf86cd799439011";

      (UserGame.findOneAndDelete as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      await removeFromCollection(mockId, mockUserId);

      expect(UserGame.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockId,
        user: mockUserId,
      });
    });

    it("should throw an error if item not found", async () => {
      (UserGame.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(
        removeFromCollection(
          "507f1f77bcf86cd799439013",
          "507f1f77bcf86cd799439011"
        )
      ).rejects.toThrow(AppError);
    });
  });
});
