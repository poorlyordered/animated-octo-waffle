# Tasks: Numbers Follow-Up Actions

**Input**: Design documents from `/specs/011-numbers-followup-actions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/numbers-followup-actions-api.md, quickstart.md

**Tests**: Required by FR-001 through FR-015 and success criteria SC-001 through SC-007.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend contracts and shared fixture support for Numbers follow-up origins.

- [x] T001 [P] Add Numbers follow-up action response/request contract types in packages/contracts/src/numbers.ts
- [x] T002 [P] Add Numbers follow-up action schemas in packages/contracts/src/numbers.schema.ts
- [x] T003 Export updated Numbers follow-up contracts and schemas from packages/contracts/src/index.ts
- [x] T004 [P] Add Numbers follow-up action fixtures in apps/web/tests/fixtures/numbersFollowUpActions.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add server-side candidate lookup, origin mapping, duplicate detection, and boundary helpers.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Add unit tests for Numbers follow-up candidate lookup and provenance mapping in apps/web/tests/unit/numbers-followup-actions.test.ts
- [x] T006 [P] Add unit tests for unsafe field rejection and scoped candidate boundaries in apps/web/tests/unit/numbers-followup-actions.test.ts
- [x] T007 Add Numbers follow-up origin and candidate lookup helpers in netlify/functions/_shared/numbers-store.ts
- [x] T008 Add decision duplicate lookup by Numbers follow-up origin in netlify/functions/_shared/decision-record-store.ts
- [x] T009 Add queue duplicate lookup by source decision and task intent in netlify/functions/_shared/automation-queue-store.ts
- [x] T010 Add shared unsafe field detection for Numbers follow-up action requests in netlify/functions/_shared/numbers-followup-actions.ts

**Checkpoint**: Candidate lookup, provenance mapping, duplicate checks, and request boundaries are testable without browser workflows.

---

## Phase 3: User Story 1 - Record A Decision From A Numbers Follow-Up (Priority: P1) MVP

**Goal**: Let the commander create a proposed decision record from an eligible Numbers follow-up candidate.

**Independent Test**: Seed a Numbers snapshot with a decision-path follow-up, create a decision from it, and verify proposed status, provenance, origin link, duplicate handling, and no-execution response language.

### Tests for User Story 1

- [x] T011 [P] [US1] Add contract tests for POST /api/numbers/follow-ups/:candidateId/decision success and duplicate behavior in apps/web/tests/contract/numbers-api.test.ts
- [x] T012 [P] [US1] Add contract tests for missing candidate, out-of-scope snapshot, unsafe fields, and secret-free responses in apps/web/tests/contract/numbers-api.test.ts
- [x] T013 [P] [US1] Add browser smoke test for creating a decision from a Numbers follow-up in apps/web/e2e/numbers-followup-actions.spec.ts

### Implementation for User Story 1

- [x] T014 [US1] Add POST /api/numbers/follow-ups/:candidateId/decision route handling in netlify/functions/numbers.ts
- [x] T015 [US1] Add decision creation mapping from Numbers follow-up candidate to netlify/functions/_shared/decision-record-normalizer.ts
- [x] T016 [US1] Add Numbers follow-up decision create client in apps/web/src/features/numbers/services/numbersClient.ts
- [x] T017 [US1] Extend Numbers state hook with create-decision action in apps/web/src/features/numbers/state/useNumbersSnapshot.ts
- [x] T018 [US1] Add decision creation controls and duplicate/existing-decision status to apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T019 [US1] Add browser API fixtures for decision creation from Numbers follow-ups in apps/web/e2e/fixtures/api-fixtures.ts and apps/web/e2e/fixtures/command-surfaces.ts

**Checkpoint**: User Story 1 is independently functional and creates proposed decisions only.

---

## Phase 4: User Story 2 - Queue Approved Numbers Follow-Up Work (Priority: P2)

**Goal**: Let the commander create queued work from an approved Numbers follow-up decision without dispatching a worker.

**Independent Test**: Start from an approved Numbers follow-up decision, create queued work, and verify source decision linkage, queued status, attempts zero, duplicate behavior, and no-dispatch language.

### Tests for User Story 2

- [x] T020 [P] [US2] Add contract tests for POST /api/numbers/follow-ups/:candidateId/queue success and duplicate behavior in apps/web/tests/contract/numbers-api.test.ts
- [ ] T021 [P] [US2] Add contract tests for proposed/rejected/unapproved player-impacting decision queue rejection in apps/web/tests/contract/numbers-api.test.ts
- [ ] T022 [P] [US2] Add browser smoke test for creating queued work from an approved Numbers follow-up decision in apps/web/e2e/numbers-followup-actions.spec.ts

### Implementation for User Story 2

- [x] T023 [US2] Add POST /api/numbers/follow-ups/:candidateId/queue route handling in netlify/functions/numbers.ts
- [x] T024 [US2] Reuse automation queue eligibility rules for Numbers follow-up queue creation in netlify/functions/_shared/automation-queue-rules.ts
- [x] T025 [US2] Add Numbers follow-up queue create client in apps/web/src/features/numbers/services/numbersClient.ts
- [x] T026 [US2] Extend Numbers state hook with create-queue action in apps/web/src/features/numbers/state/useNumbersSnapshot.ts
- [x] T027 [US2] Add queue creation controls for approved follow-up decisions in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T028 [US2] Add browser API fixtures for queue creation from Numbers follow-ups in apps/web/e2e/fixtures/api-fixtures.ts and apps/web/e2e/fixtures/command-surfaces.ts

**Checkpoint**: User Stories 1 and 2 support the decision-to-queue loop without execution.

---

## Phase 5: User Story 3 - Prevent Duplicate Or Unsafe Follow-Up Actions (Priority: P3)

**Goal**: Make duplicate and unsafe action attempts visible and non-mutating.

**Independent Test**: Attempt duplicate decisions, duplicate queue items, action-like browser inputs, forged scope, forged approval, dispatch fields, retry fields, wallet actions, and asset actions; verify no unsafe mutation occurs.

### Tests for User Story 3

- [x] T029 [P] [US3] Add unit tests for duplicate decision and queue lookup behavior in apps/web/tests/unit/numbers-followup-actions.test.ts
- [x] T030 [P] [US3] Add contract tests for action-like inputs and forged approval/scope/provenance rejection in apps/web/tests/contract/numbers-api.test.ts
- [x] T031 [P] [US3] Add browser smoke assertions for duplicate and blocked unsafe follow-up action states in apps/web/e2e/numbers-followup-actions.spec.ts

### Implementation for User Story 3

- [x] T032 [US3] Surface existing decision and queue artifact summaries in Numbers follow-up responses from netlify/functions/numbers.ts
- [x] T033 [US3] Render duplicate and unsafe-action boundary states in apps/web/src/features/numbers/components/NumbersPanel.tsx
- [x] T034 [US3] Ensure Numbers follow-up action responses exclude secrets, tokens, worker credentials, dispatch targets, retry schedules, and external execution handles in netlify/functions/numbers.ts

**Checkpoint**: Duplicate and unsafe follow-up actions are inspectable and non-mutating.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap update, and full quality gate.

- [x] T035 [P] Update README Numbers follow-up action notes and no-execution boundaries in README.md
- [x] T036 [P] Update roadmap with M11 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T037 Run npm run lint and record result in specs/011-numbers-followup-actions/quickstart.md
- [x] T038 Run npm run typecheck and record result in specs/011-numbers-followup-actions/quickstart.md
- [x] T039 Run npm test and record result in specs/011-numbers-followup-actions/quickstart.md
- [x] T040 Run npm run test:e2e and record result in specs/011-numbers-followup-actions/quickstart.md
- [x] T041 Run npm run build and record result in specs/011-numbers-followup-actions/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 decision creation and existing decision approval workflow.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 action paths.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers MVP decision creation from Numbers follow-ups.
- **User Story 2 (P2)**: Starts after US1; adds approved decision to queue creation.
- **User Story 3 (P3)**: Starts after US1 and US2; hardens duplicate and unsafe action boundaries.

### Parallel Opportunities

- T001, T002, and T004 can run in parallel.
- T005 and T006 can run in parallel after fixture shape is clear.
- T011, T012, and T013 can run in parallel for US1 tests.
- T020, T021, and T022 can run in parallel for US2 tests.
- T029, T030, and T031 can run in parallel for duplicate and unsafe action coverage.
- T035 and T036 can run in parallel after behavior is stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add contract tests for POST /api/numbers/follow-ups/:candidateId/decision success and duplicate behavior in apps/web/tests/contract/numbers-api.test.ts"
Task: "Add contract tests for missing candidate, out-of-scope snapshot, unsafe fields, and secret-free responses in apps/web/tests/contract/numbers-api.test.ts"
Task: "Add browser smoke test for creating a decision from a Numbers follow-up in apps/web/e2e/numbers-followup-actions.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Add shared follow-up action contracts and fixtures.
2. Add server-side candidate lookup, provenance mapping, duplicate checks, and unsafe field detection.
3. Implement decision creation from a Numbers follow-up.
4. Validate US1 independently before queue creation.

### Incremental Delivery

1. Add decision creation from Numbers follow-ups.
2. Add approved decision to queue creation.
3. Add duplicate and unsafe action hardening.
4. Update docs and run the complete validation gate from quickstart.md.

### Notes

- M11 does not run live ESI sync or store ESI tokens.
- M11 does not prepare handoffs, claim handoffs, schedule retries, dispatch workers, call EVE APIs, mutate external services, or execute player-impacting actions.
- Decision records remain the approval gateway for queued work.
