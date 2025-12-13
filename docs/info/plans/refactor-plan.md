# Architecture Refactoring (PROMPT_AI Compliance)

## Goal Description

Refactor `user`, `payment`, and `order` modules to comply with strict layered architecture. Centralize logic in services, use `asyncHandler`, and standard DTOs.
**Verification Strategy**: Leverage existing integration tests (`wishlist.test.ts`, `order.integration.test.ts`) which should pass without modification. Update unit tests (`payment.service.test.ts`) that are directly affected.

## Architectural Alignment (from architecture.md)

> [!NOTE]
> This refactor explicitly enforces the documented **"Layered REST API with Service-Oriented Logic"**:
>
> - **Thin Controllers**: Moving logic out of `payment.controller` aligns with the directive that controllers only handle HTTP.
> - **Service Pattern**: Centralizing simulation logic in `PaymentService` creates a reusable business unit.
> - **Defense in Depth**: Moving simulation to service allows reusing it in other contexts (e.g. tests) without faking HTTP objects.

## Critical Reminders (from Context Analysis)

> [!WARNING]
>
> 1.  **Zod Compatibility**: Ensure new DTOs do not conflict with recent Zod migration. Maintain parity `confirmPassword` etc.
> 2.  **Cascade Logic**: `UserService` and `OrderService` must preserve existing Cascade Delete logic (e.g., deleting user deletes orders/games).
> 3.  **Test Safety**: Strictly enforce scoped data cleanup in tests. NEVER use `deleteMany({})`.

## Frontend Analysis Findings

> [!CAUTION] > **Broken Frontend Code Detected**:
>
> - `collection.service.ts` attempts to call `POST /wishlist` with a body `{ gameId }`. This route **does not exist** (404).
> - `user.service.ts` correctly calls `POST /wishlist/:gameId`.
>
> **Action**: The backend refactor must **strictly maintain** the `POST /wishlist/:gameId` signature to support the working parts of the frontend. We will NOT change the API to support the broken code.

## Deep Flow Logic (Specific Moves)

### 1. Wishlist Flow (`POST /wishlist/:id`)

- **Current Problem**: Controller handles DB lookups (`Game.findById`, `User.findById`) and business logic (`user.wishlist.includes`).
- **Target Logic**: `UserService.addToWishlist(userId, gameId)` checks. Controller handles 400/404.

### 2. Order Flow (`GET /my-orders`)

- **Current Problem**: Controller directly query Mongoose (`Order.find`).
- **Target Logic**: `OrderService.getUserOrders(userId)` abstracts query.

### 3. Payment Flow (`POST /checkout/simulate`)

- **Current Problem**: Monolithic Controller.
- **Target Logic**: `PaymentService.simulatePurchase` unifies logic. Use `Promise.all` for concurrency.

## Proposed Changes (Module-Based Execution)

### Implementation Standard: Error Handling

> [!TIP] > **Services MUST throw `AppError`**:
> When a business rule fails (e.g. "Game not found", "Insufficient funds"), usage of `throw new AppError(message, statusCode)` is mandatory.
> This allows the Controller's `asyncHandler` to catch it and send the correct HTTP response automatically.

### Phase 1: User Module Refactor [x] (Completed)

Isolate wishlist logic first.

1.  **DTO**:
    - [NEW] [user.dto.ts](file:///Users/andydev/game manager v0/backend/src/dtos/user.dto.ts) (Define types).
2.  **Service**:
    - [NEW] [user.service.ts](file:///Users/andydev/game manager v0/backend/src/services/user.service.ts) (Move Wishlist logic).
    - [NEW] [user.service.test.ts](file:///Users/andydev/game manager v0/backend/tests/user.service.test.ts) (New unit tests for parity).
3.  **Controller**: [user.controller.ts](file:///Users/andydev/game manager v0/backend/src/controllers/user.controller.ts)
    - Apply `asyncHandler`.
    - Delegate to `UserService`.

### Phase 2: Order Module Refactor [x] (Completed)

1.  **Service**: [order.service.ts](file:///Users/andydev/game manager v0/backend/src/services/order.service.ts)
2.  **Controller**: [order.controller.ts](file:///Users/andydev/game manager v0/backend/src/controllers/order.controller.ts)

### Phase 3: Payment Module Refactor [x] (Completed)

1.  **DTO**:
    - [NEW] [payment.dto.ts](file:///Users/andydev/game manager v0/backend/src/dtos/payment.dto.ts)
2.  **Service**: [payment.service.ts](file:///Users/andydev/game manager v0/backend/src/services/payment.service.ts) (Simulate + Email).
3.  **Controller**: [payment.controller.ts](file:///Users/andydev/game manager v0/backend/src/controllers/payment.controller.ts)
4.  **Tests**: [payment.service.test.ts](file:///Users/andydev/backend/tests/payment.service.test.ts) (Update).

## Verification Plan [x] (Completed)

### Automated Tests (Crucial)

1.  **Run Compilation**: `npm run build`
2.  **Run Regression Tests**:
    - `npx jest tests/wishlist.test.ts` (Must pass)
    - `npx jest tests/order.integration.test.ts` (Must pass)
3.  **Run Unit Tests**:
    - `npx jest tests/payment.service.test.ts` (Updated)
    - `npx jest tests/user.service.test.ts` (New)

### Manual Verification

- Verify `simulate` endpoint uses the new service stack and sends email (mocked).
- Check Swagger UI (`/api-docs`) loads correctly (to ensure decorators/routes didn't break).

## Post-Refactor: Frontend Cleanup [x] (Completed)

> [!NOTE]
> Addressed after backend stability is confirmed.

- **File**: `frontend/src/features/collection/services/collection.service.ts`
- **Issue**: Attempts to use invalid route signature (Body instead of Params).
- **Fix**: Update `addToWishlist` to use `POST /users/wishlist/${gameId}` to match backend and `user.service.ts`.
