# Test Gap Coverage Plan (Phase 11)

## Goal

Close identified testing gaps in critical backend services (`Cron`, `GameAggregator`) and verify system resilience (Payment Email Fallback).

## User Review Required

> [!NOTE]
> This phase focuses on internal logic stability. No public API changes.

## Guidelines Alignment (PROMPT_AI)

> [!IMPORTANT] > **Strict Compliance Required**:
>
> 1.  **Database Safety**: Tests must NEVER use `deleteMany({})`. Use specific queries only.
> 2.  **Layered Architecture**: Service tests must NOT use `supertest` or HTTP mocks. Test pure logic.
> 3.  **Documentation**: All new test files must have:
>     - English file header summary.
>     - JSDoc for helper functions.
>     - Clear comments on mocks.
> 4.  **Async Logic**: Ensure all async operations are properly awaited and errors are handled.

## Proposed Changes

### 1. Cron Service Implementation & Tests

#### [MODIFY] [src/services/cron.service.ts](file:///Users/andydev/game manager v0/backend/src/services/cron.service.ts)

- **Implement** `cleanupExpiredTokens`:
  - Run daily at 04:00 AM.
  - Delete `RefreshToken` where `expires` < `new Date()`.
- **Implement** `cleanupPendingOrders`:
  - Run daily at 04:30 AM.
  - Delete `Order` where `status: PENDING` and `createdAt` < 24h ago.

#### [NEW] [src/services/cron.service.test.ts](file:///Users/andydev/game manager v0/backend/src/services/cron.service.test.ts)

- **Scope**:
  - `cleanupExpiredTokens`: Verify `RefreshToken.deleteMany` is called with **specific date query** (not global).
  - `cleanupPendingOrders`: Verify `Order.deleteMany` filters by `status: PENDING` and `createdAt`.
- **Approach**: Pure Unit tests. Mock `RefreshToken` and `Order` models.

### 2. Game Aggregator Tests

#### [NEW] [src/services/game-aggregator.service.test.ts](file:///Users/andydev/game manager v0/backend/src/services/game-aggregator.service.test.ts)

- **Scope**:
  - `enrichGameData`: Verify it calls RAWG/Steam services.
  - **Fallback Logic**: Mock external failures to ensure app stability.
- **Approach**: Mock `rawgService` and `steamService`. ISOLATED from DB.

### 3. Payment Resilience

#### [MODIFY] [src/services/payment.service.test.ts](file:///Users/andydev/game manager v0/backend/src/services/payment.service.test.ts)

- **Scenario**: "Email Service Failure".
- **Test**: Mock `mailService.sendPurchaseConfirmation` to throw.
- **Expectation**: `simulatePurchase` succeeds (Order created). Error logged but not thrown.

## Verification Plan

1. Run `npm test src/services/cron.service.test.ts`
2. Run `npm test src/services/game-aggregator.service.test.ts`
3. Run `npm test src/services/payment.service.test.ts`
