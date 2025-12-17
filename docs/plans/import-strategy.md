# 🎮 Database Expansion Plan (2025-12-15)

> **Status**: READY FOR EXECUTION
> **Strategy**: Balanced Genre Import (Hybrid RAWG+Steam)
> **Safety Level**: HIGH (Backup + Dry Run + Upsert Only)

## 1. Goal

Populate the database with **200 new high-quality PC games** using a **Balanced Import Strategy**.
The script uses specific quotas to populate under-represented genres:

- **Sports**: 40 games
- **Racing, Simulation, Strategy**: 30 games each
- **RPG, Puzzle, Fighting**: 20 games each
- **Platformer**: 10 games

The script fetches metadata from RAWG and pricing from Steam.

> **Alignment Confirmed**: This plan follows the "JSON-First" and "Upsert-Only" standards established on 2025-11-26 to ensure **zero data loss**.

## Pre-requisites

- [ ] **Environment**: Check that `backend/.env` exists and contains `RAWG_API_KEY`.
- [ ] **Dependencies**: Backend is running (`npm run dev`), so dependencies are installed.

## Execution Steps

### Phase 1: Simulation (Dry Run) & Verification 🟢

**Goal:** Verify data quality and structure using the preview file.

1.  **Frontend Compatibility Check:** (Completed) ✅
    - `games.service.ts` maps `image` -> `assets.cover`.
    - `GameCard.tsx` uses `title`, `genre`, `platform`, `developer`, `score`, `price`, and `offerPrice`.
    - The import script populates all these fields correctly.
2.  **Script Verification:** (Completed) The script has been updated to match `games.json` structure exactly:
    - `_id` generated as string.
    - `createdAt` and `updatedAt` excluded from JSON export.
3.  Run the script **without** flags (Dry Run):
    ```bash
    npx ts-node src/scripts/import-pc-games.ts
    ```
4.  **Verify `import-preview.json`**:
    - The script generates `import-preview.json` in the backend root.
    - **Action**: Open this file and compare 1-2 entries against `data/games.json`.
    - **Check**: Ensure `_id` is a string and no `createdAt`/`updatedAt` fields exist.
    - **Check**: Ensure pricing and image URLs are correct.

### Phase 2: Safety Backup (CRITICAL) 🛡️

**Goal:** Protect `games.json` from accidental data loss.

1.  Create a backup copy of the existing data:
    ```bash
    cp data/games.json data/games.backup.json
    ```
2.  **Verify Backup Integrity**:
    - Run `ls -l data/games.*`
    - **Check**: Ensure `games.backup.json` has the same byte size as `games.json`.

### Phase 3: Execution (Commit) 🔴

**Goal:** Persist the data (Append-Only).

1.  Run the script with commit flag:
    ```bash
    npx ts-node src/scripts/import-pc-games.ts --commit
    ```
    _Note: The script is designed to **append** new games to `games.json`, never overwrite._

### Phase 4: Database Synchronization (Seeding) 🌱

**Goal:** Ensure absolute consistency between `games.json` and MongoDB.
_Note: This step is safe. The seeder uses `upsert` (Update or Insert). It **NEVER WIPES** the database._

1.  Run the seed command:
    ```bash
    npm run seed
    ```
2.  **Verify**: Log should say "✅ Game Catalog Seeded Successfully (No data deleted)!".

### Phase 5: Final Verification

1.  **Frontend**: Check the Catalog for new games.
2.  **File System**: Check `games.json` size increased (approx +200 entries).

## Rollback Strategy

- If `games.json` is corrupted or empty: Restore immediately from backup:
  ```bash
  cp data/games.backup.json data/games.json
  ```
- If DB has bad data: Use the IDs from `import-preview.json` to delete specific entries (manual process).
