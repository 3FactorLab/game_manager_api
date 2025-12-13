/**
 * @file fix-prices.ts
 * @description Backfill script to fix missing prices (Price = 0).
 * Re-scans RAWG data for Steam URLs using improved regex.
 * Fetches Steam pricing and updates DB + games.json.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import { getGameDetails } from "../services/rawg.service";
import {
  extractSteamAppId,
  getSteamGameDetails,
  searchSteamGames,
} from "../services/steam.service";

dotenv.config();

const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runFix = async () => {
  logger.info("🔧 Starting Price Fix Script...");

  try {
    await connectDB();

    // 1. Find games with Price = 0 (Free) that are NOT explicitly free-to-play
    // We assume most games should have a price or be marked properly.
    // For now, let's target all games with price 0.
    const freeGames = await Game.find({ price: 0, rawgId: { $ne: null } });

    logger.info(`📚 Found ${freeGames.length} free games to verify.`);

    let updatedCount = 0;
    const updatesMap = new Map<number, any>(); // rawgId -> newPriceData

    for (const game of freeGames) {
      if (!game.rawgId) continue;

      try {
        await delay(600); // Rawg limit
        const details = await getGameDetails(game.rawgId);

        // Try to find Steam Store again
        const steamStore = details.stores.find((s) =>
          s.url.includes("store.steampowered.com")
        );
        let steamAppId: number | null = null;

        if (steamStore) {
          const extractedId = extractSteamAppId(steamStore.url);
          if (extractedId) steamAppId = extractedId;
        }

        // Fallback: Search Steam by Title if no ID found from URL
        if (!steamAppId) {
          const searchId = await searchSteamGames(game.title);
          if (searchId) {
            steamAppId = searchId;
            logger.info(`🔍 Search Match: ${game.title} -> ID ${steamAppId}`);
          }
        }

        if (steamAppId) {
          // We found an ID! Let's check price
          await delay(400); // Steam limit
          const steamData = await getSteamGameDetails(steamAppId);

          if (steamData?.price_overview) {
            const finalPrice = steamData.price_overview.final / 100;

            if (finalPrice > 0) {
              // UPDATE GAME
              game.price = finalPrice;
              game.originalPrice = steamData.price_overview.initial / 100;
              game.discount = steamData.price_overview.discount_percent;
              game.steamAppId = steamAppId;
              game.onSale = game.discount > 0;

              await game.save();

              updatesMap.set(game.rawgId, {
                price: game.price,
                originalPrice: game.originalPrice,
                discount: game.discount,
                steamAppId: game.steamAppId,
                onSale: game.onSale,
              });

              updatedCount++;
              logger.info(
                `✅ FIXED: ${game.title} => $${finalPrice} (AppID: ${steamAppId})`
              );
            } else {
              logger.info(
                `ℹ️  Verified Free: ${game.title} (AppID: ${steamAppId})`
              );
            }
          }
        } else {
          logger.warn(
            `❌ No Steam ID found (URL/Search failed) for: ${game.title}`
          );
        }
      } catch (err: any) {
        logger.error(`Error processing ${game.title}: ${err.message}`);
      }
    }

    // Update games.json
    if (updatedCount > 0) {
      logger.info(`\n💾 Syncing ${updatedCount} price fixes to games.json...`);
      const currentContent = await fs.readJson(GAMES_JSON_PATH);

      const updatedContent = currentContent.map((item: any) => {
        if (updatesMap.has(item.rawgId)) {
          return { ...item, ...updatesMap.get(item.rawgId) };
        }
        return item;
      });

      await fs.writeJson(GAMES_JSON_PATH, updatedContent, { spaces: 4 });
      logger.info("✅ games.json updated.");
    }

    logger.info("🏁 Fix Complete.");
    process.exit(0);
  } catch (error) {
    logger.error("Fatal:", error);
    process.exit(1);
  }
};

runFix();
