# Tasks: Numbers Operating Layer

**Input**: Design documents from `/specs/008-numbers-layer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/numbers-api.md, quickstart.md

**Tests**: Required by FR-010 and success criteria SC-001 through SC-006.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared contracts and server module locations for Numbers.

- [x] T001 [P] Add Numbers contract types in packages/contracts/src/numbers.ts
- [x] T002 [P] Add Zod schemas for snapshots, sections, metrics, provenance, and responses in packages/contracts/src/numbers.schema.ts
- [x] T003 Export Numbers contracts and schemas from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core normalization and store primitives required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Add Numbers document normalization with explicit missing sections in netlify/functions/_shared/numbers-normalizer.ts
- [x] T005 Add MongoDB Numbers store for latest scoped snapshot lookup in netlify/functions/_shared/numbers-store.ts
- [x] T006 [P] Add unit tests for Numbers normalization, provenance, section status, and safe field handling in apps/web/tests/unit/numbers-normalizer.test.ts
- [x] T007 [P] Add contract tests for Numbers snapshot and empty response schemas in apps/web/tests/contract/numbers-api.test.ts

**Checkpoint**: Numbers contracts and normalization are testable without browser or live MongoDB.

---

## Phase 3: User Story 1 - Inspect Corporation Numbers Snapshot (Priority: P1) MVP

**Goal**: Show a read-only corporation numbers snapshot across wallet, assets, logistics, market, and activity.

**Independent Test**: Seed a processed numbers snapshot and verify the API/UI render health metrics, trends, provenance, and observations.

### Tests for User Story 1

- [x] T008 [P] [US1] Add API contract tests for scoped GET /api/numbers snapshot responses in apps/web/tests/contract/numbers-api.test.ts
- [x] T009 [P] [US1] Add browser smoke test for full Numbers snapshot rendering in apps/web/e2e/numbers-layer.spec.ts

### Implementation for User Story 1

- [x] T010 [US1] Implement GET /api/numbers handler with scoped latest snapshot lookup in netlify/functions/numbers.ts
- [x] T011 [P] [US1] Add Numbers API client in apps/web/src/features/numbers/services/numbersClient.ts
- [x] T012 [P] [US1] Add Numbers state hook in apps/web/src/features/numbers/state/useNumbersSnapshot.ts
- [x] T013 [US1] Add Numbers panel components for sections, metrics, and provenance in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T014 [US1] Add Numbers route and render it in the command shell in apps/web/src/routes/NumbersRoute.tsx and apps/web/src/App.tsx
- [x] T015 [US1] Add browser API fixture data for Numbers snapshots in apps/web/e2e/fixtures/command-surfaces.ts and apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Story 1 is independently functional and browser-visible.

---

## Phase 4: User Story 2 - See Missing And Stale Numbers Data (Priority: P2)

**Goal**: Make absent and outdated numbers sections explicit instead of fabricating values.

**Independent Test**: Seed partial/stale snapshots and verify missing/stale section indicators and reasons are visible.

### Tests for User Story 2

- [x] T016 [P] [US2] Add unit tests for partial snapshots producing missing wallet/assets/logistics/market/activity sections in apps/web/tests/unit/numbers-normalizer.test.ts
- [x] T017 [P] [US2] Add browser smoke test for stale/missing Numbers section indicators in apps/web/e2e/numbers-layer.spec.ts

### Implementation for User Story 2

- [x] T018 [US2] Render stale and missing section states with reasons in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T019 [US2] Add no-data Numbers state for snapshot null responses in apps/web/src/features/numbers/components/NumbersPanel.tsx

**Checkpoint**: User Stories 1 and 2 work independently with complete and partial data.

---

## Phase 5: User Story 3 - Turn Numbers Findings Into Follow-Up Work (Priority: P3)

**Goal**: Present follow-up candidates as planning recommendations while preserving read-only boundaries.

**Independent Test**: Seed follow-up candidates and action-like browser inputs, then verify recommendations are visible and no action/execution language or mutation occurs.

### Tests for User Story 3

- [x] T020 [P] [US3] Add contract tests proving browser-controlled corporation/action inputs are ignored and responses contain no secrets in apps/web/tests/contract/numbers-api.test.ts
- [x] T021 [P] [US3] Add browser boundary smoke checks for read-only Numbers recommendations in apps/web/e2e/command-boundaries.spec.ts

### Implementation for User Story 3

- [x] T022 [US3] Render Numbers follow-up candidates with player-impacting markers and planning-only copy in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T023 [US3] Add safe error handling for invalid Numbers API requests in netlify/functions/numbers.ts

**Checkpoint**: All user stories are independently functional and the read-only boundary is tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quickstart validation, and full quality gate.

- [x] T024 [P] Update README data-source notes for `numbers_snapshots` and read-only Numbers behavior in README.md
- [x] T025 [P] Update roadmap with M8 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T026 [P] Update M8 quickstart validation notes in specs/008-numbers-layer/quickstart.md
- [x] T027 Run npm run lint and record result in specs/008-numbers-layer/quickstart.md
- [x] T028 Run npm run typecheck and record result in specs/008-numbers-layer/quickstart.md
- [x] T029 Run npm test and record result in specs/008-numbers-layer/quickstart.md
- [x] T030 Run npm run test:e2e and record result in specs/008-numbers-layer/quickstart.md
- [x] T031 Run npm run build and record result in specs/008-numbers-layer/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 normalization and UI.
- **User Story 3 (Phase 5)**: Depends on US1 surface and API.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers the MVP Numbers surface.
- **User Story 2 (P2)**: Starts after US1; adds explicit missing/stale behavior.
- **User Story 3 (P3)**: Starts after US1; adds planning-only follow-up recommendations and boundary tests.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T006, and T007 can be prepared in parallel after contracts exist.
- T011 and T012 can run in parallel after response contracts exist.
- T016 and T017 can run in parallel for US2 coverage.
- T020 and T021 can run in parallel for US3 boundary coverage.

---

## Parallel Example: User Story 1

```bash
Task: "Add API contract tests for scoped GET /api/numbers snapshot responses in apps/web/tests/contract/numbers-api.test.ts"
Task: "Add browser smoke test for full Numbers snapshot rendering in apps/web/e2e/numbers-layer.spec.ts"
Task: "Add Numbers API client in apps/web/src/features/numbers/services/numbersClient.ts"
Task: "Add Numbers state hook in apps/web/src/features/numbers/state/useNumbersSnapshot.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 shared contracts.
2. Complete Phase 2 normalization and store foundation.
3. Complete Phase 3 Numbers API and UI snapshot display.
4. Validate US1 through contract/unit/browser tests before adding follow-up behavior.

### Incremental Delivery

1. Add Numbers contracts and normalizer/store primitives.
2. Add GET /api/numbers and browser surface.
3. Add missing/stale data display.
4. Add display-only follow-up candidates and read-only boundary tests.
5. Run the complete validation gate from quickstart.md.

### Notes

- [P] tasks target different files and can be done in parallel.
- M8 reads processed data only and must not call EVE APIs, dispatch workers, retry work, or mutate external services.
- Browser input must not control corporation scope, wallet/asset actions, dispatch targets, execution flags, or metric overrides.
