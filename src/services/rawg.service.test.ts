/**
 * @file rawg.service.test.ts
 * @description Unit tests for RAWG Service.
 * Mocks axios and node-cache to ensure no external requests are made.
 * Destination: Validation of src/services/rawg.service.ts
 */
import axios from "axios";
import { AppError } from "../utils/AppError";

// Mock node-cache
jest.mock("node-cache", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }));
});

// Mock axios with ES Module structure
const mockGet = jest.fn();
const mockCreate = jest.fn(() => ({
  get: mockGet,
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: mockCreate,
    isAxiosError: jest.fn((payload) => payload?.isAxiosError === true),
  },
}));

// Mock logger
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("RAWG Service", () => {
  let searchGames: any;
  let getGameDetails: any;
  let getScreenshots: any;

  beforeAll(() => {
    // Require service AFTER mocking
    const service = require("../services/rawg.service");
    searchGames = service.searchGames;
    getGameDetails = service.getGameDetails;
    getScreenshots = service.getScreenshots;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchGames", () => {
    it("should return a list of games when API call is successful", async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: "Game 1",
              background_image: "url1",
              rating: 4.5,
              platforms: [{ platform: { name: "PC" } }],
              genres: [{ name: "Action" }],
              released: "2023-01-01",
              metacritic: 85,
            },
          ],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await searchGames("Game 1");

      expect(mockCreate).toHaveBeenCalled(); // Axios instance created
      expect(mockGet).toHaveBeenCalledWith("/games", expect.any(Object));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Game 1");
      expect(result[0].rawgId).toBe(1);
    });

    it("should throw AppError when API call fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      await expect(searchGames("Game 1")).rejects.toThrow(AppError);
    });
  });

  describe("getGameDetails", () => {
    it("should return game details when API call is successful", async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: "Game 1",
          description_raw: "Desc",
          background_image: "url1",
          platforms: [{ platform: { name: "PC" } }],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getGameDetails(1);

      expect(mockGet).toHaveBeenCalledWith("/games/1");
      expect(result.name).toBe("Game 1");
      expect(result.description).toBe("Desc");
    });

    it("should throw AppError when API call fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      await expect(getGameDetails(1)).rejects.toThrow(AppError);
    });
  });

  describe("getScreenshots", () => {
    it("should return screenshots list when API call is successful", async () => {
      const mockResponse = {
        data: {
          results: [{ image: "img1" }, { image: "img2" }],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getScreenshots(1);

      expect(mockGet).toHaveBeenCalledWith("/games/1/screenshots", {
        params: { page_size: 6 },
      });
      expect(result).toEqual(["img1", "img2"]);
    });

    it("should return empty array when API call fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      const result = await getScreenshots(1);
      expect(result).toEqual([]);
    });
  });
});
