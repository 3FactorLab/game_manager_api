/**
 * @file exportGames.ts
 * @description Script to export current MongoDB games to data/games.json.
 * Useful for backing up the enriched data after migration.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Game from "../models/game.model";
import { MONGO_URI } from "../config/env";
import logger from "../utils/logger";

dotenv.config();

const exportGames = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB for export...");

    // Fetch all games, excluding internal fields like __v
    const games = await Game.find(
      {},
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).lean();
    logger.info(`Found ${games.length} games to export.`);

    // Define path to games.json
    const filePath = path.join(__dirname, "../../data/games.json");

    // Write to file
    await fs.writeFile(filePath, JSON.stringify(games, null, 2));
    logger.info(`Successfully exported games to ${filePath}`);
  } catch (error) {
    logger.error(`Export script error: ${error}`);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

exportGames();
