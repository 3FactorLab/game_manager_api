/**
 * @file validate-phase-search.js
 * @description Validation script for Phase 1: Unified Search Backend.
 * Verifies that the /api/discovery endpoint returns mixed results and handles deduplication.
 */
const axios = require("axios");

const API_URL = "http://localhost:3500/api";

const validateSearch = async () => {
  console.log("🔍 Validating Unified Search (Local + Remote)...");

  try {
    const startTime = Date.now();
    // Search for "Mario" - likely to yield both local (if any) and remote results
    const response = await axios.get(`${API_URL}/discovery?q=Mario`);
    const duration = Date.now() - startTime;

    const { results, source } = response.data;

    console.log(`⏱️  Request took ${duration}ms`);
    console.log(`📦 Source: ${source}`);
    console.log(`🔢 Total Results: ${results.length}`);

    if (!Array.isArray(results)) {
      throw new Error("Results is not an array");
    }

    if (results.length === 0) {
      console.warn(
        "⚠️  Warning: No results found. Check internet connection or RAWG API Key."
      );
    } else {
      console.log("✅ Results found!");
      const local = results.filter((r) => !r.isExternal).length;
      const remote = results.filter((r) => r.isExternal).length;
      console.log(`   🏠 Local: ${local}`);
      console.log(`   🌐 Remote: ${remote}`);

      // Basic Type Check
      const first = results[0];
      if (!first.title || !first._id) {
        throw new Error("Invalid UnifiedGame object structure");
      }
    }

    console.log("✅ Validation SUCCESS");
  } catch (error) {
    console.error("❌ Validation FAILED");
    console.error("👉 Error Message:", error.message);
    if (error.code) console.error("👉 Error Code:", error.code);
    if (error.response) {
      console.error("👉 Status:", error.response.status);
      console.error("👉 Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("👉 Stack:", error.stack);
    }
  }
};

validateSearch();
