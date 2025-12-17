# Test Colocation Migration Plan

## Goal

Migrate backend tests from the centralized `tests/` directory to a colocated structure within `src/` to match the Frontend architecture and improve Developer Experience.

## User Review Required

> [!NOTE]
> This is a structural refactor. No logic changes.
> Breaking Change: `npm test` will look for files in `src/` instead of `tests/`.

## Proposed Changes

### Configuration

#### [MODIFY] [jest.config.cjs](/Users/andydev/game manager v0/backend/jest.config.cjs)

- Update `testMatch` or default behavior to look for `src/**/*.test.ts`.
- Move `tests/setup.ts` to `src/tests/setup.ts` or similar utility location.

### Detailed File Migration Map

#### Unit Tests (Colocation)

| Original Path                      | New Path                                  | Rationale                       |
| :--------------------------------- | :---------------------------------------- | :------------------------------ |
| `tests/auth.service.test.ts`       | `src/services/auth.service.test.ts`       | Unit tests for Auth Service     |
| `tests/auth.refresh.test.ts`       | `src/services/auth.refresh.test.ts`       | Refresh token logic tests       |
| `tests/rawg.service.test.ts`       | `src/services/rawg.service.test.ts`       | Unit tests for RAWG Adapter     |
| `tests/steam.service.test.ts`      | `src/services/steam.service.test.ts`      | Unit tests for Steam Adapter    |
| `tests/collection.service.test.ts` | `src/services/collection.service.test.ts` | Logic for collection management |
| `tests/payment.service.test.ts`    | `src/services/payment.service.test.ts`    | Payment processing units        |
| `tests/user.service.test.ts`       | `src/services/user.service.test.ts`       | User service logic              |
| `tests/validation.test.ts`         | `src/middleware/validation.test.ts`       | Tests for Zod/Validators logic  |

#### Endpoint/Integration Tests (Routes)

| Original Path                | New Path                                 | Rationale                                     |
| :--------------------------- | :--------------------------------------- | :-------------------------------------------- |
| `tests/auth.routes.test.ts`  | `src/routes/auth.routes.test.ts`         | Tests HTTP endpoints directly                 |
| `tests/public.games.test.ts` | `src/routes/publicGame.routes.test.ts`   | Tests Public Game Routes                      |
| `tests/catalog.test.ts`      | `src/routes/game.routes.test.ts`         | Tests Catalog endpoints                       |
| `tests/wishlist.test.ts`     | `src/routes/user.routes.test.ts`         | Tests User Wishlist routes                    |
| `tests/user.delete.test.ts`  | `src/routes/user.routes.delete.test.ts`  | Specific delete flow (keep separate or merge) |
| `tests/user.avatar.test.ts`  | `src/routes/user.routes.avatar.test.ts`  | Avatar upload flow                            |
| `tests/game.image.test.ts`   | `src/routes/game.routes.image.test.ts`   | Image upload flow                             |
| `tests/game.delete.test.ts`  | `src/routes/game.routes.delete.test.ts`  | Delete game flow                              |
| `tests/game.update.test.ts`  | `src/routes/game.routes.update.test.ts`  | Update game flow                              |
| `tests/role.test.ts`         | `src/middleware/role.middleware.test.ts` | Tests Role Middleware enforcement             |

#### Shared Integration & Setup

| Original Path                         | New Path                                          | Rationale                                       |
| :------------------------------------ | :------------------------------------------------ | :---------------------------------------------- |
| `tests/integration/full-flow.test.ts` | `src/tests/integration/full-flow.test.ts`         | Cross-module flows kept in a shared test folder |
| `tests/order.integration.test.ts`     | `src/tests/integration/order.integration.test.ts` | Order flow integration                          |
| `tests/user.management.test.ts`       | `src/tests/integration/user.management.test.ts`   | Admin user management flows                     |
| `tests/setup.ts`                      | `src/tests/setup.ts`                              | Global test setup                               |

### Configuration Updates

- **`jest.config.cjs`**: Update `setupFilesAfterEnv` to `<rootDir>/src/tests/setup.ts`.
- **`tsconfig.json`**: Ensure `include` covers `src/**/*.test.ts` (usually does via `src/**/*`).

## Verification Plan

### Automated Tests

1. Run `npm test` to ensure Jest finds all migrated tests.
2. Verify coverage reports still work.
3. Verify `import` paths in tests (relative paths will change!).

### Manual Verification

- Check VS Code grouping (if applicable).
