import {
  searchSteamGames,
  getSteamGameDetails,
} from "../services/steam.service";
import logger from "../utils/logger";

const debugSteam = async () => {
  const query = "Clair Obscur: Expedition 33";
  console.log(`Searching for: ${query}`);

  const appId = await searchSteamGames(query);
  console.log(`App ID Found: ${appId}`);

  if (appId) {
    const details = await getSteamGameDetails(appId);
    console.log("Details:", JSON.stringify(details, null, 2));
  }
};

debugSteam();
