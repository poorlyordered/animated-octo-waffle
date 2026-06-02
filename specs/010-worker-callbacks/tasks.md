# Tasks: Worker Handoff Callbacks

**Input**: Design documents from `/specs/010-worker-callbacks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/worker-callback-api.md, quickstart.md

**Tests**: Required by FR-001 through FR-012 and success criteria SC-001 through SC-005.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend worker handoff contracts and callback authorization boundary.

- [x] T001 [P] Extend worker handoff contract types with claimedBy, progress, and result fields in packages/contracts/src/worker-handoff.ts
- [x] T002 [P] Extend worker handoff schemas and callback request schemas in packages/contracts/src/worker-handoff.schema.ts
- [x] T003 Add worker callback secret validation helper in netlify/functions/_shared/worker-callback-auth.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Normalize callback metadata and implement safe state transitions.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Add contract tests for worker callback request/response schemas in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T005 [P] Add unit tests for worker callback authorization in apps/web/tests/unit/worker-callback-auth.test.ts
- [x] T006 [P] Add unit tests for claim/progress/complete/fail state transition rules in apps/web/tests/unit/worker-handoff-store.test.ts
- [x] T007 Extend worker handoff normalization for claimedBy, progress, and result in netlify/functions/_shared/worker-handoff-normalizer.ts
- [x] T008 Add MongoDB store methods for claim, progress, complete, and fail transitions in netlify/functions/_shared/worker-handoff-store.ts

**Checkpoint**: Callback contracts, auth, and state transitions are testable without browser workers.

---

## Phase 3: User Story 1 - Worker Claims Prepared Handoff (Priority: P1) MVP

**Goal**: Let a trusted worker list ready handoffs and atomically claim one.

**Independent Test**: Seed ready handoffs, call the claim endpoint, and verify only a ready in-scope handoff changes to claimed.

### Tests for User Story 1

- [x] T009 [P] [US1] Add route tests for authorized ready polling and claim success in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T010 [P] [US1] Add route tests for duplicate claim and out-of-scope/not-ready claim rejection in apps/web/tests/contract/worker-handoff-api.test.ts

### Implementation for User Story 1

- [x] T011 [US1] Add worker authorization to worker-facing GET ready list in netlify/functions/worker-handoffs.ts
- [x] T012 [US1] Add POST /api/worker-handoffs/:handoffId/claim route handling in netlify/functions/worker-handoffs.ts

**Checkpoint**: User Story 1 is independently functional and prevents duplicate claims.

---

## Phase 4: User Story 2 - Worker Reports Progress And Completion (Priority: P2)

**Goal**: Let the claiming worker record safe progress and completion summaries.

**Independent Test**: Claim a handoff, append progress, complete it, and verify safe metadata is visible through existing handoff reads.

### Tests for User Story 2

- [x] T013 [P] [US2] Add route tests for authorized progress callbacks in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T014 [P] [US2] Add route tests for authorized completion callbacks and non-claiming worker rejection in apps/web/tests/contract/worker-handoff-api.test.ts

### Implementation for User Story 2

- [x] T015 [US2] Add POST /api/worker-handoffs/:handoffId/progress route handling in netlify/functions/worker-handoffs.ts
- [x] T016 [US2] Add POST /api/worker-handoffs/:handoffId/complete route handling in netlify/functions/worker-handoffs.ts

**Checkpoint**: User Stories 1 and 2 expose safe claimed/progress/completed metadata.

---

## Phase 5: User Story 3 - Worker Reports Failure Safely (Priority: P3)

**Goal**: Let the claiming worker mark a handoff failed with safe failure metadata.

**Independent Test**: Claim a handoff, fail it, and verify browser-safe summaries show failure without raw secrets.

### Tests for User Story 3

- [x] T017 [P] [US3] Add route tests for authorized failure callbacks in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T018 [P] [US3] Add tests proving callback responses exclude secrets, tokens, credentials, dispatch targets, and raw payload fields in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T019 [P] [US3] Add browser smoke coverage for claimed/completed/failed handoff states in apps/web/e2e/worker-handoff.spec.ts

### Implementation for User Story 3

- [x] T020 [US3] Add POST /api/worker-handoffs/:handoffId/fail route handling in netlify/functions/worker-handoffs.ts
- [x] T021 [US3] Render claimedBy, progress, result, and failure metadata in apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx
- [x] T022 [US3] Update browser fixtures for claimed, completed, and failed worker callback states in apps/web/e2e/fixtures/command-surfaces.ts and apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: Worker failures are inspectable and browser-safe.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap update, and full quality gate.

- [x] T023 [P] Update README worker callback environment and boundary notes in README.md
- [x] T024 [P] Update roadmap with M10 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T025 Run npm run lint and record result in specs/010-worker-callbacks/quickstart.md
- [x] T026 Run npm run typecheck and record result in specs/010-worker-callbacks/quickstart.md
- [x] T027 Run npm test and record result in specs/010-worker-callbacks/quickstart.md
- [x] T028 Run npm run test:e2e and record result in specs/010-worker-callbacks/quickstart.md
- [x] T029 Run npm run build and record result in specs/010-worker-callbacks/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 claimed state.
- **User Story 3 (Phase 5)**: Depends on US1 claimed state.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers the MVP worker claim path.
- **User Story 2 (P2)**: Starts after US1; adds progress and completion visibility.
- **User Story 3 (P3)**: Starts after US1; adds failure visibility and browser state coverage.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T005, and T006 can be prepared in parallel after contract direction is clear.
- T009 and T010 can run in parallel for claim route coverage.
- T013 and T014 can run in parallel for progress/completion route coverage.
- T017, T018, and T019 can run in parallel for failure and browser-safety coverage.
- T023 and T024 can run in parallel after behavior is stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add route tests for authorized ready polling and claim success in apps/web/tests/contract/worker-handoff-api.test.ts"
Task: "Add route tests for duplicate claim and out-of-scope/not-ready claim rejection in apps/web/tests/contract/worker-handoff-api.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Extend contracts and schemas.
2. Add callback auth and store transition tests.
3. Implement atomic claim.
4. Wire worker-facing polling and claim routes.
5. Validate duplicate claim prevention before adding progress/completion/failure.

### Incremental Delivery

1. Add claim path and authorization.
2. Add progress and completion callbacks.
3. Add failure callback and browser visibility.
4. Update docs and run the complete validation gate from quickstart.md.

### Notes

- M10 records worker status and safe summaries only.
- Request handlers must not dispatch workers, retry work, call EVE APIs, mutate external services, or execute player-impacting actions.
- Worker callback secrets must never appear in browser-visible responses.
