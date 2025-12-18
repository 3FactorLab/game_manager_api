const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function debugFilters() {
  console.log("🔍 Connecting to DB...");
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected.");

    // Define minimalistic schema
    const Game = mongoose.model(
      "Game",
      new mongoose.Schema({}, { strict: false })
    );

    console.log("📊 Checking Game Count...");
    const count = await Game.countDocuments({});
    console.log(`Total Games: ${count}`);

    console.log("📊 Aggregating Genres...");
    const genres = await Game.distinct("genre");
    console.log(`Found ${genres.length} genres:`, genres.slice(0, 5));

    console.log("📊 Aggregating Platforms...");
    const platforms = await Game.distinct("platforms");
    console.log(`Found ${platforms.length} platforms:`, platforms.slice(0, 5));
  } catch (e) {
    console.error("❌ Error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected.");
  }
}

debugFilters();
