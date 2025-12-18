/**
 * @file validate-phase-search-sync.js
 * @description Validation script for Phase 2: Eager Sync Backend.
 * Verifies that searching for an external game creates it in the local DB.
 */
const axios = require("axios");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const path = require("path");
// Load .env from root
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_URL = "http://localhost:3500/api";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/gamemanager";

// Simple Game Schema for Verification
const gameSchema = new Schema({
  title: String,
  rawgId: Number,
  isExternal: Boolean,
});
const Game = mongoose.model("Game", gameSchema);

const validateSync = async () => {
  console.log("🔍 Validating Eager Sync Search...");

  try {
    // 1. Connect to Mongo to check state
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2. Cleanup: Ensure 'Portal 2' (Example) does NOT exist locally to test sync
    // We use a specific less-common game to avoid deleting user data, e.g., "Portal 2"
    const testGameTitle = "Portal 2";
    await Game.deleteOne({ title: testGameTitle });
    console.log(`🧹 Cleaned up '${testGameTitle}' from DB (if it existed)`);

    // 3. Perform Search via API
    console.log(`🚀 Searching API for '${testGameTitle}'...`);
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}/discovery?q=${testGameTitle}`);
    const duration = Date.now() - startTime;

    console.log(`⏱️  Request took ${duration}ms`);

    const results = response.data.results;

    if (!results || results.length === 0) {
      throw new Error("No results found. Search failed.");
    }

    const targetGame = results.find((g) => g.title === testGameTitle);

    if (!targetGame) {
      console.warn(
        "⚠️  'Portal 2' not found in results. Maybe API limit reached?"
      );
    } else {
      console.log("✅ Found 'Portal 2' in API response");
    }

    // 4. Verify Persistence in DB
    const dbGame = await Game.findOne({ title: testGameTitle });

    if (dbGame) {
      console.log(
        `✅ VERIFIED: '${testGameTitle}' was created in the database with ID: ${dbGame._id}`
      );
      console.log("🎉 Eager Sync SUCCESS");
    } else {
      console.error(
        `❌ FAILED: '${testGameTitle}' was NOT found in database after search.`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Validation FAILED");
    console.error(error.message);
    if (error.response) console.error(error.response.data);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Done");
  }
};

validateSync();
