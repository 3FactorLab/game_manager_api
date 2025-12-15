import dotenv from "dotenv";
import { getGameDetails } from "../services/rawg.service";
import { extractSteamAppId } from "../services/steam.service";
import logger from "../utils/logger";

dotenv.config();

const runDebug = async () => {
  // Assetto Corsa RAWG ID: 1391 (found in previous cat games.json)
  const rawgId = 1391;

  console.log(`🔍 Debugging Steam Link for Game ID: ${rawgId}`);

  try {
    const details = await getGameDetails(rawgId);
    console.log("---------------------------------------------------");
    console.log(`Title: ${details.name}`);
    console.log(`Website: ${details.website}`);
    console.log("Stores:", JSON.stringify(details.stores, null, 2));
    console.log("---------------------------------------------------");

    const steamStore = details.stores.find((s) =>
      s.url.includes("store.steampowered.com")
    );

    if (steamStore) {
      console.log(`✅ Found Steam Store URL: ${steamStore.url}`);
      const extractedId = extractSteamAppId(steamStore.url);
      console.log(`🆔 Extracted ID from Store: ${extractedId}`);
    } else {
      console.log("❌ No Steam Store URL found in 'stores' array.");
    }

    if (details.website && details.website.includes("store.steampowered.com")) {
      console.log(`✅ Found Steam in Website: ${details.website}`);
      const extractedIdWebsite = extractSteamAppId(details.website);
      console.log(`🆔 Extracted ID from Website: ${extractedIdWebsite}`);
    }
  } catch (error) {
    console.error(error);
  }
};

runDebug();
