# Plan: Real Statistics for Home Page (Finalized)

This plan implements a real backend endpoint for global statistics (Total Users, Total Games, Total Collections) to replace hardcoded values on the Home Page.

## 1. Standards Compliance Checklist

> [!IMPORTANT]
> This implementation MUST adhere to the following standards:

- [ ] **Strict Typing**: No `any`. Use DTOs/Interfaces for all data.
- [ ] **Backend Architecture**: Controller -> Service -> DTO pattern.
- [ ] **Observability**: Use `logger` (Winston) for entry/exit points.
- [ ] **Zero-Fragility Tests**:
  - Backend: Use `jest.spyOn`. No fragile mocks.
  - Frontend: Use **MSW** (Mock Service Worker). No `vi.mock` for services.
- [ ] **Documentation**: Academic English JSDoc for all new files.

## 2. Backend Implementation (`/backend`)

**Order of Execution:** DTO -> Service -> Controller -> Routes -> Server.

### Step 2.1: Data Transfer Object

#### [NEW] [stats.dto.ts](file:///Users/andydev/game manager v0/backend/src/dtos/stats.dto.ts)

- Define `StatsResponseDto`:
  ```typescript
  export interface StatsResponseDto {
    totalUsers: number;
    totalGames: number;
    totalCollections: number; // Total user-owned games
  }
  ```

### Step 2.2: Business Logic

#### [NEW] [stats.service.ts](file:///Users/andydev/game manager v0/backend/src/services/stats.service.ts)

- Implement `getGlobalStats()`:
  - Count documents in `User`, `Game`, and `UserGame` models.
  - Return `StatsResponseDto`.
  - **Compliance**: Add JSDoc and `logger.info()`.

### Step 2.3: API Layer

#### [NEW] [stats.controller.ts](file:///Users/andydev/game manager v0/backend/src/controllers/stats.controller.ts)

- Implement `getStats`:
  - Call `statsService.getGlobalStats()`.
  - Return 200 OK with data.
  - **Compliance**: Use `asyncHandler`. No business logic here.

#### [NEW] [stats.routes.ts](file:///Users/andydev/game manager v0/backend/src/routes/stats.routes.ts)

- Define `GET /`: Route to `statsController.getStats`.
- **Compliance**: Include Swagger documentation block.

### Step 2.4: Registration

#### [MODIFY] [server.ts](file:///Users/andydev/game manager v0/backend/src/server.ts)

- Import `statsRoutes`.
- Mount at `/api/public/stats`.

## 3. Frontend Implementation (`/frontend`)

**Order of Execution:** Handler -> Service -> UI Component -> Test.

### Step 3.1: MSW Handler (Testing Infra)

#### [NEW] [handlers.ts](file:///Users/andydev/game manager v0/frontend/src/mocks/handlers.ts)

- Add `http.get("/api/public/stats")` handler.
- Return mock `StatsResponseDto`.

### Step 3.2: Service Layer

#### [NEW] [stats.service.ts](file:///Users/andydev/game manager v0/frontend/src/services/stats.service.ts)

- Implement `getGlobalStats()`: Fetches `/api/public/stats`.
- Return `Promise<StatsResponseDto>`.

### Step 3.3: UI Component

#### [MODIFY] [StatsSection.tsx](file:///Users/andydev/game manager v0/frontend/src/features/home/components/StatsSection.tsx)

- Replace `gamesService.getCatalog` with `statsService.getGlobalStats`.
- Update render logic to use real `totalUsers` and `totalCollections`.
- Maintain hardcoded "Open Source" and "Zero Ads".

### Step 3.4: Unit Testing (Boy Scout Rule)

#### [MODIFY] [StatsSection.test.tsx](file:///Users/andydev/game manager v0/frontend/src/features/home/components/StatsSection.test.tsx)

- **Refactor Goal**: Convert from `vi.mock` to **MSW**.
- Remove `vi.mock("../../../services/games.service")`.
- Use `server.use()` to inject specific test scenarios if needed.
- Verify component renders loading state and final data correctly.

## 4. Verification Plan

### Automated Verification

- **Backend**: Run `npm test src/services/stats.service.test.ts` (Create this test file with `jest.spyOn`).
- **Frontend**: Run `npm test src/features/home/components/StatsSection.test.tsx`.

### Manual Verification

1.  **Seed Data**: Ensure DB has users, games, and user-games.
2.  **API Check**: `curl http://localhost:3500/api/public/stats` -> Expect JSON.
3.  **UI Check**: Visit Home Page. Verify numbers match DB counts.
