# Plan: Real Statistics for Home Page

This plan implements a real backend endpoint for global statistics (Total Users, Total Games, Total Collections) to replace hardcoded values on the Home Page.

## User Review Required

> [!NOTE]
> "Open Source" and "Zero Ads" metrics will remain hardcoded as requested. "Collections" will be calculated as the total count of `UserGame` documents (total games in all user libraries).

## Proposed Changes

### Backend (`/backend`)

#### [NEW] [stats.dto.ts](file:///Users/andydev/game manager v0/backend/src/dtos/stats.dto.ts)

- Define `StatsResponseDto`:
  ```typescript
  export interface StatsResponseDto {
    totalUsers: number;
    totalGames: number;
    totalCollections: number; // Total games added by users
  }
  ```
- **Compliance**: Strict typing, no values implementation (interface/type only).

#### [NEW] [stats.service.ts](file:///Users/andydev/game manager v0/backend/src/services/stats.service.ts)

- `getGlobalStats()`:
  - Count `User` documents.
  - Count `Game` documents.
  - Count `UserGame` documents (as "Collections" metric).
  - Return `StatsResponseDto`.
- **Compliance**: Use `logger` for entry/exit (Winston). Academic English comments for all methods.

#### [NEW] [stats.controller.ts](file:///Users/andydev/game manager v0/backend/src/controllers/stats.controller.ts)

- `getStats`: Call service and return data.
- Use `asyncHandler`.
- **Compliance**: No logic in controller, just DTO mapping/response. `asyncHandler` mandatory.

#### [NEW] [stats.routes.ts](file:///Users/andydev/game manager v0/backend/src/routes/stats.routes.ts)

- `GET /`: Route to `getStats`.
- **Compliance**: Swagger docs for the endpoint.

#### [MODIFY] [server.ts](file:///Users/andydev/game manager v0/backend/src/server.ts)

- Mount `/api/public/stats` -> `statsRoutes`.

### Frontend (`/frontend`)

#### [NEW] [handlers.ts](file:///Users/andydev/game manager v0/frontend/src/mocks/handlers.ts)

- Add handler for `GET /api/public/stats`.
- **Compliance**: Use MSW `http.get`. Return valid `StatsResponseDto`.

#### [NEW] [stats.service.ts](file:///Users/andydev/game manager v0/frontend/src/services/stats.service.ts)

- `getGlobalStats()`: Fetch `/api/public/stats`.
- **Compliance**: Typed return `Promise<StatsResponseDto>`. JSDoc.

#### [MODIFY] [StatsSection.tsx](file:///Users/andydev/game manager v0/frontend/src/features/home/components/StatsSection.tsx)

- Use `useQuery` with `statsService.getGlobalStats`.
- Display real `totalUsers`, `totalGames` (remove older hack), and `totalCollections`.
- Keep static "Open Source" and "Zero Ads".
- **Compliance**: JSDoc for component. Strict props typing. remove any console.log.

#### [NEW] [StatsSection.test.tsx](file:///Users/andydev/game manager v0/frontend/src/features/home/components/StatsSection.test.tsx)

- **Compliance**: Unit test using `vi.spyOn` for service mocks. Verify numbers render correctly.

## Verification Plan

### Automated Tests

- **Backend Unit Test (`stats.service.test.ts`)**:
  - **Compliance**: Use `jest.spyOn(User, 'countDocuments')`. NO `jest.mock`. Restore mocks after test.
  - Mock models. Verify counts are returned correctly.
- **Frontend Unit Test (`StatsSection.test.tsx`)**:
  - **Refactor**: Remove `vi.mock("../../../services/games.service")`.
  - **Compliance**: **Use MSW**. Do NOT mock service. Define `server.use(http.get("/api/public/stats", ...))` in test to simulate response.
    - Render `StatsSection` wrapped in `QueryClientProvider` (use custom render util if exists or standard).
    - Verify "Total Users", "Total Games" text appears.
    - **Note (Testing Strategy)**: We adopt the "Boy Scout Rule". We convert THIS test to MSW because we are touching it. We do NOT refactor other existing tests in this task.

### Manual Verification

1.  Run `npm run seed` (if available) or create users/games manually.
2.  Check `/api/public/stats` via browser/curl.
3.  Check Home Page stats match DB counts.
