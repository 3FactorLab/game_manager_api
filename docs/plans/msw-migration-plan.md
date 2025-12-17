# MSW Migration Plan - Massive Implementation

## Executive Summary

**Scope**: Migrate 13 test files from `vi.mock(service)` to MSW  
**Timeline**: 2.5 days concentrated work (20 hours)  
**Phases**: 5 execution phases + 1 cleanup phase  
**Risk Level**: 🟡 Medium (mitigated with checkpoints & rollback procedures)

**Quick Stats**:

- **Phase 1**: 2 files, 2h (Low-risk wins)
- **Phase 2**: 3 files, 3h (Auth flow)
- **Phase 3**: 3 files, 4h (State management)
- **Phase 4**: 4 files, 5h (Multi-service pages)
- **Phase 5**: Cleanup, 2.5h (Organization & validation)

**Success Metrics**:

- ✅ 100% test pass rate maintained
- ✅ `vi.mock(service)` count: 82 → ≤20
- ✅ Test execution time: ≤ baseline + 10%

---

## 🚨 Emergency Rollback (Quick Reference)

**If Single File Fails**:

```bash
git checkout HEAD -- <file>
# Debug in isolation, fix, and retry
```

**If Phase Fails**:

```bash
git reset --hard <phase-start-commit>
# Investigate root cause, document in msw-migration-assessment.md
```

**Nuclear Option** (Abort entire migration):

```bash
git checkout main
git branch -D feat/msw-migration
git checkout backup/pre-msw-migration
```

> [!CAUTION]
> Full rollback procedures with detailed steps available at line 515.

---

## Timeline (Concentrated Execution)

### Day 1 (7 hours)

- **Morning** (3h): Phase 1 (2 files) + Phase 2 start
- **Afternoon** (4h): Phase 2 complete (3 files)
- **End of Day**: 5/13 files migrated ✅

### Day 2 (8 hours)

- **Morning** (4h): Phase 3 (3 files) - Complex state management
- **Afternoon** (4h): Phase 4 start (2 files)
- **End of Day**: 10/13 files migrated ✅

### Day 3 (5.5 hours)

- **Morning** (3h): Phase 4 complete (2 files)
- **Afternoon** (2.5h): Phase 5 cleanup + validation
- **End of Day**: Migration complete 🎉

**Total Estimated Time**: 20.5 hours (2.5 days concentrated work)

---

## Goal Description

Migrate **all** frontend tests from fragile `vi.mock(service)` patterns to MSW (Mock Service Worker) in a **concentrated effort**. This is a complete migration executed in sequential phases over 2.5 days of dedicated work.

## User Review Required

> [!WARNING]
> This is a **massive migration** requiring dedicated focus. All 13 test files will be migrated sequentially.
> **Risk**: Potential for temporary test breakage. Requires careful execution and verification at each step.

> [!IMPORTANT] > **Prerequisites**:
>
> - All current tests passing (baseline)
> - No active feature development during migration
> - Dedicated time allocated (2.5 days)
> - Rollback plan ready

---

## Pre-Migration Setup

### Baseline Establishment

- [ ] Run `npm test` → Document pass rate (target: 100%)
- [ ] Document test execution time (baseline for comparison)
- [ ] Create backup branch: `git checkout -b backup/pre-msw-migration`
- [ ] Create working branch: `git checkout -b feat/msw-migration`
- [ ] Commit current state: `git commit -m "chore: baseline before MSW migration"`

### Environment Verification

- [ ] Verify MSW infrastructure exists (`src/mocks/server.ts`, `handlers.ts`)
- [ ] Verify reference implementation (`StatsSection.test.tsx`) works
- [ ] Run dev servers: `npm run dev` (backend + frontend)
- [ ] Verify no console errors in browser

---

## Phase 0: Foundation (COMPLETED ✅)

**Status**: Already done

**Deliverables**:

- ✅ MSW infrastructure (`src/mocks/server.ts`, `handlers.ts`)
- ✅ Reference implementation (`StatsSection.test.tsx`)
- ✅ Documentation in `PROMPT_AI_front.md`
- ✅ Migration guides in `msw-migration-assessment.md`

---

## Phase 1: Low-Risk Wins (Day 1 Morning)

**Objective**: Build confidence with simple migrations

**Target Files** (2 files):

1. `DealSection.test.tsx` (~30 min)
2. `GameCard.test.tsx` (~30 min)

**Estimated Time**: 2 hours

### Execution Steps

#### For Each File:

1. **Analyze** current `vi.mock` usage
2. **Create** MSW handlers in `handlers.ts` or inline
3. **Migrate** one test case at a time
4. **Keep** old code commented until new passes
5. **Verify** `npm test <file>` passes
6. **Remove** old `vi.mock` code
7. **Commit** `git commit -m "test: migrate <file> to MSW"`

### Verification Checkpoints

**After Each File**:

- [ ] File's tests pass: `npm test <file>`
- [ ] No console warnings
- [ ] MSW handlers follow `StatsSection` pattern

**After Phase 1**:

- [ ] Run full suite: `npm test` → 100% passing
- [ ] Test execution time ≤ baseline + 5%
- [ ] Code review: Patterns consistent
- [ ] Commit phase: `git commit -m "test: complete Phase 1 MSW migration"`

**Rollback**: If any test fails, `git reset --hard HEAD~1` and debug in isolation

---

## Phase 2: Authentication Flow (Day 1 Afternoon)

**Objective**: Migrate critical auth paths

**Target Files** (3 files):

1. `RegisterPage.test.tsx` (~45 min)
2. `LoginPage.test.tsx` (~45 min)
3. `ChangePasswordModal.test.tsx` (~30 min)

**Estimated Time**: 3 hours

### New Handlers Required

Add to `handlers.ts`:

```typescript
// Authentication handlers
http.post('/api/users/register', ({ request }) => {
  // Handle registration
  return HttpResponse.json({
    token: 'mock-token',
    refreshToken: 'mock-refresh',
    user: { id: '1', email: 'test@example.com', role: 'user' }
  });
}),

http.post('/api/users/login', ({ request }) => {
  // Handle login
  return HttpResponse.json({
    token: 'mock-token',
    refreshToken: 'mock-refresh',
    user: { id: '1', email: 'test@example.com', role: 'user' }
  });
}),

http.put('/api/users/update', ({ request }) => {
  // Handle profile update
  return HttpResponse.json({
    message: 'User updated',
    user: { id: '1', username: 'Updated' }
  });
}),
```

### Execution Steps

#### For Each File:

1. **Add** auth handlers to `handlers.ts`
2. **Migrate** tests sequentially
3. **Test** error scenarios (401, 400) with `server.use()`
4. **Test** success scenarios
5. **Verify** `npm test <file>` passes
6. **Commit** after each file

### Verification Checkpoints

**After Each File**:

- [ ] File's tests pass
- [ ] Error scenarios tested
- [ ] Success scenarios tested

**After Phase 2**:

- [ ] Run full suite: `npm test` → 100% passing
- [ ] Manual test: Login/Register in browser works
- [ ] No console errors
- [ ] No `vi.mock('../../services/auth.service')` in codebase
- [ ] Commit phase: `git commit -m "test: complete Phase 2 MSW migration"`

**Success Criteria**:

- All auth tests use MSW
- Test coverage ≥ baseline
- Auth flow in browser still works

---

## Phase 3: State Management (Day 2 Morning)

**Objective**: Migrate complex React Query + Context tests

**Target Files** (3 files):

1. `AuthContext.test.tsx` (~90 min) ⚠️ **Critical Path**
2. `WishlistContext.test.tsx` (~60 min)
3. `CartContext.test.tsx` (~60 min)

**Estimated Time**: 4 hours

### Special Considerations

- **React Query**: May need `delay()` for loading states
- **Optimistic Updates**: Careful timing required
- **Flakiness Risk**: Run tests 3x to verify stability

### Execution Steps

#### For Each File:

1. **Identify** all API endpoints used by context
2. **Add** handlers for each endpoint
3. **Test** loading states with `delay(200)`
4. **Test** error states with error responses
5. **Test** optimistic updates (if applicable)
6. **Run** `npm test <file>` **3 times** (flakiness check)
7. **Commit** after each file

### Verification Checkpoints

**After Each File**:

- [ ] Tests pass 3 consecutive times
- [ ] Loading states tested
- [ ] Error states tested
- [ ] No flakiness detected

**After Phase 3**:

- [ ] Run full suite: `npm test` → 100% passing
- [ ] Run suite **5 times** → No flakiness
- [ ] React Query cache behaves correctly
- [ ] Proper use of `server.use()` for test-specific overrides
- [ ] Commit phase: `git commit -m "test: complete Phase 3 MSW migration"`

**Rollback**: If flakiness increases, add `waitFor` with longer timeouts

---

## Phase 4: Multi-Service Pages (Day 2 Afternoon + Day 3)

**Objective**: Migrate complex pages with multiple service dependencies

**Target Files** (4 files):

1. `GameDetails.test.tsx` (~90 min)
2. `LibraryPage.test.tsx` (~90 min)
3. `CheckoutPage.test.tsx` (~90 min)
4. `ProtectedRoute.test.tsx` (~30 min)

**Estimated Time**: 5 hours

### New Handlers Required

Organize by domain in `handlers.ts`:

```typescript
// ========== GAMES DOMAIN ==========
http.get('/api/public/games/:id', ({ params }) => {
  return HttpResponse.json({
    _id: params.id,
    title: 'Mock Game',
    price: 29.99,
    // ... full game object
  });
}),

// ========== COLLECTION DOMAIN ==========
http.get('/api/collection', ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');

  return HttpResponse.json({
    data: mockGames,
    pagination: { total: 10, pages: 1, page, limit: 12 }
  });
}),

http.get('/api/users/wishlist', ({ request }) => {
  // Similar pagination pattern
}),

// ========== PAYMENTS DOMAIN ==========
http.post('/api/payments/checkout/simulate', ({ request }) => {
  return HttpResponse.json({
    success: true,
    orderId: 'mock-order-123'
  });
}),
```

### Execution Steps

#### For Each File:

1. **Identify** all API calls in component
2. **Add** handlers organized by domain
3. **Test** handler order (specific before generic)
4. **Migrate** tests one by one
5. **Verify** `npm test <file>` passes
6. **Commit** after each file

### Verification Checkpoints

**After Each File**:

- [ ] All API calls have handlers
- [ ] Handler order correct (specific first)
- [ ] Tests pass

**After Phase 4**:

- [ ] Run full suite: `npm test` → 100% passing
- [ ] `handlers.ts` organized by domain sections
- [ ] No duplicate handlers
- [ ] Test execution time ≤ baseline + 10%
- [ ] Commit phase: `git commit -m "test: complete Phase 4 MSW migration"`

**Success Criteria**:

- All page tests use MSW
- `handlers.ts` well-organized
- Zero `vi.mock(service)` for API services

---

## Phase 5: Cleanup & Optimization (Day 3 Afternoon)

**Objective**: Polish and optimize the migration

**Tasks**:

1. **Organize `handlers.ts`** by domain with clear sections
2. **Remove** all unused `vi.mock(service)` imports
3. **Add** JSDoc comments to complex handlers
4. **Verify** no duplicate handlers
5. **Type safety verification** (PROMPT_AI compliance)
6. **Opportunistic refactoring** (PROMPT_AI compliance)
7. **Run** validation script

**Estimated Time**: 2.5 hours

### Cleanup Checklist

#### Handler Organization

- [ ] `handlers.ts` organized:
  ```typescript
  // ========== AUTH DOMAIN ==========
  // ========== GAMES DOMAIN ==========
  // ========== COLLECTION DOMAIN ==========
  // ========== PAYMENTS DOMAIN ==========
  ```
- [ ] Remove unused imports across all test files
- [ ] Add JSDoc to complex handlers
- [ ] Run `npm run lint:fix`

#### Type Safety Verification (PROMPT_AI Compliance)

> [!IMPORTANT]
> PROMPT_AI_front.md prohibits `any` types even in tests. All handlers must be properly typed.

- [ ] Review all handlers for type safety
- [ ] Replace implicit `any` with proper types:

  ```typescript
  // ❌ Before (implicit any)
  http.post("/api/users/login", ({ request }) => {
    // request is implicitly any
  });

  // ✅ After (properly typed)
  http.post("/api/users/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    return HttpResponse.json({
      token: "mock-token",
      user: { id: "1", email: body.email, role: "user" },
    });
  });
  ```

- [ ] Use `Partial<T>` for mock data where appropriate
- [ ] Verify no `any` types in test files

#### Opportunistic Refactoring (PROMPT_AI Compliance)

> [!TIP]
> PROMPT_AI_front.md Section 6: "Si tocas un archivo y ves deuda técnica, arréglala"

While migrating, if you noticed tech debt in test files:

- [ ] Remove unused imports
- [ ] Fix inconsistent formatting
- [ ] Consolidate duplicate test setup code
- [ ] Extract common test utilities to `src/test-utils/`
- [ ] Remove commented-out code
- [ ] Standardize test descriptions

#### Final Verification

- [ ] Run `npm run lint` → No errors
- [ ] Run `npm test` → 100% passing
- [ ] Commit: `git commit -m "test: cleanup MSW handlers and imports"`

---

## Continuous Verification (All Phases)

### After Each File Migration

- [ ] `npm test <file>` passes
- [ ] No new console warnings
- [ ] Commit changes

### After Each Phase

- [ ] `npm test` → 100% passing
- [ ] Test execution time within acceptable range
- [ ] Code review patterns
- [ ] Commit phase completion

### Daily End-of-Day

- [ ] Full test suite passes
- [ ] Push to remote: `git push origin feat/msw-migration`
- [ ] Document any blockers

---

## Validation Script (VDD)

Create `frontend/scripts/validate-msw-migration.js`:

```javascript
#!/usr/bin/env node
/**
 * Validates MSW migration completion
 * Usage: node scripts/validate-msw-migration.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Validating MSW Migration...\n");

// Helper to get all test files
function getAllTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllTestFiles(filePath, fileList);
    } else if (file.endsWith(".test.tsx") || file.endsWith(".test.ts")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const testDir = path.join(__dirname, "../src");
const testFiles = getAllTestFiles(testDir);

let viMockServiceCount = 0;
let mswUsageCount = 0;
const viMockFiles = [];

testFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");

  // Count vi.mock for services (fragile pattern)
  if (content.match(/vi\.mock\(['"].*service['"]/)) {
    viMockServiceCount++;
    viMockFiles.push(path.relative(testDir, file));
  }

  // Count MSW usage
  if (content.includes("from 'msw'") || content.includes('from "msw"')) {
    mswUsageCount++;
  }
});

console.log(`📊 Migration Statistics:`);
console.log(`   vi.mock(service) count: ${viMockServiceCount} (target: ≤20)`);
console.log(`   MSW usage count: ${mswUsageCount} (target: ≥10)`);

if (viMockFiles.length > 0) {
  console.log(`\n⚠️  Files still using vi.mock(service):`);
  viMockFiles.forEach((f) => console.log(`   - ${f}`));
}

// Run tests
console.log(`\n🧪 Running test suite...`);
try {
  execSync("npm test", { stdio: "inherit" });
  console.log(`\n✅ All tests passing!`);
} catch (error) {
  console.error(`\n❌ Tests failed!`);
  process.exit(1);
}

// Final verdict
if (viMockServiceCount > 20) {
  console.error(
    `\n❌ Migration incomplete: ${viMockServiceCount} vi.mock(service) usages remaining`
  );
  process.exit(1);
}

console.log(`\n✅ MSW Migration Complete!`);
console.log(`   - ${mswUsageCount} files using MSW`);
console.log(
  `   - ${viMockServiceCount} acceptable vi.mock usages (UI libs only)`
);
```

**Add to `package.json`**:

```json
{
  "scripts": {
    "validate:msw": "node scripts/validate-msw-migration.js"
  }
}
```

---

## Rollback Strategy

### If Single File Fails

1. **Revert** that file: `git checkout HEAD -- <file>`
2. **Debug** in isolation
3. **Fix** and retry
4. **Continue** with next file

### If Phase Fails

1. **Revert** entire phase: `git reset --hard <phase-start-commit>`
2. **Investigate** root cause
3. **Document** issue in `msw-migration-assessment.md`
4. **Fix** and retry phase

### If Critical Bug Blocks Migration

1. **Pause** migration
2. **Create** hotfix branch from main
3. **Fix** bug
4. **Resume** migration after fix merged

### Nuclear Option

```bash
git checkout main
git branch -D feat/msw-migration
git checkout backup/pre-msw-migration
```

---

## Success Metrics

### Quantitative (Must Meet All)

- ✅ `vi.mock(service)` count: 82 → ≤20 (UI libs only)
- ✅ Test pass rate: 100% maintained
- ✅ Test execution time: ≤ baseline + 10%
- ✅ MSW handler count: 15-20 handlers
- ✅ Zero flaky tests introduced

### Qualitative

- Tests are more realistic (intercept actual HTTP)
- Easier to understand (no mock implementation details)
- Survives refactors (decoupled from service internals)

---

## Final Verification

### Before Declaring Complete

- [ ] Run `npm test` → 100% passing
- [ ] Run `npm run build` → No errors
- [ ] Run validation script: `npm run validate:msw` → Passes
- [ ] Manual smoke test in browser:
  - [ ] Login/Register works
  - [ ] Catalog loads
  - [ ] Wishlist works
  - [ ] Checkout works
- [ ] All phases marked complete
- [ ] No console errors in any test
- [ ] Test execution time acceptable

### Post-Migration Tasks

- [ ] Merge to main: `git checkout main && git merge feat/msw-migration`
- [ ] Delete backup branch: `git branch -D backup/pre-msw-migration`
- [ ] Update `pendientes.md`: Mark MSW migration complete
- [ ] Update `PROMPT_AI_front.md` if new patterns emerged
- [ ] Team retrospective: Document lessons learned
- [ ] Celebrate! 🎉

---

## Emergency Contacts & Resources

**Reference Implementation**: `StatsSection.test.tsx`
**Documentation**: `msw-migration-assessment.md`
**MSW Docs**: https://mswjs.io/docs/
**PROMPT_AI**: `frontend/AI/PROMPT_AI_front.md` (Section 3)

**If Stuck**:

1. Check `StatsSection.test.tsx` for pattern
2. Review `msw-migration-assessment.md` common pitfalls
3. Check MSW docs for specific handler syntax
4. Rollback and debug in isolation
