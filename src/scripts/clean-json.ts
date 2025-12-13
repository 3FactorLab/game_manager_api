/**
 * @file clean-json.ts
 * @description Removes unusual line terminators (LS \u2028, PS \u2029) from games.json
 * caused by copy-pasting or API imports.
 */

import fs from "fs-extra";
import path from "path";

const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");

const runClean = async () => {
  console.log("🧹 Starting JSON Sanitation...");

  try {
    const rawContent = await fs.readFile(GAMES_JSON_PATH, "utf-8");

    let cleanedContent = rawContent
      .replace(/\u2028/g, "\n")
      .replace(/\u2029/g, "\n");

    if (rawContent !== cleanedContent) {
      console.log("⚠️  Found and replaced unusual line terminators.");
      await fs.writeFile(GAMES_JSON_PATH, cleanedContent, "utf-8");
      console.log("✅ File saved clean.");
    } else {
      console.log("✨ No unusual characters found. File is clean.");
    }
  } catch (error) {
    console.error("Error cleaning file:", error);
  }
};

runClean();
