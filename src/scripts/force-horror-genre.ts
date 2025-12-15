import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const run = async () => {
  await connectDB();

  // Get the last 30 games (the ones we just imported)
  const recentGames = await Game.find().sort({ createdAt: -1 }).limit(30);

  console.log("Updating the following games to genre 'Horror':");
  let count = 0;
  for (const game of recentGames) {
    console.log(`- ${game.title} (was: ${game.genre})`);
    game.genre = "Horror";
    await game.save();
    count++;
  }

  console.log(`\nUpdated ${count} games to 'Horror'.`);
  process.exit(0);
};

run();
