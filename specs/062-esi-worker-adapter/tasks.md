# Tasks: ESI Worker Adapter Hardening

**Input**: Design documents from `/specs/062-esi-worker-adapter/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because M62 changes token refresh, worker ingestion, error classification, and data-boundary behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependency and current-state baseline.

- [x] T001 Add the approved ESI TypeScript client dependency to package.json and package-lock.json
- [x] T002 Inspect the installed ESI TypeScript client exports and record the integration decision in specs/062-esi-worker-adapter/research.md
- [x] T003 [P] Confirm existing ignore configuration still covers Node build/runtime artifacts in .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared server-side support required before user-story work.

- [x] T004 [P] Add refresh-token grant unit coverage in apps/web/tests/unit/eve-sso-live.test.ts
- [x] T005 Add refresh-token grant helper in netlify/functions/_shared/eve-sso-live.ts
- [x] T006 [P] Add vault token update unit coverage in apps/web/tests/unit/esi-token-vault-store.test.ts
- [x] T007 Add refreshed token persistence helper in netlify/functions/_shared/esi-token-vault-store.ts
- [x] T008 [P] Add adapter failure classification and safety tests in apps/web/tests/unit/esi-worker-adapter.test.ts
- [x] T009 Create shared server-side adapter skeleton and failure types in netlify/functions/_shared/esi-worker-adapter.ts

**Checkpoint**: Token refresh and adapter foundation are available without changing Numbers ingestion behavior.

---

## Phase 3: User Story 1 - Reliable Numbers Pulls (Priority: P1) MVP

**Goal**: Numbers worker reads survive token refresh, pagination, and transient failures while preserving partial success.

**Independent Test**: Mock a near-expired vaulted token, paginated asset endpoint, and transient endpoint failure; verify the worker refreshes the token, collects pages, retries transient failures, and writes a safe derived Numbers snapshot.

### Tests for User Story 1

- [x] T010 [P] [US1] Add adapter token-refresh and bounded pagination tests in apps/web/tests/unit/esi-worker-adapter.test.ts
- [x] T011 [P] [US1] Add Numbers ingestion partial success and paginated endpoint tests in apps/web/tests/unit/esi-numbers-ingestion.test.ts

### Implementation for User Story 1

- [x] T012 [US1] Implement token freshness checks and vault refresh updates in netlify/functions/_shared/esi-worker-adapter.ts
- [x] T013 [US1] Implement bounded retry and paginated read support in netlify/functions/_shared/esi-worker-adapter.ts
- [x] T014 [US1] Refactor netlify/functions/_shared/esi-numbers-ingestion.ts to consume adapter endpoint results
- [x] T015 [US1] Preserve derived snapshot provenance and partial endpoint failures in netlify/functions/_shared/esi-numbers-ingestion.ts
- [x] T016 [US1] Run focused US1 tests with npm test -- esi-worker-adapter esi-numbers-ingestion

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Inspectable ESI Failures (Priority: P2)

**Goal**: Sync results distinguish safe ESI failure categories without exposing secrets.

**Independent Test**: Mock forbidden, unauthorized, rate-limited, server-error, network, timeout, and malformed responses and verify classified safe results.

### Tests for User Story 2

- [x] T017 [P] [US2] Add failure category matrix tests in apps/web/tests/unit/esi-worker-adapter.test.ts
- [x] T018 [P] [US2] Add no-secret ingestion result tests in apps/web/tests/unit/esi-numbers-ingestion.test.ts

### Implementation for User Story 2

- [x] T019 [US2] Complete ESI status and fetch error classification in netlify/functions/_shared/esi-worker-adapter.ts
- [x] T020 [US2] Ensure netlify/functions/_shared/esi-numbers-ingestion.ts converts classified failures into safe section risks and follow-ups
- [x] T021 [US2] Run focused US2 tests with npm test -- esi-worker-adapter esi-numbers-ingestion

**Checkpoint**: User Story 2 produces classified, browser-safe failure summaries.

---

## Phase 5: User Story 3 - Durable Adapter Boundary (Priority: P3)

**Goal**: Future worker consumers can reuse the adapter without directly handling tokens or ad hoc fetch logic.

**Independent Test**: A mocked adapter consumer can request a read and receive normalized success/failure objects without direct token access.

### Tests for User Story 3

- [x] T022 [P] [US3] Add adapter contract tests for caller-visible normalized results in apps/web/tests/unit/esi-worker-adapter.test.ts

### Implementation for User Story 3

- [x] T023 [US3] Export stable adapter request/result types from netlify/functions/_shared/esi-worker-adapter.ts
- [x] T024 [US3] Document the adapter boundary in specs/062-esi-worker-adapter/contracts/esi-worker-adapter.md
- [x] T025 [US3] Run focused US3 tests with npm test -- esi-worker-adapter

**Checkpoint**: The adapter boundary is reusable and documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and durable project documentation.

- [x] T026 [P] Update docs/roadmap.md with M62 scope and validation status
- [x] T027 [P] Update specs/062-esi-worker-adapter/quickstart.md with final validation commands and evidence
- [x] T028 Run npm run typecheck
- [x] T029 Run npm run lint
- [x] T030 Run npm run build
- [x] T031 Run git diff --check
- [x] T032 Review all touched browser/API responses for token, ciphertext, raw ESI payload, and secret exposure

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and may run after US1 adapter behavior exists.
- **User Story 3 (Phase 5)**: Depends on Foundational and may run after US1 stabilizes exported behavior.
- **Polish (Phase 6)**: Depends on selected user stories.

### User Story Dependencies

- **User Story 1 (P1)**: First delivery target.
- **User Story 2 (P2)**: Builds on adapter classification used by US1.
- **User Story 3 (P3)**: Stabilizes and documents the adapter boundary after behavior is proven.

### Parallel Opportunities

- T003 can run while dependency installation is reviewed.
- T004, T006, and T008 can be written in parallel because they touch separate test concerns.
- T010 and T011 can be written in parallel after the adapter skeleton exists.
- T017 and T018 can be written in parallel.
- T026 and T027 can be updated in parallel with final validation.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete setup and foundational token/adapter support.
2. Implement US1 token refresh, pagination, bounded retry, and Numbers ingestion refactor.
3. Validate with focused Jest tests before expanding failure taxonomy and documentation.

### Incremental Delivery

1. Add dependency and adapter skeleton.
2. Add token-refresh persistence.
3. Move Numbers reads to the adapter.
4. Add classified failure coverage.
5. Stabilize contracts and documentation.

### Quality Gate

Before completion, run:

```bash
npm test -- esi-worker-adapter esi-numbers-ingestion eve-sso-live esi-token-vault-store
npm run typecheck
npm run lint
npm run build
git diff --check
```
