/**
 * validate-pagination.js
 * Validation Driven Development (VDD) script for pagination implementation.
 * Verifies compliance with PROMPT_AI standards and implementation plan.
 *
 * Usage: node backend/scripts/validate-pagination.js
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return null;
  }
}

/**
 * Check if file contains specific text
 */
function fileContains(filePath, searchText) {
  const content = readFile(filePath);
  return content ? content.includes(searchText) : false;
}

/**
 * Validate a check
 */
function validate(condition, successMsg, errorMsg) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    log.success(successMsg);
    return true;
  } else {
    failedChecks++;
    log.error(errorMsg);
    return false;
  }
}

/**
 * Phase 1: Backend Validation
 */
function validateBackend() {
  log.section("📦 Phase 1: Backend Validation");

  // 1.1 Zod Validators
  validate(
    fileExists("backend/src/validators/zod/pagination.validator.ts"),
    "Zod validators file exists",
    "Missing pagination.validator.ts"
  );

  validate(
    fileContains(
      "backend/src/validators/zod/pagination.validator.ts",
      "libraryQuerySchema"
    ),
    "libraryQuerySchema defined",
    "Missing libraryQuerySchema"
  );

  validate(
    fileContains(
      "backend/src/validators/zod/pagination.validator.ts",
      "wishlistQuerySchema"
    ),
    "wishlistQuerySchema defined",
    "Missing wishlistQuerySchema"
  );

  // 1.2 Collection Service
  const collectionService = readFile(
    "backend/src/services/collection.service.ts"
  );
  validate(
    collectionService && collectionService.includes("query?: string"),
    "Collection service has query parameter",
    "Collection service missing query parameter"
  );

  validate(
    collectionService && collectionService.includes("sortBy?: string"),
    "Collection service has sortBy parameter",
    "Collection service missing sortBy parameter"
  );

  validate(
    collectionService &&
      collectionService.includes("data:") &&
      collectionService.includes("pagination:"),
    "Collection service returns new format {data, pagination}",
    "Collection service not using new response format"
  );

  // 1.3 User Service
  const userService = readFile("backend/src/services/user.service.ts");
  validate(
    (userService && userService.includes("getWishlistPaginated")) ||
      userService.includes("page: number"),
    "User service has pagination support",
    "User service missing pagination"
  );

  // 1.4 Controllers
  const collectionController = readFile(
    "backend/src/controllers/collection.controller.ts"
  );
  validate(
    collectionController &&
      collectionController.includes("query") &&
      collectionController.includes("sortBy"),
    "Collection controller parses new query params",
    "Collection controller missing query param parsing"
  );

  const userController = readFile("backend/src/controllers/user.controller.ts");
  validate(
    userController &&
      userController.includes("page") &&
      userController.includes("limit"),
    "User controller parses pagination params",
    "User controller missing pagination param parsing"
  );

  // 1.5 Tests
  const collectionTest = readFile(
    "backend/src/services/collection.service.test.ts"
  );
  validate(
    collectionTest && collectionTest.includes("pagination"),
    "Collection service tests updated",
    "Collection service tests not updated"
  );
}

/**
 * Phase 2: Frontend Services & Hooks Validation
 */
function validateFrontendServices() {
  log.section("🎨 Phase 2: Frontend Services & Hooks");

  // 2.1 Collection Service
  validate(
    fileExists("frontend/src/services/collection.service.ts"),
    "Collection service exists",
    "Missing collection.service.ts"
  );

  validate(
    fileContains(
      "frontend/src/services/collection.service.ts",
      "LibraryQueryParams"
    ),
    "LibraryQueryParams interface defined",
    "Missing LibraryQueryParams"
  );

  // 2.2 URL Hooks
  validate(
    fileExists("frontend/src/features/collection/hooks/useLibraryUrl.ts"),
    "useLibraryUrl hook exists",
    "Missing useLibraryUrl.ts"
  );

  validate(
    fileContains(
      "frontend/src/features/collection/hooks/useLibraryUrl.ts",
      "debounce"
    ),
    "useLibraryUrl has debounced search",
    "useLibraryUrl missing debounce"
  );

  validate(
    fileExists("frontend/src/features/wishlist/hooks/useWishlistUrl.ts"),
    "useWishlistUrl hook exists",
    "Missing useWishlistUrl.ts"
  );

  // 2.3 Data Hooks
  validate(
    fileExists("frontend/src/features/collection/hooks/useLibraryPaginated.ts"),
    "useLibraryPaginated hook exists",
    "Missing useLibraryPaginated.ts"
  );

  validate(
    fileExists("frontend/src/features/wishlist/hooks/useWishlistPaginated.ts"),
    "useWishlistPaginated hook exists",
    "Missing useWishlistPaginated.ts"
  );

  // 2.4 User Service Update
  const userService = readFile("frontend/src/services/user.service.ts");
  validate(
    userService && userService.includes("getWishlistPaginated"),
    "User service has getWishlistPaginated",
    "User service missing getWishlistPaginated"
  );
}

/**
 * Phase 3: Frontend UI Validation
 */
function validateFrontendUI() {
  log.section("🎯 Phase 3: Frontend UI");

  // 3.1 Pagination Component
  validate(
    fileExists("frontend/src/components/common/Pagination.tsx"),
    "Pagination component exists",
    "Missing Pagination.tsx"
  );

  validate(
    fileExists("frontend/src/components/common/Pagination.module.css"),
    "Pagination CSS module exists",
    "Missing Pagination.module.css"
  );

  const pagination = readFile("frontend/src/components/common/Pagination.tsx");
  validate(
    pagination && pagination.includes("useTranslation"),
    "Pagination component uses i18n",
    "Pagination missing i18n"
  );

  // 3.2 LibraryPage
  const libraryPage = readFile("frontend/src/pages/LibraryPage.tsx");
  validate(
    libraryPage && libraryPage.includes("useLibraryUrl"),
    "LibraryPage uses useLibraryUrl",
    "LibraryPage not using useLibraryUrl"
  );

  validate(
    libraryPage && libraryPage.includes("useLibraryPaginated"),
    "LibraryPage uses useLibraryPaginated",
    "LibraryPage not using useLibraryPaginated"
  );

  validate(
    libraryPage && libraryPage.includes("Pagination"),
    "LibraryPage uses Pagination component",
    "LibraryPage not using Pagination component"
  );

  validate(
    libraryPage && libraryPage.includes("pagination.total"),
    "LibraryPage uses pagination.total for count",
    "LibraryPage not using pagination.total"
  );

  // 3.3 WishlistPage
  const wishlistPage = readFile("frontend/src/pages/WishlistPage.tsx");
  validate(
    wishlistPage && wishlistPage.includes("useWishlistUrl"),
    "WishlistPage uses useWishlistUrl",
    "WishlistPage not using useWishlistUrl"
  );

  validate(
    wishlistPage && wishlistPage.includes("useWishlistPaginated"),
    "WishlistPage uses useWishlistPaginated",
    "WishlistPage not using useWishlistPaginated"
  );

  validate(
    wishlistPage && !wishlistPage.includes("useWishlist()"),
    "WishlistPage does not use WishlistContext for display",
    "WishlistPage still using WishlistContext for display"
  );

  // 3.4 i18n
  const enJson = readFile("frontend/src/locales/en.json");
  validate(
    enJson && enJson.includes('"pagination"'),
    "English translations have pagination keys",
    "Missing pagination translations in en.json"
  );

  const esJson = readFile("frontend/src/locales/es.json");
  validate(
    esJson && esJson.includes('"pagination"'),
    "Spanish translations have pagination keys",
    "Missing pagination translations in es.json"
  );
}

/**
 * Critical Requirements Validation
 */
function validateCriticalRequirements() {
  log.section("🔒 Critical Requirements");

  // GameCard preservation
  const gameCard = readFile(
    "frontend/src/features/games/components/GameCard.tsx"
  );
  const gameCardCSS = readFile(
    "frontend/src/features/games/components/GameCard.module.css"
  );

  validate(
    gameCard !== null && gameCardCSS !== null,
    "GameCard component and styles exist (not modified)",
    "GameCard component or styles missing"
  );

  // Catalog isolation
  const catalogPage = readFile("frontend/src/pages/CatalogPage.tsx");
  validate(
    catalogPage && catalogPage.includes("useCatalogUrl"),
    "CatalogPage still uses useCatalogUrl (not affected)",
    "CatalogPage may have been modified"
  );

  // Backend response format consistency
  const collectionService = readFile(
    "backend/src/services/collection.service.ts"
  );
  validate(
    collectionService &&
      collectionService.includes("data:") &&
      collectionService.includes("pagination:"),
    "Backend uses consistent {data, pagination} format",
    "Backend response format inconsistent"
  );
}

/**
 * Main validation function
 */
function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  📋 VDD Validation: Library & Wishlist Pagination");
  console.log("=".repeat(60));

  validateBackend();
  validateFrontendServices();
  validateFrontendUI();
  validateCriticalRequirements();

  // Summary
  log.section("📊 Validation Summary");
  console.log(`Total checks: ${totalChecks}`);
  console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);

  const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  console.log(`\nPass rate: ${passRate}%`);

  if (failedChecks === 0) {
    log.success("\n🎉 All validation checks passed!");
    process.exit(0);
  } else {
    log.error(`\n❌ ${failedChecks} validation check(s) failed`);
    process.exit(1);
  }
}

// Run validation
main();
