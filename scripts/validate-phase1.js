#!/usr/bin/env node

/**
 * validate-phase1.js
 * Validates Phase 1: Backend Optimization
 *
 * Checks:
 * 1. Integrity: compression middleware is implemented
 * 2. Forbidden: No console.log allowed
 * 3. Safety: No dangerous deleteMany({}) in tests
 * 4. Critical: Integration tests pass
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

const CHECKS = [
  {
    name: " integrity: Checking 'compression' in server.ts",
    run: () => {
      const serverPath = path.join(SRC_DIR, "server.ts");
      if (!fs.existsSync(serverPath)) throw new Error("server.ts not found");
      const content = fs.readFileSync(serverPath, "utf8");

      // Check import
      if (!content.includes('import compression from "compression"')) {
        throw new Error("Missing 'import compression' in server.ts");
      }
      // Check usage
      if (!content.includes("app.use(compression())")) {
        throw new Error("Missing 'app.use(compression())' in server.ts");
      }
      return true;
    },
  },
  {
    name: " forbidden: Scanning for console.log",
    run: () => {
      const forbidden = "console.log";
      const files = findFiles(SRC_DIR, [".ts"]);
      const errors = [];

      files.forEach((file) => {
        // Exclude scripts directory from forbidden check (CLI tools need console.log)
        if (file.includes("/scripts/")) return;

        const content = fs.readFileSync(file, "utf8");
        if (content.includes(forbidden)) {
          errors.push(`Found ${forbidden} in ${path.relative(ROOT_DIR, file)}`);
        }
      });

      if (errors.length > 0) {
        throw new Error(`Forbidden pattern found:\n${errors.join("\n")}`);
      }
      return true;
    },
  },
  {
    name: " safety: Scanning for dangerous deleteMany({}) in tests",
    run: () => {
      const pattern = /deleteMany\(\s*\{\s*\}\s*\)/;
      const testDir = path.join(SRC_DIR, "tests");
      if (!fs.existsSync(testDir)) return true; // No tests, no risk (technically)

      const files = findFiles(testDir, [".ts"]);
      const errors = [];

      files.forEach((file) => {
        const content = fs.readFileSync(file, "utf8");
        if (pattern.test(content)) {
          errors.push(
            `Dangerous 'deleteMany({})' found in ${path.relative(
              ROOT_DIR,
              file
            )}`
          );
        }
      });

      if (errors.length > 0) {
        throw new Error(`Safety violation:\n${errors.join("\n")}`);
      }
      return true;
    },
  },
  {
    name: " critical: Running Full Flow Integration Test",
    run: () => {
      console.log(
        "\n    > Running: npm test tests/integration/full-flow.test.ts"
      );
      execSync("npm test src/tests/integration/full-flow.test.ts", {
        stdio: "inherit",
        cwd: ROOT_DIR,
        env: { ...process.env, NODE_ENV: "test" },
      });
      return true;
    },
  },
];

// Helper: Recursive file find
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else {
      if (extensions.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

// Main execution
console.log("🔍 Starting Phase 1 Validation (Backend)...\n");
let passed = true;

(async () => {
  for (const check of CHECKS) {
    try {
      process.stdout.write(`[ ] ${check.name}...`);
      await check.run();
      console.log(" ✅");
    } catch (error) {
      console.log(" ❌");
      console.error(`\nERROR: ${error.message}\n`);
      passed = false;
      // Don't exit immediately, verify all checks if possible?
      // Actually for safety, maybe break?
      // Let's continue to see all errors.
    }
  }

  if (!passed) {
    console.error("\n❌ VALIDATION FAILED. Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("\n✅ PHASE 1 VALIDATION PASSED. System is clean.");
    process.exit(0);
  }
})();
