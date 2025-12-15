import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const runRepair = async () => {
  logger.info("🔧 Starting Surgical Genre Repair...");
  await connectDB();

  const jsonPath = path.join(process.cwd(), "data", "games.json");
  if (!fs.existsSync(jsonPath)) {
    logger.error("games.json not found!");
    process.exit(1);
  }

  const backupGames = await fs.readJSON(jsonPath);
  logger.info(`📄 Loaded ${backupGames.length} games from Safe Backup.`);

  let fixedCount = 0;

  for (const safeGame of backupGames) {
    // Find in DB
    const dbGame = await Game.findOne({ title: safeGame.title });

    if (dbGame) {
      if (dbGame.genre !== safeGame.genre) {
        logger.info(
          `   🚑 Repairing '${safeGame.title}': '${dbGame.genre}' -> '${safeGame.genre}'`
        );
        dbGame.genre = safeGame.genre;
        await dbGame.save();
        fixedCount++;
      }
    }
  }

  logger.info("=".repeat(60));
  logger.info(`✅ Repair Complete. Fixed ${fixedCount} games.`);
  logger.info("🛡️ No data was deleted.");
  process.exit(0);
};

runRepair();
