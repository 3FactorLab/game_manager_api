/**
 * @file debug-pricing.ts
 * @description Debug script to verify Steam pricing integration.
 * Fetches details for known paid games to check if price is correctly extracted.
 */

import dotenv from "dotenv";
import { getSteamGameDetails } from "../services/steam.service";
import logger from "../utils/logger";

dotenv.config();

// Known Paid Games
const SAMPLE_GAMES = [
  { name: "Elden Ring", appId: 1245620 },
  { name: "Cyberpunk 2077", appId: 1091500 },
  { name: "Terraria", appId: 105600 },
  { name: "Hollow Knight", appId: 367520 },
];

const runDebug = async () => {
  logger.info("🕵️ Starting Pricing Debug...");

  for (const game of SAMPLE_GAMES) {
    try {
      console.log(`\nChecking: ${game.name} (AppID: ${game.appId})`);
      const details = await getSteamGameDetails(game.appId);

      if (details && details.price_overview) {
        console.log(
          "✅ RAW PRICE DATA:",
          JSON.stringify(details.price_overview, null, 2)
        );

        const price = details.price_overview.final / 100;
        const currency = details.price_overview.currency;
        const discount = details.price_overview.discount_percent;

        console.log(`💰 Parsed: ${price} ${currency} (-${discount}%)`);
      } else {
        console.warn("⚠️ No price_overview found in response!");
        console.log("Full Response Keys:", Object.keys(details || {}));
      }
    } catch (error: any) {
      console.error(`❌ Error fetching ${game.name}:`, error.message);
    }
  }
};

runDebug();
