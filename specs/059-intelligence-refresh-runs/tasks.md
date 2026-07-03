# Tasks: Intelligence Refresh Runs

**Input**: Design documents from `specs/059-intelligence-refresh-runs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/intelligence-refresh-runs.md, quickstart.md

**Tests**: Required. This feature adds orchestration state, worker transitions, Brain evaluation linkage, and browser-visible command status.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared contracts and test fixtures used by every user story.

- [X] T001 Create refresh run TypeScript contracts in `packages/contracts/src/intelligence-refresh.ts`
- [X] T002 Create refresh run Zod schemas in `packages/contracts/src/intelligence-refresh.schema.ts`
- [X] T003 Export refresh contracts and schemas from `packages/contracts/src/index.ts`
- [X] T004 [P] Add refresh fixture builders in `apps/web/tests/fixtures/intelligenceRefresh.ts`
- [X] T005 [P] Add shared unsafe-material test cases in `apps/web/tests/fixtures/unsafeMaterial.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared store and rules before any user story touches APIs or UI.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Add refresh status/domain/rule helpers in `netlify/functions/_shared/intelligence-refresh-rules.ts`
- [X] T007 Add MongoDB store for refresh runs in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [X] T008 Add unsafe material rejection for worker result summaries in `netlify/functions/_shared/intelligence-refresh-rules.ts`
- [X] T009 [P] Add unit tests for refresh rules in `apps/web/tests/unit/intelligence-refresh-rules.test.ts`
- [X] T010 [P] Add unit tests for refresh store transitions in `apps/web/tests/unit/intelligence-refresh-store.test.ts`

**Checkpoint**: Refresh runs can be normalized, created, deduplicated, transitioned, and sanitized through shared helpers.

---

## Phase 3: User Story 1 - Start An Auditable Refresh Run (Priority: P1) MVP

**Goal**: A signed-in commander can create and inspect a durable refresh run without executing long-running work in the request path.

**Independent Test**: Create a signed-session refresh run through the API and verify queued/prepared domain steps plus browser-safe response metadata.

### Tests for User Story 1

- [X] T011 [P] [US1] Add contract tests for commander refresh create/list/detail in `apps/web/tests/contract/intelligence-refresh-api.test.ts`
- [X] T012 [P] [US1] Add duplicate prevention tests in `apps/web/tests/unit/intelligence-refresh-store.test.ts`

### Implementation for User Story 1

- [X] T013 [US1] Implement `GET` and `POST /api/intelligence-refresh` in `netlify/functions/intelligence-refresh.ts`
- [X] T014 [US1] Implement `GET /api/intelligence-refresh/:id` handling in `netlify/functions/intelligence-refresh.ts`
- [X] T015 [US1] Link eligible Numbers ESI sync preparation through existing ESI sync store helpers in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [X] T016 [US1] Link or mark unsupported People and Opportunity domain preparation safely in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [X] T017 [US1] Add safe commander identity and signed-session scope handling in `netlify/functions/intelligence-refresh.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Coordinate Worker-Owned Data Collection (Priority: P2)

**Goal**: Trusted workers can claim, complete, fail, or skip refresh domain steps while preserving browser-safe summaries.

**Independent Test**: Claim and complete/fail refresh steps with worker-authenticated requests and verify aggregate run status updates.

### Tests for User Story 2

- [X] T018 [P] [US2] Add worker contract tests in `apps/web/tests/contract/intelligence-refresh-worker-api.test.ts`
- [X] T019 [P] [US2] Add worker transition unit tests in `apps/web/tests/unit/intelligence-refresh-store.test.ts`

### Implementation for User Story 2

- [X] T020 [US2] Implement worker list endpoint in `netlify/functions/intelligence-refresh-worker.ts`
- [X] T021 [US2] Implement worker step claim endpoint in `netlify/functions/intelligence-refresh-worker.ts`
- [X] T022 [US2] Implement worker step complete endpoint in `netlify/functions/intelligence-refresh-worker.ts`
- [X] T023 [US2] Implement worker step fail endpoint in `netlify/functions/intelligence-refresh-worker.ts`
- [X] T024 [US2] Update aggregate refresh run status after step transitions in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [X] T025 [US2] Reject unsafe worker result material in `netlify/functions/intelligence-refresh-worker.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Trigger Brain Evaluation From Refresh State (Priority: P3)

**Goal**: Trusted evaluation workers can attach Brain evaluation and resulting command brief provenance to a completed or partial refresh run.

**Independent Test**: Complete or partially complete a run, evaluate it through the worker endpoint, and verify Brain run and command brief linkage.

### Tests for User Story 3

- [X] T026 [P] [US3] Add evaluation readiness tests in `apps/web/tests/unit/intelligence-refresh-rules.test.ts`
- [X] T027 [P] [US3] Add Brain evaluation worker contract tests in `apps/web/tests/contract/intelligence-refresh-worker-api.test.ts`

### Implementation for User Story 3

- [X] T028 [US3] Add refresh-aware Brain request linkage in `packages/contracts/src/brain.ts`
- [X] T029 [US3] Add refresh-aware Brain request schema fields in `packages/contracts/src/brain.schema.ts`
- [X] T030 [US3] Add refresh provenance fields to command brief contracts in `packages/contracts/src/command-brief.ts`
- [X] T031 [US3] Add refresh provenance schema fields in `packages/contracts/src/command-brief.schema.ts`
- [X] T032 [US3] Update Brain store to persist refresh run linkage in `netlify/functions/_shared/brain-store.ts`
- [X] T033 [US3] Implement refresh evaluation endpoint in `netlify/functions/intelligence-refresh-worker.ts`
- [X] T034 [US3] Update generated command brief provenance with refresh run id and domain step summaries in `netlify/functions/_shared/brain-output.ts`
- [X] T035 [US3] Record safe evaluation failure state in `netlify/functions/_shared/intelligence-refresh-store.ts`

**Checkpoint**: User Stories 1, 2, and 3 are functional with Brain evaluation linkage.

---

## Phase 6: User Story 4 - Inspect Refresh Status And Results (Priority: P4)

**Goal**: Commanders can see recent refresh runs, status, domain steps, failures, and final evaluation linkage in the command center.

**Independent Test**: Browser smoke fixtures render queued, running, partial, failed, and completed refresh runs without exposing unsafe material.

### Tests for User Story 4

- [X] T036 [P] [US4] Add UI state tests for refresh view models in `apps/web/tests/unit/intelligence-refresh-surface.test.ts`
- [X] T037 [P] [US4] Add browser smoke coverage in `apps/web/e2e/intelligence-refresh.spec.ts`

### Implementation for User Story 4

- [X] T038 [US4] Add refresh API client in `apps/web/src/features/intelligence-refresh/services/intelligenceRefreshClient.ts`
- [X] T039 [US4] Add refresh React state hook in `apps/web/src/features/intelligence-refresh/state/useIntelligenceRefresh.ts`
- [X] T040 [US4] Add refresh panel component in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`
- [X] T041 [US4] Add refresh route wrapper in `apps/web/src/routes/IntelligenceRefreshRoute.tsx`
- [X] T042 [US4] Mount refresh surface in `apps/web/src/App.tsx`
- [X] T043 [US4] Add refresh styles in `apps/web/src/styles/app.css`

**Checkpoint**: All user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap sync, and full validation.

- [X] T044 [P] Update application usage notes in `README.md`
- [X] T045 [P] Update production operation notes in `docs/production-operations.md`
- [X] T046 [P] Update M59 completion details in `docs/roadmap.md`
- [X] T047 Run focused validation from `specs/059-intelligence-refresh-runs/quickstart.md`
- [X] T048 Run full quality gate: `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, `npm run build`, `git diff --check`
- [X] T049 Mark completed tasks in `specs/059-intelligence-refresh-runs/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup completion and blocks all user stories.
- **User Story 1 (P1)**: Depends on foundational store/rules.
- **User Story 2 (P2)**: Depends on User Story 1 run creation.
- **User Story 3 (P3)**: Depends on User Story 2 terminal/partial step status.
- **User Story 4 (P4)**: Depends on User Story 1 API shape and benefits from User Stories 2-3 states.
- **Polish**: Depends on selected user stories being complete.

### Parallel Opportunities

- T004 and T005 can run in parallel.
- T009 and T010 can run in parallel.
- T011 and T012 can run in parallel.
- T018 and T019 can run in parallel.
- T026 and T027 can run in parallel.
- T036 and T037 can run in parallel.
- T044, T045, and T046 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete setup and foundational refresh contracts/store/rules.
2. Complete US1 so commanders can create and inspect durable refresh runs safely.
3. Validate duplicate prevention and unsafe browser-field rejection.

### Incremental Delivery

1. Add worker-owned step transitions.
2. Add Brain evaluation linkage.
3. Add command-center refresh panel.
4. Update docs and run the full quality gate.
