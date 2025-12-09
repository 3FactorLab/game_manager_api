/**
 * @file enrichScreenshots.ts
 * @description Migration script to enrich game screenshots from RAWG API
 *
 * This script:
 * 1. Reads all games from data/games.json
 * 2. For each game with a rawgId, fetches screenshots from RAWG API
 * 3. Updates the screenshots array with 4-5 high-quality images
 * 4. Saves the updated games.json
 */

import fs from "fs";
import path from "path";
import axios from "axios";

const RAWG_API_KEY =
  process.env.RAWG_API_KEY || "c7c6b59c85144708b072db9b7e801944";
const RAWG_BASE_URL = "https://api.rawg.io/api";
const GAMES_JSON_PATH = path.join(__dirname, "../data/games.json");
const DELAY_MS = 500; // Delay between API calls to respect rate limits

interface Game {
  _id: string;
  title: string;
  rawgId?: number;
  screenshots: string[];
  [key: string]: any;
}

interface RAWGScreenshot {
  id: number;
  image: string;
}

/**
 * Fetch screenshots for a specific game from RAWG API
 */
async function fetchScreenshotsFromRAWG(rawgId: number): Promise<string[]> {
  try {
    const url = `${RAWG_BASE_URL}/games/${rawgId}/screenshots`;
    const response = await axios.get(url, {
      params: { key: RAWG_API_KEY },
    });

    if (response.data && response.data.results) {
      // Get up to 5 screenshots
      const screenshots: string[] = response.data.results
        .slice(0, 5)
        .map((screenshot: RAWGScreenshot) => screenshot.image)
        .filter((url: string) => url && url.startsWith("http"));

      return screenshots;
    }

    return [];
  } catch (error: any) {
    console.error(
      `Error fetching screenshots for RAWG ID ${rawgId}:`,
      error.message
    );
    return [];
  }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main migration function
 */
async function enrichScreenshots() {
  console.log("🎮 Starting screenshot enrichment migration...\n");

  // Read games.json
  if (!fs.existsSync(GAMES_JSON_PATH)) {
    console.error("❌ games.json not found at:", GAMES_JSON_PATH);
    process.exit(1);
  }

  const gamesData = JSON.parse(fs.readFileSync(GAMES_JSON_PATH, "utf-8"));
  const games: Game[] = Array.isArray(gamesData) ? gamesData : [];

  console.log(`📊 Found ${games.length} games in database\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const progress = `[${i + 1}/${games.length}]`;

    // Skip if no rawgId
    if (!game.rawgId) {
      console.log(`${progress} ⏭️  Skipping "${game.title}" - No RAWG ID`);
      skipped++;
      continue;
    }

    // Skip if already has multiple screenshots
    const currentScreenshots = Array.isArray(game.screenshots)
      ? game.screenshots.filter(
          (s: any) => typeof s === "string" && s.startsWith("http")
        )
      : [];

    if (currentScreenshots.length >= 4) {
      console.log(
        `${progress} ✅ "${game.title}" - Already has ${currentScreenshots.length} screenshots`
      );
      skipped++;
      continue;
    }

    // Fetch new screenshots
    console.log(`${progress} 🔄 Fetching screenshots for "${game.title}"...`);
    const newScreenshots = await fetchScreenshotsFromRAWG(game.rawgId);

    if (newScreenshots.length > 0) {
      game.screenshots = newScreenshots;
      console.log(
        `${progress} ✅ Updated "${game.title}" - ${newScreenshots.length} screenshots`
      );
      updated++;
    } else {
      console.log(
        `${progress} ⚠️  Failed to fetch screenshots for "${game.title}"`
      );
      failed++;
    }

    // Respect rate limits
    if (i < games.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save updated games.json
  console.log("\n💾 Saving updated games.json...");
  fs.writeFileSync(GAMES_JSON_PATH, JSON.stringify(games, null, 2), "utf-8");

  // Summary
  console.log("\n✨ Migration Complete!\n");
  console.log("📊 Summary:");
  console.log(`   ✅ Updated: ${updated} games`);
  console.log(`   ⏭️  Skipped: ${skipped} games`);
  console.log(`   ⚠️  Failed: ${failed} games`);
  console.log(`   📁 Total: ${games.length} games\n`);
}

// Run migration
enrichScreenshots().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
