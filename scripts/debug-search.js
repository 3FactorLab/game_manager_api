const { searchAndSync } = require("../src/services/discovery.service");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Mock RAWG Service if needed, or use real one?
// We want to test the REAL service flow, so we need to compile TS or use ts-node.
// Since we are in JS land here, we can try to require the built version if available,
// or just use a simple axios test to RAWG to see what 'search=ubisoft' returns.

const axios = require("axios");
const RAWG_API_KEY = process.env.RAWG_API_KEY;

async function testRawgBehavior() {
  console.log("🔍 Testing RAWG API direct search for 'ubisoft'...");
  try {
    const response = await axios.get("https://api.rawg.io/api/games", {
      params: {
        key: RAWG_API_KEY,
        search: "ubisoft",
        page_size: 5,
      },
    });
    console.log(`RAWG returned ${response.data.results.length} results.`);
    response.data.results.forEach((g) => {
      console.log(` - ${g.name} (ID: ${g.id})`);
    });
  } catch (e) {
    console.error("RAWG Error:", e.message);
  }
}

async function testLocalDb() {
  // Check if we have any game with developer 'Ubisoft' locally
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env");
    return;
  }
  await mongoose.connect(MONGO_URI);

  const Game = mongoose.model(
    "Game",
    new mongoose.Schema({}, { strict: false })
  );
  const count = await Game.countDocuments({
    developer: { $regex: "ubisoft", $options: "i" },
  });
  console.log(`\nLocal DB has ${count} games with developer 'Ubisoft'.`);
  await mongoose.disconnect();
}

(async () => {
  await testRawgBehavior();
  await testLocalDb();
})();
