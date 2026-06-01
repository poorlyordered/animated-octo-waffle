# Tasks: Worker Handoff For Automation Queue

**Input**: Design documents from `/specs/007-worker-handoff/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/worker-handoff-api.md, quickstart.md

**Tests**: Required by FR-012 and success criteria SC-001 through SC-006.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared contracts and server module locations for worker handoff.

- [x] T001 [P] Add worker handoff contract types in packages/contracts/src/worker-handoff.ts
- [x] T002 [P] Add Zod schemas for handoff records, statuses, requests, and responses in packages/contracts/src/worker-handoff.schema.ts
- [x] T003 Export worker handoff contracts and schemas from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core normalization, eligibility, and store primitives required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Add worker handoff document normalization in netlify/functions/_shared/worker-handoff-normalizer.ts
- [x] T005 [P] Add queue eligibility and duplicate-active-handoff rules in netlify/functions/_shared/worker-handoff-rules.ts
- [x] T006 Add MongoDB worker handoff store for create, find, list, and active-handoff lookup in netlify/functions/_shared/worker-handoff-store.ts
- [x] T007 [P] Add unit tests for handoff normalization and safe payload derivation in apps/web/tests/unit/worker-handoff-normalizer.test.ts
- [x] T008 [P] Add unit tests for eligibility, approval boundary, duplicate active state, and non-execution rules in apps/web/tests/unit/worker-handoff-rules.test.ts

**Checkpoint**: Shared handoff rules are testable without browser or live workers.

---

## Phase 3: User Story 1 - Prepare Approved Queue Item For Worker Handoff (Priority: P1) MVP

**Goal**: Create an auditable worker-ready handoff record for an eligible queued automation item.

**Independent Test**: Seed an approved non-player-impacting queue item, request handoff preparation, and verify a ready handoff record is created without external dispatch.

### Tests for User Story 1

- [x] T009 [P] [US1] Add contract tests for POST /api/automation-queue/:queueItemId/handoff in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T010 [P] [US1] Add store/rules tests for handoff creation and idempotent active handoff lookup in apps/web/tests/unit/worker-handoff-rules.test.ts

### Implementation for User Story 1

- [x] T011 [US1] Implement POST /api/automation-queue/:queueItemId/handoff route handling in netlify/functions/automation-queue.ts
- [x] T012 [US1] Wire handoff preparation through worker-handoff-store in netlify/functions/_shared/worker-handoff-store.ts
- [x] T013 [US1] Ensure browser-provided corporation scope, status, worker owner, execution flags, and dispatch targets are ignored in netlify/functions/automation-queue.ts

**Checkpoint**: User Story 1 is independently functional and validates the MVP handoff path.

---

## Phase 4: User Story 2 - Inspect Worker Handoff Readiness And Failures (Priority: P2)

**Goal**: Let commanders inspect scoped handoff records and queue-linked readiness/failure summaries.

**Independent Test**: Seed handoff records across statuses and verify queue detail plus handoff API reads return scoped safe metadata.

### Tests for User Story 2

- [x] T014 [P] [US2] Add contract tests for GET /api/worker-handoffs and GET /api/worker-handoffs/:handoffId in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T015 [P] [US2] Add browser smoke tests for handoff-ready and handoff-blocked queue states in apps/web/e2e/worker-handoff.spec.ts

### Implementation for User Story 2

- [x] T016 [US2] Implement scoped worker handoff list/detail handler in netlify/functions/worker-handoffs.ts
- [x] T017 [US2] Extend automation queue detail response with latest handoff summary in netlify/functions/automation-queue.ts
- [x] T018 [P] [US2] Add worker handoff client functions in apps/web/src/features/automation-queue/services/workerHandoffClient.ts
- [x] T019 [US2] Extend automation queue state with handoff preparation and queue detail refresh in apps/web/src/features/automation-queue/state/useAutomationQueue.ts
- [x] T020 [US2] Render handoff readiness, failure, and prepare-handoff controls in apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx
- [x] T021 [US2] Update browser API fixtures with handoff summaries and preparation responses in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Stories 1 and 2 work independently and browser-visible handoff states are covered.

---

## Phase 5: User Story 3 - Keep Netlify Requests Short And Non-Executing (Priority: P3)

**Goal**: Prove handoff preparation creates durable records only and never dispatches or executes work in request handlers.

**Independent Test**: Trigger handoff preparation with execution-like browser input and verify the request ignores execution flags, stores only safe metadata, and returns non-execution language.

### Tests for User Story 3

- [x] T022 [P] [US3] Add contract tests proving handoff responses contain no secrets, tokens, credentials, cookie signatures, or dispatch targets in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T023 [P] [US3] Add browser boundary smoke checks for no execution, no retry, and no EVE action language in apps/web/e2e/command-boundaries.spec.ts

### Implementation for User Story 3

- [x] T024 [US3] Add explicit safe error handling for ineligible handoff and approval-boundary failures in netlify/functions/automation-queue.ts
- [x] T025 [US3] Add no-dispatch copy and disabled execution semantics to handoff UI in apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx

**Checkpoint**: All user stories are independently functional and the request/response boundary is tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quickstart validation, and full quality gate.

- [x] T026 [P] Update worker handoff environment and data-source notes in README.md
- [x] T027 [P] Update roadmap with M7 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T028 [P] Update M7 quickstart validation notes in specs/007-worker-handoff/quickstart.md
- [x] T029 Run npm run lint and record result in specs/007-worker-handoff/quickstart.md
- [x] T030 Run npm run typecheck and record result in specs/007-worker-handoff/quickstart.md
- [x] T031 Run npm test and record result in specs/007-worker-handoff/quickstart.md
- [x] T032 Run npm run test:e2e and record result in specs/007-worker-handoff/quickstart.md
- [x] T033 Run npm run build and record result in specs/007-worker-handoff/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 contracts and store behavior.
- **User Story 3 (Phase 5)**: Depends on handoff preparation and UI states.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers the MVP handoff preparation path.
- **User Story 2 (P2)**: Starts after US1; adds inspectability and browser-visible state.
- **User Story 3 (P3)**: Starts after US1; hardens the non-execution boundary.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T005, T007, and T008 can be prepared in parallel after contracts exist.
- T009 and T010 can run in parallel for US1 coverage.
- T014 and T015 can run in parallel for US2 coverage.
- T018 can run in parallel with T016 after response contracts exist.
- T022 and T023 can run in parallel for US3 boundary coverage.

---

## Parallel Example: User Story 1

```bash
Task: "Add contract tests for POST /api/automation-queue/:queueItemId/handoff in apps/web/tests/contract/worker-handoff-api.test.ts"
Task: "Add store tests for handoff creation and idempotent active handoff lookup in apps/web/tests/unit/worker-handoff-store.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add contract tests for GET /api/worker-handoffs and GET /api/worker-handoffs/:handoffId in apps/web/tests/contract/worker-handoff-api.test.ts"
Task: "Add browser smoke tests for handoff-ready and handoff-blocked queue states in apps/web/e2e/worker-handoff.spec.ts"
Task: "Add worker handoff client functions in apps/web/src/features/automation-queue/services/workerHandoffClient.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 shared contracts.
2. Complete Phase 2 normalization, rules, and store foundation.
3. Complete Phase 3 handoff preparation endpoint.
4. Validate US1 through contract/unit tests before adding UI.

### Incremental Delivery

1. Add worker handoff contracts and server primitives.
2. Add POST handoff preparation and idempotency.
3. Add scoped read endpoints and queue detail handoff summaries.
4. Add browser-visible handoff states and controls.
5. Add boundary hardening and full validation.

### Notes

- [P] tasks target different files and can be done in parallel.
- Handoff is not execution. M7 must not dispatch workers, retry work, perform EVE actions, or mutate external services.
- Browser input must not control corporation scope, status, worker owner, execution flags, or dispatch targets.
