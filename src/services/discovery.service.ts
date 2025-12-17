/**
 * @file discovery.service.ts
 * @description Service for Unified Search (Discovery) with Eager Sync.
 * Searches RAWG, imports new games immediately via Aggregator, and returns local games.
 */
import Game from "../models/game.model";
import { searchGames as searchRAWG } from "./rawg.service";
import { getCompleteGameData } from "./game-aggregator.service";
import { UnifiedGame, DiscoveryResponse } from "../dtos/discovery.dto";
import logger from "../utils/logger";

/**
 * Normalizes a string for comparison (removes spaces, special chars, lowercase)
 */
const normalizeTitle = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Searches for games. If found in RAWG but not locally, imports them first.
 * Then returns the list of local games.
 * @param query - Search term
 */
export const searchAndSync = async (
  query: string,
  filters?: { genre?: string; platform?: string; developer?: string }
): Promise<DiscoveryResponse> => {
  if (!query) return { results: [], source: "local" };

  try {
    // 1. Search Local DB First
    const localQuery: any = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
        { developer: { $regex: query, $options: "i" } }, // Search by Developer
        { platforms: { $regex: query, $options: "i" } }, // Search by Platform
      ],
    };

    // Apply Local Filters
    if (filters) {
      if (filters.genre) {
        localQuery.genre = { $regex: filters.genre, $options: "i" };
      }
      if (filters.developer) {
        localQuery.developer = { $regex: filters.developer, $options: "i" };
      }
      if (filters.platform) {
        localQuery.platforms = { $regex: filters.platform, $options: "i" };
      }
    }

    const localResults = await Game.find(localQuery)
      .limit(20)
      .sort({ isOwned: -1, _id: 1 });

    // 2. Search RAWG (Broader search by title)
    // We search broadly to import potential matches, then strict filter later
    let rawgResults: any[] = [];
    try {
      rawgResults = await searchRAWG(query, 5); // [CHANGE] Removed filters arg
    } catch (err: any) {
      logger.warn(`DiscoveryService: RAWG search failed: ${err.message}`);
      // Continue with just local results
    }

    // 3. Identify New Games to Import
    const existingTitles = new Set(
      localResults.map((g) => normalizeTitle(g.title))
    );
    const existingRawgIds = new Set(
      localResults.map((g) => g.rawgId).filter((id) => id !== undefined)
    );

    const gamesToImport = rawgResults.filter((rawgGame: any) => {
      const normTitle = normalizeTitle(rawgGame.name);
      return (
        !existingTitles.has(normTitle) && !existingRawgIds.has(rawgGame.rawgId)
      );
    });

    // 4. Eager Import (Sync) using Aggregator
    const importPromises = gamesToImport.map(async (rawgGame: any) => {
      try {
        const exists = await Game.exists({ rawgId: rawgGame.rawgId });
        if (exists) return null;

        // Use Aggregator Service to get FULL data (RAWG + Steam Price)
        const completeData = await getCompleteGameData(rawgGame.rawgId);

        // Create Game
        const newGame = new Game({
          title: completeData.title,
          description: completeData.description || "No description available.",
          price: completeData.price || 0,
          currency: completeData.currency || "USD",
          platforms: completeData.platforms,
          genre: completeData.genres || "Unknown",
          type: "game",
          releaseDate: completeData.released
            ? completeData.released.toISOString()
            : "",
          developer: completeData.developer || "Unknown",
          publisher: completeData.publisher || "Unknown",
          image: completeData.image,
          score: completeData.score, // [FIX] Save score
          metacritic: completeData.metacritic, // [FIX] Save metacritic
          assets: {
            cover: completeData.image,
            screenshots: completeData.screenshots || [],
            videos: [],
          },
          rawgId: completeData.rawgId,
          onSale: completeData.onSale || false,
          // Defaults
          isOwned: false,
          favorite: false,
          wishlist: false,
        });

        return await newGame.save();
      } catch (importError: any) {
        logger.error(
          `Failed to import ${rawgGame.name}: ${importError.message}`
        );
        return null;
      }
    });

    const normalizedImports = (await Promise.all(importPromises)).filter(
      (g): g is any => g !== null
    );

    // 6. Strict Post-Filtering (In-Memory) for Imported Games
    // Ensure the imported games actually match the requested filters
    const filteredImports = normalizedImports.filter((game) => {
      if (!filters) return true;

      // Filter by Genre
      if (filters.genre) {
        if (
          !game.genre ||
          !game.genre.toLowerCase().includes(filters.genre.toLowerCase())
        ) {
          return false;
        }
      }

      // Filter by Developer
      if (filters.developer) {
        if (
          !game.developer ||
          !game.developer
            .toLowerCase()
            .includes(filters.developer.toLowerCase())
        ) {
          return false;
        }
      }

      // Filter by Platform
      if (filters.platform) {
        const platformMatch = game.platforms.some((p: string) =>
          p.toLowerCase().includes(filters.platform!.toLowerCase())
        );
        if (!platformMatch) return false;
      }

      return true;
    });

    // 7. Combine & Return
    const allGames = [...localResults, ...filteredImports];

    const unifiedResults: UnifiedGame[] = allGames.map((game) => ({
      _id: game._id.toString(),
      title: game.title,
      image: game.image || "",
      price: game.price,
      currency: game.currency,
      genre: game.genre, // [FIX] Added genre mapping
      stats: {
        score: game.score,
        rating: game.metacritic,
      },
      developer: game.developer,
      publisher: game.publisher,
      isExternal: false, // All considered local now
      inLibrary: false,
      rawgId: game.rawgId,
      platforms: game.platforms,
    }));

    return {
      results: unifiedResults,
      source: "mixed",
    };
  } catch (error: any) {
    logger.error(`DiscoveryService Error: ${error.message}`);
    return { results: [], source: "local" };
  }
};
