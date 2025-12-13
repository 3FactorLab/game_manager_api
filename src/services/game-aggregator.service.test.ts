/**
 * @file game-aggregator.service.test.ts
 * @description Unit tests for GameAggregator Service.
 * Verifies data enrichment from RAWG and Steam, including fallback scenarios.
 */
import { getCompleteGameData } from "./game-aggregator.service";
import * as rawgService from "./rawg.service";
import * as steamService from "./steam.service";
import { AppError } from "../utils/AppError";

// Mock dependent services
jest.mock("./rawg.service");
jest.mock("./steam.service");
jest.mock("../utils/logger"); // Silence logger

describe("Game Aggregator Service", () => {
  const mockRawgData: any = {
    rawgId: 123,
    name: "Test Game",
    description: "A test game",
    cover: "image.jpg",
    genres: ["Action"],
    platforms: ["PC"],
    developers: ["Dev"],
    publishers: ["Pub"],
    released: "2024-01-01",
    metacritic: 85,
    rating: 4.5,
    stores: [
      {
        name: "Steam",
        url: "https://store.steampowered.com/app/12345/Test_Game/",
      },
    ],
  };

  const mockSteamData = {
    price_overview: {
      final: 1999, // $19.99
      currency: "USD",
      discount_percent: 0,
      initial: 1999,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should combine RAWG and Steam data successfully", async () => {
    // Arrange
    (rawgService.getGameDetails as jest.Mock).mockResolvedValue(mockRawgData);
    (steamService.extractSteamAppId as jest.Mock).mockReturnValue(12345);
    (steamService.getSteamGameDetails as jest.Mock).mockResolvedValue(
      mockSteamData
    );

    // Act
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game"); // From RAWG
    expect(result.steamAppId).toBe(12345); // Extracted
    expect(result.price).toBe(1999); // From Steam
    expect(result.currency).toBe("USD");
  });

  it("should return RAWG data only if Steam ID is missing", async () => {
    // Arrange
    const noSteamRawg = { ...mockRawgData, stores: [] };
    (rawgService.getGameDetails as jest.Mock).mockResolvedValue(noSteamRawg);

    // Act
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game");
    expect(result.steamAppId).toBeUndefined();
    expect(result.price).toBeUndefined();
  });

  it("should return RAWG data (partial) if Steam API fails", async () => {
    // Arrange
    (rawgService.getGameDetails as jest.Mock).mockResolvedValue(mockRawgData);
    (steamService.extractSteamAppId as jest.Mock).mockReturnValue(12345);
    (steamService.getSteamGameDetails as jest.Mock).mockRejectedValue(
      new Error("Steam Down")
    );

    // Act
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game");
    expect(result.price).toBeUndefined(); // Should fallback gracefully
  });

  it("should throw 404 if game not found in RAWG", async () => {
    // Arrange
    (rawgService.getGameDetails as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getCompleteGameData(999)).rejects.toThrow("Game not found");
  });
});
