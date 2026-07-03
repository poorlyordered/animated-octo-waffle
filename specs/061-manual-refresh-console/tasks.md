# Tasks: Manual Refresh Console

**Input**: Design documents from `specs/061-manual-refresh-console/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/manual-refresh-console.md, quickstart.md

**Tests**: Tests are required by FR-016 and SC-006. Contract/unit tests should be written before implementation tasks for each story where practical.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align active feature docs and route shared feature scaffolding.

- [x] T001 Update active M61 pointers in `.specify/feature.json`, `AGENTS.md`, and `docs/roadmap.md`
- [x] T002 [P] Verify existing refresh source files and test locations in `packages/contracts/src/intelligence-refresh.ts`, `netlify/functions/intelligence-refresh.ts`, and `apps/web/src/features/intelligence-refresh/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, schemas, and store helpers needed by all user stories.

- [x] T003 [P] Add refresh mode, readiness, timeline, event, retry response, and skip response types in `packages/contracts/src/intelligence-refresh.ts`
- [x] T004 [P] Add Zod schemas for refresh mode, readiness, timeline, event, retry response, and skip response in `packages/contracts/src/intelligence-refresh.schema.ts`
- [x] T005 [P] Add contract tests for new refresh schemas in `apps/web/tests/contract/intelligence-refresh-api.test.ts`
- [x] T006 Add safe readiness derivation and event helper design to `netlify/functions/_shared/intelligence-refresh-rules.ts`
- [x] T007 Extend refresh store summary/detail support, mode persistence, active-run dedupe key, timeline derivation, and event persistence in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [x] T008 Update browser refresh client parsing methods in `apps/web/src/features/intelligence-refresh/services/intelligenceRefreshClient.ts`

**Checkpoint**: Foundation ready - contracts parse, store helpers compile, and user story implementation can begin.

---

## Phase 3: User Story 1 - Prepare A Refresh With Readiness Feedback (Priority: P1) MVP

**Goal**: Authorized commanders can inspect readiness, choose mode/domains, and create durable refresh runs with clear no-execution feedback.

**Independent Test**: Render the Refresh Console with deterministic readiness fixtures, create a run with selected mode/domains, and verify safe boundary text plus duplicate behavior.

### Tests for User Story 1

- [x] T009 [P] [US1] Add readiness and create-run contract tests in `apps/web/tests/contract/intelligence-refresh-api.test.ts`
- [x] T010 [P] [US1] Add readiness view-model unit tests in `apps/web/tests/unit/intelligence-refresh-surface.test.ts`
- [x] T011 [P] [US1] Add browser smoke coverage for readiness and mode/domain run creation in `apps/web/e2e/intelligence-refresh.spec.ts`

### Implementation for User Story 1

- [x] T012 [US1] Implement `GET /api/intelligence-refresh/readiness` in `netlify/functions/intelligence-refresh.ts`
- [x] T013 [US1] Extend `POST /api/intelligence-refresh` to accept refresh mode in `netlify/functions/intelligence-refresh.ts`
- [x] T014 [US1] Load readiness and create mode-aware runs in `apps/web/src/features/intelligence-refresh/state/useIntelligenceRefresh.ts`
- [x] T015 [US1] Replace basic run controls with readiness checklist, mode selector, and domain selector in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`
- [x] T016 [US1] Add refresh console styling for checklist, mode/domain controls, and safe status feedback in `apps/web/src/styles/app.css`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Inspect Run Timeline And Events (Priority: P2)

**Goal**: Commanders can inspect run detail with specific timeline labels, event history, worker ownership, failures, blockers, and linked outputs.

**Independent Test**: Load a fixture run with mixed step states and verify timeline labels/events render without generic processing text.

### Tests for User Story 2

- [x] T017 [P] [US2] Add timeline/event contract tests in `apps/web/tests/contract/intelligence-refresh-api.test.ts`
- [x] T018 [P] [US2] Add timeline label unit tests in `apps/web/tests/unit/intelligence-refresh-surface.test.ts`
- [x] T019 [P] [US2] Add browser smoke coverage for run detail timeline and event log in `apps/web/e2e/intelligence-refresh.spec.ts`

### Implementation for User Story 2

- [x] T020 [US2] Return run detail responses with timeline and events from `GET /api/intelligence-refresh/:runId` in `netlify/functions/intelligence-refresh.ts`
- [x] T021 [US2] Record run creation and step-derived events in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [x] T022 [US2] Add selected run loading and detail refresh behavior in `apps/web/src/features/intelligence-refresh/state/useIntelligenceRefresh.ts`
- [x] T023 [US2] Add run detail timeline and event log UI in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`
- [x] T024 [US2] Add timeline/event display helpers in `apps/web/src/features/intelligence-refresh/services/intelligenceRefreshSurface.ts`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Retry Or Skip Failed Work Safely (Priority: P3)

**Goal**: Commanders can record retry or skip intent for eligible failed/blocked steps without executing external work from the browser.

**Independent Test**: Use a failed-step fixture to record retry intent and verify a durable event plus no-execution boundary are returned.

### Tests for User Story 3

- [x] T025 [P] [US3] Add retry/skip contract tests in `apps/web/tests/contract/intelligence-refresh-api.test.ts`
- [x] T026 [P] [US3] Add retry/skip eligibility unit tests in `apps/web/tests/unit/intelligence-refresh-surface.test.ts`
- [x] T027 [P] [US3] Add browser smoke coverage for failed-step retry intent in `apps/web/e2e/intelligence-refresh.spec.ts`

### Implementation for User Story 3

- [x] T028 [US3] Implement retry intent store helper in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [x] T029 [US3] Implement skip intent store helper in `netlify/functions/_shared/intelligence-refresh-store.ts`
- [x] T030 [US3] Add retry and skip endpoints in `netlify/functions/intelligence-refresh.ts`
- [x] T031 [US3] Add retry and skip client methods in `apps/web/src/features/intelligence-refresh/services/intelligenceRefreshClient.ts`
- [x] T032 [US3] Add retry and skip controls to run detail in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`

**Checkpoint**: User Stories 1-3 cover manual preparation, inspection, and safe recovery intent.

---

## Phase 6: User Story 4 - Explain Board Processing States (Priority: P4)

**Goal**: Command board surfaces show actionable processing/stale/failed/blocked labels and link to relevant refresh run detail.

**Independent Test**: Render board fixtures for active, stale, failed, and blocked refresh-derived states and verify labels plus links.

### Tests for User Story 4

- [x] T033 [P] [US4] Add board status explanation unit tests in `apps/web/tests/unit/intelligence-refresh-surface.test.ts`
- [x] T034 [P] [US4] Add board label/link browser smoke coverage in `apps/web/e2e/command-surfaces.spec.ts`

### Implementation for User Story 4

- [x] T035 [US4] Add board status explanation helpers in `apps/web/src/features/intelligence-refresh/services/intelligenceRefreshSurface.ts`
- [x] T036 [US4] Update Refresh panel and board-facing status copy in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`
- [x] T037 [US4] Add status link target behavior for selected runs in `apps/web/src/features/intelligence-refresh/components/IntelligenceRefreshPanel.tsx`

**Checkpoint**: All user stories are independently functional and integrated into the board summary model.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate, docs, and final validation.

- [x] T038 [P] Update `specs/061-manual-refresh-console/quickstart.md` if implementation details or validation commands changed
- [x] T039 [P] Update `docs/roadmap.md` with delivered M61 capabilities and validation evidence
- [x] T040 Run targeted refresh tests with `npm test -- intelligence-refresh`
- [x] T041 Run full validation with `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, and `git diff --check`
- [x] T042 Run the code-review-and-quality gate across the completed diff and resolve required findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all stories.
- **US1 (Phase 3)**: Depends on Foundational and is the MVP.
- **US2 (Phase 4)**: Depends on Foundational; integrates best after US1 creates mode-aware runs.
- **US3 (Phase 5)**: Depends on timeline/event foundations from US2.
- **US4 (Phase 6)**: Depends on refresh status explanations from US2 and US3.
- **Polish (Phase 7)**: Depends on all selected stories.

### Parallel Opportunities

- T003-T005 can run in parallel after setup.
- T009-T011 can run in parallel before US1 implementation.
- T017-T019 can run in parallel before US2 implementation.
- T025-T027 can run in parallel before US3 implementation.
- T033-T034 can run in parallel before US4 implementation.
- T038-T039 can run in parallel during final documentation cleanup.

## Implementation Strategy

### MVP First

1. Complete T001-T008.
2. Complete US1 tasks T009-T016.
3. Validate readiness and mode-aware run creation independently.

### Incremental Delivery

1. Add timeline/events through US2.
2. Add retry/skip intent through US3.
3. Add board explanation links through US4.
4. Complete quality gate and code-review-and-quality review.

## Notes

- Preserve browser no-execution boundaries in every UI string and response contract.
- Keep response arrays bounded for list/detail/event endpoints.
- Do not expose raw ESI payloads, token material, worker secrets, raw provider payloads, or mutation fields.
- Mark tasks complete in this file as implementation progresses.
