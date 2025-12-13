import dotenv from "dotenv";
import { getGameDetails } from "../services/rawg.service";
import {
  getSteamGameDetails,
  extractSteamAppId,
} from "../services/steam.service";

dotenv.config();

const debug = async () => {
  const rawgId = 19369; // Call of Duty
  console.log(`\n🔍 Debugging RAWG ID: ${rawgId}`);

  try {
    const details = await getGameDetails(rawgId);
    console.log("RAWG Name:", details.name);

    const steamStore = details.stores.find((s: any) =>
      s.url.includes("store.steampowered.com")
    );

    if (steamStore) {
      console.log("Found Steam URL:", steamStore.url);
      const appId = extractSteamAppId(steamStore.url);
      console.log("Extracted AppID:", appId);

      if (appId) {
        const steamData = await getSteamGameDetails(appId);
        console.log("Steam Data Success:", !!steamData);
        if (steamData) {
          console.log(
            "Price Overview:",
            JSON.stringify(steamData.price_overview, null, 2)
          );
          console.log("Header Image:", steamData.header_image);
          console.log("Name on Steam:", steamData.name);
        }
      }
    } else {
      console.log("❌ No Steam Store URL found in RAWG response.");
      console.log("Stores:", JSON.stringify(details.stores, null, 2));

      // FALLBACK TEST
      console.log("\n🔄 Testing Steam Search Fallback...");
      const { searchSteamGames } = require("../services/steam.service");
      const searchId = await searchSteamGames(details.name);
      console.log(`Search for "${details.name}" returned ID: ${searchId}`);

      if (searchId) {
        const steamData = await getSteamGameDetails(searchId);
        if (steamData && steamData.price_overview) {
          console.log(
            "fallback Price:",
            steamData.price_overview.final_formatted
          );
        }
      }
    }
  } catch (e: any) {
    console.error("Debug Error:", e.message);
  }
};

debug();
