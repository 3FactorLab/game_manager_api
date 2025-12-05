/**
 * @file game-aggregator.service.ts
 * @description Aggregates game data from multiple sources (RAWG + Steam).
 * Combines metadata from RAWG with pricing from Steam.
 * Destination: Used by game.controller.ts for creating games from external APIs.
 */
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";
import { getGameDetails as getRAWGDetails, GameDetails } from "./rawg.service";
import { getSteamGameDetails, extractSteamAppId } from "./steam.service";

/**
 * Get complete game data by combining RAWG and Steam APIs
 * Destination: Used by game.controller.ts createFromRAWG endpoint.
 *
 * @param rawgId - RAWG game ID
 * @param steamAppId - Optional Steam App ID (if not provided, will try to find from RAWG stores)
 */
export const getCompleteGameData = async (
  rawgId: number,
  steamAppId?: number
) => {
  try {
    // Get data from RAWG
    const rawgData: GameDetails = await getRAWGDetails(rawgId);

    if (!rawgData) {
      throw new AppError("Game not found in RAWG", 404);
    }

    // Initialize complete game data with RAWG info
    const completeData: any = {
      title: rawgData.name,
      description: rawgData.description,
      image: rawgData.cover,
      genre: rawgData.genres[0] || "Unknown",
      platform: rawgData.platforms[0] || "Unknown",
      developer: rawgData.developers[0],
      publisher: rawgData.publishers[0],
      score: rawgData.rating ? Math.round(rawgData.rating * 2) : undefined,
      released: rawgData.released,
      metacritic: rawgData.metacritic,
      screenshots: [],
      rawgId: rawgData.rawgId,
    };

    // Try to get Steam App ID if not provided
    let finalSteamAppId = steamAppId;

    if (!finalSteamAppId && rawgData.stores) {
      // Look for Steam store in RAWG stores data
      const steamStore = rawgData.stores.find(
        (store: { name: string; url: string }) =>
          store.name.toLowerCase().includes("steam")
      );

      if (steamStore && steamStore.url) {
        const extractedId = extractSteamAppId(steamStore.url);
        if (extractedId) {
          finalSteamAppId = extractedId;
        }
      }
    }

    // Get pricing from Steam if App ID is available
    if (finalSteamAppId) {
      try {
        const steamData = await getSteamGameDetails(finalSteamAppId);

        if (steamData && steamData.price_overview) {
          completeData.steamAppId = finalSteamAppId;
          completeData.price = steamData.price_overview.final;
          completeData.currency = steamData.price_overview.currency;
          completeData.discount = steamData.price_overview.discount_percent;
          completeData.onSale = steamData.price_overview.discount_percent > 0;
          completeData.originalPrice = steamData.price_overview.initial;
        }
      } catch (error) {
        // Log but don't fail if Steam data is unavailable
        logger.warn(
          `Could not fetch Steam data for App ID ${finalSteamAppId}: ${error}`
        );
      }
    }

    return completeData;
  } catch (error) {
    logger.error(`Error aggregating game data: ${error}`);
    throw error instanceof AppError
      ? error
      : new AppError("Failed to aggregate game data", 500);
  }
};
