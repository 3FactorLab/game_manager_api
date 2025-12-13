/**
 * @file import-pc-games.ts
 * @description Bulk import script for 100 popular PC games.
 * Fetches from RAWG (Metadata) and Steam (Price).
 * Features:
 * - Smart Fill: Only imports NEW games until target (100) is reached.
 * - Dry Run: Default mode, generates 'import-preview.json'.
 * - Commit: Use --commit to save to DB and games.json.
 * - Safety: Upsert only, no deletions.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game, { IGame } from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import {
  fetchPopularPCGames,
  getGameDetails,
  getScreenshots,
} from "../services/rawg.service";
import {
  extractSteamAppId,
  getSteamGameDetails,
} from "../services/steam.service";

dotenv.config();

const TARGET_NEW_GAMES = 200;
const MAX_PAGES = 25; // Increased to ensure finding 200 new games
const PAGE_SIZE = 40;
const PREVIEW_FILE = "import-preview.json";
const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");

// Helper to delay execution (avoid API rate limits)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runImport = async () => {
  const isCommit = process.argv.includes("--commit");
  const mode = isCommit
    ? "🔴 COMMIT MODE (Writes to DB)"
    : "🟢 DRY RUN (Simulation)";

  logger.info("=".repeat(60));
  logger.info(`🚀 Starting Bulk Import: Top PC Games`);
  logger.info(`🎯 Target: ${TARGET_NEW_GAMES} NEW games`);
  logger.info(`🛠️  Mode: ${mode}`);
  logger.info("=".repeat(60));

  try {
    await connectDB();

    let importedCount = 0;
    let page = 1;
    let processedRawgIds = new Set<number>();
    const newGamesCollection: Partial<IGame>[] = [];

    // Load existing RAWG IDs from DB to filter duplicates efficiently
    const existingDocs = await Game.find({}, { rawgId: 1, title: 1 });
    const existingRawgIds = new Set(existingDocs.map((g) => g.rawgId));
    const existingTitles = new Set(
      existingDocs.map((g) => g.title.toLowerCase())
    );

    logger.info(`📚 Database contains ${existingDocs.length} games.`);

    while (importedCount < TARGET_NEW_GAMES && page <= MAX_PAGES) {
      logger.info(`\n📄 Fetching Page ${page} from RAWG...`);

      const candidates = await fetchPopularPCGames(page, PAGE_SIZE);

      for (const candidate of candidates) {
        if (importedCount >= TARGET_NEW_GAMES) break;

        // SKIP if already exists in DB
        if (
          existingRawgIds.has(candidate.rawgId) ||
          existingTitles.has(candidate.title.toLowerCase())
        ) {
          process.stdout.write("."); // Compact progress for skips
          continue;
        }

        // SKIP if we already processed this ID in this run (handling overlaps)
        if (processedRawgIds.has(candidate.rawgId)) continue;

        processedRawgIds.add(candidate.rawgId);

        logger.info(
          `\n🔍 Processing NEW candidate: ${candidate.title} (ID: ${candidate.rawgId})`
        );

        try {
          // 1. Fetch Full Details from RAWG
          // Add delay to respect rate limits (approx 1 request per sec)
          await delay(800);
          const details = await getGameDetails(candidate.rawgId);
          const screenshots = await getScreenshots(candidate.rawgId);

          // 2. Steam Integration (Pricing)
          let steamData: any = null;
          let steamAppId: number | null = null;

          // Try to find Steam URL in stores
          const steamStore = details.stores.find((s) =>
            s.url.includes("store.steampowered.com")
          );

          if (steamStore) {
            steamAppId = extractSteamAppId(steamStore.url);
            if (steamAppId) {
              await delay(500); // Delay for Steam API
              steamData = await getSteamGameDetails(steamAppId);
            }
          }

          // 3. Map to IGame Schema
          const gamePayload: any = {
            title: details.name,
            description: details.description || "",
            developer: details.developers[0] || "Unknown",
            publisher: details.publishers[0] || "Unknown",
            genre: details.genres[0] || "Action", // Validation: First genre as string
            platform: "PC", // Validation: Fixed to PC
            released: new Date(details.released),
            image: details.cover,
            screenshots: screenshots.slice(0, 6), // Limit to 6
            score: details.rating ? Math.round(details.rating * 2) : 0, // 0-5 to 0-10
            metacritic: details.metacritic,
            rawgId: details.rawgId,
            steamAppId: steamAppId,
            // Steam Pricing
            price: steamData?.price_overview?.final
              ? steamData.price_overview.final / 100
              : 0,
            originalPrice: steamData?.price_overview?.initial
              ? steamData.price_overview.initial / 100
              : 0,
            discount: steamData?.price_overview?.discount_percent || 0,
            currency: steamData?.price_overview?.currency || "USD",
            onSale: (steamData?.price_overview?.discount_percent || 0) > 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // 4. Action
          if (isCommit) {
            // Upsert to DB
            await Game.updateOne(
              { rawgId: gamePayload.rawgId },
              { $set: gamePayload },
              { upsert: true }
            );
            logger.info(`✅ Upserted to DB: ${gamePayload.title}`);

            // Add to list for JSON file
            newGamesCollection.push(gamePayload);
          } else {
            logger.info(
              `📝 [Dry Run] Prepared: ${gamePayload.title} | Price: ${gamePayload.price}`
            );
            newGamesCollection.push(gamePayload);
          }

          importedCount++;
        } catch (err: any) {
          logger.error(
            `❌ Failed to process ${candidate.title}: ${err.message}`
          );
          // Continue to next candidate
        }
      }

      page++;
    }

    // FINISHING UP

    if (isCommit) {
      // 5. Save to games.json (Append Only)
      if (newGamesCollection.length > 0) {
        logger.info(
          `\n💾 Persisting ${newGamesCollection.length} games to games.json...`
        );

        try {
          const currentFileContent = await fs.readJson(GAMES_JSON_PATH);

          if (
            !Array.isArray(currentFileContent) ||
            currentFileContent.length === 0
          ) {
            throw new Error(
              "games.json seems empty or invalid. Aborting write to verify integrity."
            );
          }

          // Append new games
          currentFileContent.push(...newGamesCollection);

          // Write back atomically
          await fs.writeJson(GAMES_JSON_PATH, currentFileContent, {
            spaces: 4,
          });
          logger.info("✅ games.json updated successfully.");
        } catch (fileErr) {
          logger.error(`❌ Error updating games.json: ${fileErr}`);
          logger.warn(
            "⚠️ Data was saved to MongoDB but NOT to games.json. Please check manually."
          );
        }
      }
    } else {
      // Save Preview
      await fs.writeJson(PREVIEW_FILE, newGamesCollection, { spaces: 2 });
      logger.info(`\n📄 Preview saved to ${PREVIEW_FILE}`);
    }

    logger.info("\n" + "=".repeat(60));
    logger.info(`🏁 Import Finished`);
    logger.info(`✨ Successfully processed: ${importedCount} games`);
    if (!isCommit) {
      logger.info(
        `ℹ️  This was a DRY RUN. No changes were made to DB or games.json.`
      );
      logger.info(`👉 Run with --commit to execute.`);
    }
    logger.info("=".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Fatal Error: ${error}`);
    process.exit(1);
  }
};

runImport();
