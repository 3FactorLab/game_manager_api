/**
 * @file fix-missing-prices.ts
 * @description Repairs missing Steam App IDs and Prices by searching Steam directly.
 * Targets games where RAWG failed to provide a Steam URL.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import {
  getSteamGameDetails,
  searchSteamGames,
} from "../services/steam.service";

dotenv.config();

// Similarity check helper
const isMatch = (dbTitle: string, steamTitle: string) => {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    clean(dbTitle) === clean(steamTitle) ||
    clean(steamTitle).includes(clean(dbTitle))
  );
};

const runFix = async () => {
  logger.info("=".repeat(60));
  logger.info("🔧 Starting Steam Price/ID Repair (v2)");
  logger.info("=".repeat(60));

  try {
    await connectDB();

    const candidates = await Game.find({ steamAppId: null });
    logger.info(`🔍 Found ${candidates.length} games missing Steam Data.`);

    let fixedCount = 0;

    for (const game of candidates) {
      try {
        // Returns: Promise<number | null>
        const steamAppId = await searchSteamGames(game.title);

        if (steamAppId) {
          // Fetch Details to verify title match and get price
          const steamData = await getSteamGameDetails(steamAppId);

          if (steamData && steamData.name) {
            if (isMatch(game.title, steamData.name)) {
              logger.info(
                `   ✅ MATCH: '${game.title}' -> '${steamData.name}' (ID: ${steamAppId})`
              );

              if (steamData.price_overview) {
                game.steamAppId = steamAppId;
                game.price = steamData.price_overview.final / 100;
                game.currency = steamData.price_overview.currency;
                game.discount = steamData.price_overview.discount_percent;
                game.onSale = steamData.price_overview.discount_percent > 0;
                game.originalPrice = steamData.price_overview.initial / 100;

                await game.save();
                logger.info(`      💰 Updated Price: $${game.price}`);
                fixedCount++;
              } else {
                // Free to play or no price data
                game.steamAppId = steamAppId;
                game.price = 0;
                await game.save();
                logger.info(`      🆓 Updated ID (Free/No Price)`);
                fixedCount++;
              }
            } else {
              logger.warn(
                `   ⚠️  Title Mismatch: '${game.title}' vs Steam '${steamData.name}'`
              );
            }
          }
        } else {
          logger.warn(`   ❌ No Steam ID found for '${game.title}'`);
        }
      } catch (err: any) {
        logger.error(`   ⚠️  Error processing ${game.title}: ${err.message}`);
      }

      await new Promise((r) => setTimeout(r, 1000)); // 1s delay to be nice to Steam
    }

    logger.info("=".repeat(60));
    logger.info(`✅ Repair Complete. Fixed ${fixedCount} games.`);
    logger.info("👉 Running export-games.ts now to sync...");
    logger.info("=".repeat(60));

    process.exit(0);
  } catch (err: any) {
    logger.error(`❌ Fix Failed: ${err.message}`);
    process.exit(1);
  }
};

runFix();
