# Tasks: Sync History Provenance

**Input**: Design documents from `/specs/014-sync-history-provenance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sync-history-provenance-api.md, quickstart.md

**Tests**: Required by FR-001 through FR-013 and success criteria SC-001 through SC-006.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add browser-safe sync history/provenance contract shapes and fixtures.

- [x] T001 [P] Add sync history and live provenance contract types in packages/contracts/src/esi-sync.ts
- [x] T002 [P] Add sync history and live provenance Zod schemas in packages/contracts/src/esi-sync.schema.ts
- [x] T003 [P] Add ESI sync history browser fixtures in apps/web/tests/fixtures/esiSync.ts
- [x] T004 [P] Add Numbers live provenance fixtures in apps/web/tests/fixtures/numbers.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add scoped store/normalizer helpers used by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Add unit tests for sync history normalization and secret-free summaries in apps/web/tests/unit/esi-sync-history.test.ts
- [x] T006 [P] Add unit tests for latest live provenance modes in apps/web/tests/unit/esi-sync-history.test.ts
- [x] T007 Add browser-safe sync history/provenance helpers in netlify/functions/_shared/esi-sync-history.ts
- [x] T008 Add bounded scoped history lookup and snapshot-link lookup in netlify/functions/_shared/esi-sync-request-store.ts
- [x] T009 Use existing latest snapshot id/read helper support in netlify/functions/_shared/numbers-store.ts

**Checkpoint**: History/provenance summaries are testable without browser workflows.

---

## Phase 3: User Story 1 - Inspect Latest Live Numbers Provenance (Priority: P1) MVP

**Goal**: Show whether the visible Numbers snapshot came from a completed ESI sync or historical processed data.

**Independent Test**: Seed a completed sync linked to a Numbers snapshot, load Numbers, and verify live provenance, section health, source count, timestamp, and no-execution boundary.

### Tests for User Story 1

- [x] T010 [P] [US1] Add contract tests for GET /api/numbers live provenance modes in apps/web/tests/contract/numbers-api.test.ts
- [x] T011 [P] [US1] Add browser smoke test for latest live Numbers provenance in apps/web/e2e/numbers-layer.spec.ts

### Implementation for User Story 1

- [x] T012 [US1] Extend netlify/functions/numbers.ts to include liveProvenance in browser-safe Numbers responses
- [x] T013 [US1] Extend apps/web/src/features/numbers/services/numbersClient.ts and apps/web/src/features/numbers/state/useNumbersSnapshot.ts for live provenance
- [x] T014 [US1] Render latest live provenance in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T015 [US1] Add browser API fixtures for Numbers live provenance in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Story 1 is independently functional and shows latest live provenance without exposing secrets or actions.

---

## Phase 4: User Story 2 - Review Recent Sync History (Priority: P2)

**Goal**: Show recent scoped Numbers ESI sync attempts in ESI sync settings.

**Independent Test**: Seed queued, claimed, completed, and failed sync requests for the active corporation and verify recent history is scoped, newest-first, bounded, and browser-safe.

### Tests for User Story 2

- [x] T016 [P] [US2] Add contract tests for GET /api/esi-sync/status sync history in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T017 [P] [US2] Add browser smoke test for recent sync history in apps/web/e2e/esi-token-vault-sync.spec.ts

### Implementation for User Story 2

- [x] T018 [US2] Extend netlify/functions/esi-sync.ts to include bounded recent sync history in status responses
- [x] T019 [US2] Extend apps/web/src/features/esi-sync/services/esiSyncClient.ts and apps/web/src/features/esi-sync/state/useEsiSync.ts for sync history
- [x] T020 [US2] Render recent sync history in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
- [x] T021 [US2] Add browser API fixtures for ESI sync history in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Stories 1 and 2 show live provenance plus recent scoped sync history.

---

## Phase 5: User Story 3 - Inspect Failed Or Partial Sync Outcomes (Priority: P3)

**Goal**: Explain failed and partial sync outcomes with safe section-level status and failure reasons.

**Independent Test**: Seed failed and partial completed sync requests, load Numbers and ESI sync settings, and verify affected sections and failure reasons are visible without retry or execution controls.

### Tests for User Story 3

- [x] T022 [P] [US3] Add contract tests for failed and partial sync summaries in apps/web/tests/contract/esi-sync-api.test.ts and apps/web/tests/contract/numbers-api.test.ts
- [x] T023 [P] [US3] Add browser smoke coverage for failed and partial sync outcome display in apps/web/e2e/esi-token-vault-sync.spec.ts and apps/web/e2e/numbers-layer.spec.ts

### Implementation for User Story 3

- [x] T024 [US3] Add failed and partial status display language in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
- [x] T025 [US3] Add missing/stale section provenance language in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T026 [US3] Ensure history/provenance responses exclude raw ESI payloads, token material, worker secrets, retry schedules, dispatch targets, and external execution handles in netlify/functions/_shared/esi-sync-history.ts

**Checkpoint**: Failed and partial outcomes are clear, browser-safe, and non-executing.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap update, and full quality gate.

- [x] T027 [P] Update README sync history and live provenance notes in README.md
- [x] T028 [P] Update roadmap with M14 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T029 Run npm run lint and record result in specs/014-sync-history-provenance/quickstart.md
- [x] T030 Run npm run typecheck and record result in specs/014-sync-history-provenance/quickstart.md
- [x] T031 Run npm test and record result in specs/014-sync-history-provenance/quickstart.md
- [x] T032 Run npm run test:e2e and record result in specs/014-sync-history-provenance/quickstart.md
- [x] T033 Run npm run build and record result in specs/014-sync-history-provenance/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion and can integrate after US1 UI patterns are established.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 rendering surfaces.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers MVP live provenance.
- **User Story 2 (P2)**: Can start after Foundational; adds history in ESI sync settings.
- **User Story 3 (P3)**: Starts after US1/US2; adds partial/failed outcome clarity.

### Parallel Opportunities

- T001, T002, T003, and T004 can run in parallel.
- T005 and T006 can run in parallel after contract shape is clear.
- T010 and T011 can run in parallel for US1 tests.
- T016 and T017 can run in parallel for US2 tests.
- T022 and T023 can run in parallel for US3 tests.
- T027 and T028 can run in parallel after behavior is stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add contract tests for GET /api/numbers live provenance modes in apps/web/tests/contract/numbers-api.test.ts"
Task: "Add browser smoke test for latest live Numbers provenance in apps/web/e2e/numbers-layer.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Add browser-safe contract types/schemas and fixtures.
2. Add scoped history/provenance normalization helpers.
3. Extend Numbers response and UI with latest provenance.
4. Validate US1 independently before adding full history.

### Incremental Delivery

1. Add latest live provenance for Numbers.
2. Add bounded recent sync history in ESI sync settings.
3. Add failed/partial outcome detail and boundary language.
4. Update docs and run the complete validation gate from quickstart.md.

### Notes

- M14 does not retry syncs, dispatch workers, refresh tokens, fetch ESI data in browser/request paths, write to EVE, move wallets or assets, mutate contracts, change roles, or execute external-service actions.
- Sync history is read-only and scoped to the active command corporation.
- Raw ESI payloads and token material must remain outside browser responses.
