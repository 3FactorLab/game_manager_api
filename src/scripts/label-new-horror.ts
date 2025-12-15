import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const runLabeling = async () => {
  logger.info("🏷️  Starting Proper Horror Labeling...");
  await connectDB();

  const jsonPath = path.join(process.cwd(), "data", "games.json"); // Uses the restored/correct JSON
  const backupGames = await fs.readJSON(jsonPath);
  const backupTitles = new Set(backupGames.map((g: any) => g.title));

  logger.info(`📚 Backup contains ${backupTitles.size} games.`);

  const allDbGames = await Game.find({});
  logger.info(`🗄️  DB contains ${allDbGames.length} games.`);

  let labeledCount = 0;

  for (const game of allDbGames) {
    if (!backupTitles.has(game.title)) {
      // This game is NOT in the backup -> It is NEW -> It is HORROR
      if (game.genre !== "Horror") {
        logger.info(`   👻 Labeling New Game: '${game.title}' -> 'Horror'`);
        game.genre = "Horror";
        await game.save();
        labeledCount++;
      }
    }
  }

  logger.info("=".repeat(60));
  logger.info(
    `✅ Labeling Complete. Updated ${labeledCount} new games to Horror.`
  );
  process.exit(0);
};

runLabeling();
