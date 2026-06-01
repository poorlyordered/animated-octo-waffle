# Tasks: Decision Record Loop

**Input**: Design documents from `/specs/002-decision-record-loop/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/decision-record-api.md, quickstart.md

**Tests**: Include contract, unit, and component tests because the implementation plan explicitly requires decision API contract tests, state-transition/approval unit tests, and create/list/detail/status component coverage.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add decision-record module structure and shared contract files without changing behavior.

- [ ] T001 Create decision-record feature directories in apps/web/src/features/decision-records/components, apps/web/src/features/decision-records/services, and apps/web/src/features/decision-records/state
- [ ] T002 Create decision-record test support files in apps/web/tests/contract, apps/web/tests/unit, and apps/web/tests/component
- [ ] T003 [P] Create shared decision record contract files in packages/contracts/src/decision-record.ts and packages/contracts/src/decision-record.schema.ts
- [ ] T004 Export decision record contracts from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, validation, persistence helpers, and state rules required before any user story can work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Define DecisionRecord, DecisionStatus, SourceProvenanceSnapshot, DecisionStatusHistoryEntry, ApprovalRecord, and API response/request types in packages/contracts/src/decision-record.ts
- [ ] T006 Define Zod schemas for decision records, create requests, status update requests, list responses, and mutation responses in packages/contracts/src/decision-record.schema.ts
- [ ] T007 [P] Add decision record fixture data for proposed, approved, delegated, done, rejected, player-impacting, and empty states in apps/web/tests/fixtures/decisionRecords.ts
- [ ] T008 Implement status transition validation and approval requirement helpers in netlify/functions/_shared/decision-record-rules.ts
- [ ] T009 Implement strategic_decisions document normalizer, legacy field compatibility mapping, and source provenance mapper in netlify/functions/_shared/decision-record-normalizer.ts
- [ ] T010 Implement strategic_decisions MongoDB adapter helpers for scoped list, find, insert, and status update operations in netlify/functions/_shared/decision-record-store.ts
- [ ] T011 Create Netlify decision-records function skeleton with method routing in netlify/functions/decision-records.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Record A Decision From A Recommendation (Priority: P1) MVP

**Goal**: Commander can create a durable decision record from a command brief recommendation with rationale, expected result, source link, provenance snapshot, and initial status.

**Independent Test**: Start from a processed command brief fixture with one recommendation; create a decision record; verify recommendation text, source brief link, rationale, expected result, provenance snapshot, status `proposed`, and created timestamp.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add contract tests for POST /api/decision-records success, validation failure, and missing source brief in apps/web/tests/contract/decision-record-api.test.ts
- [ ] T013 [P] [US1] Add unit tests for source provenance mapping, create normalization, and legacy strategic_decisions compatibility in apps/web/tests/unit/decision-record-normalizer.test.ts
- [ ] T014 [P] [US1] Add component tests for creating a decision from a recommendation in apps/web/tests/component/DecisionRecordCreate.test.tsx

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement POST create decision handling in netlify/functions/decision-records.ts
- [ ] T016 [US1] Implement source brief lookup and provenance snapshot creation in netlify/functions/_shared/decision-record-store.ts
- [ ] T017 [US1] Implement decision record client create service in apps/web/src/features/decision-records/services/decisionRecordClient.ts
- [ ] T018 [US1] Implement decision creation state hook in apps/web/src/features/decision-records/state/useDecisionRecords.ts
- [ ] T019 [US1] Add create-decision controls to command brief recommendations in apps/web/src/features/command-brief/components/CommandBriefPanel.tsx
- [ ] T020 [US1] Implement DecisionRecordCreate component with rationale, expected result, and player-impacting inputs in apps/web/src/features/decision-records/components/DecisionRecordCreate.tsx
- [ ] T021 [US1] Render created decision confirmation with provenance summary in apps/web/src/features/decision-records/components/DecisionRecordSummary.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Track Decision Status (Priority: P2)

**Goal**: Commander can list decisions, inspect decision detail, update allowed statuses, and see status history.

**Independent Test**: Create a decision record, update it through allowed statuses, and verify current status and append-only status history are visible.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add contract tests for GET /api/decision-records and PATCH /api/decision-records/:id/status in apps/web/tests/contract/decision-record-api.test.ts
- [ ] T023 [P] [US2] Add unit tests for valid and invalid decision status transitions in apps/web/tests/unit/decision-record-rules.test.ts
- [ ] T024 [P] [US2] Add component tests for decision list, detail, and status history rendering in apps/web/tests/component/DecisionRecordStatus.test.tsx

### Implementation for User Story 2

- [ ] T025 [P] [US2] Implement GET decision list handling in netlify/functions/decision-records.ts
- [ ] T026 [US2] Implement PATCH status update handling with append-only history in netlify/functions/decision-records.ts
- [ ] T027 [US2] Extend decision record client service with list and updateStatus calls in apps/web/src/features/decision-records/services/decisionRecordClient.ts
- [ ] T028 [US2] Extend decision record state hook with list loading and status update behavior in apps/web/src/features/decision-records/state/useDecisionRecords.ts
- [ ] T029 [US2] Implement DecisionRecordList component in apps/web/src/features/decision-records/components/DecisionRecordList.tsx
- [ ] T030 [US2] Implement DecisionRecordDetail component with status history in apps/web/src/features/decision-records/components/DecisionRecordDetail.tsx
- [ ] T031 [US2] Add decision records route integration in apps/web/src/routes/DecisionRecordsRoute.tsx and apps/web/src/App.tsx

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Preserve Command Authority For Player-Impacting Actions (Priority: P3)

**Goal**: Player-impacting decisions require explicit approval metadata before action-like progression, and the UI clearly distinguishes approval from execution or queueing.

**Independent Test**: Mark a decision as player-impacting, attempt action-like progression without approval text, verify rejection, then provide explicit approval and verify approval metadata is recorded without creating executed action or queue state.

### Tests for User Story 3

- [ ] T032 [P] [US3] Add contract tests for player-impacting status update rejection and approval success in apps/web/tests/contract/decision-record-api.test.ts
- [ ] T033 [P] [US3] Add unit tests for approval requirement rules in apps/web/tests/unit/decision-record-rules.test.ts
- [ ] T034 [P] [US3] Add component tests for approval boundary messaging in apps/web/tests/component/DecisionRecordApproval.test.tsx

### Implementation for User Story 3

- [ ] T035 [US3] Enforce explicit approval text for player-impacting progression in netlify/functions/_shared/decision-record-rules.ts
- [ ] T036 [US3] Persist approval metadata without creating automation queue entries in netlify/functions/_shared/decision-record-store.ts
- [ ] T037 [US3] Extend status update UI with explicit approval input and no-execution messaging in apps/web/src/features/decision-records/components/DecisionRecordDetail.tsx
- [ ] T038 [US3] Add player-impacting approval state handling in apps/web/src/features/decision-records/state/useDecisionRecords.ts
- [ ] T039 [US3] Verify no action or queue language is emitted from decision mutation responses in netlify/functions/decision-records.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and implementation hardening across all stories.

- [ ] T040 [P] Update README.md with decision record environment and local validation notes
- [ ] T041 [P] Add validation results for Decision Record Loop in specs/002-decision-record-loop/validation.md
- [ ] T042 Run npm run lint and record result in specs/002-decision-record-loop/validation.md
- [ ] T043 Run npm run typecheck and record result in specs/002-decision-record-loop/validation.md
- [ ] T044 Run npm test and record result in specs/002-decision-record-loop/validation.md
- [ ] T045 Run npm run build and record result in specs/002-decision-record-loop/validation.md
- [ ] T046 Validate quickstart flow from specs/002-decision-record-loop/quickstart.md when MongoDB write target is available
- [ ] T047 Review implementation against constitution gates in specs/002-decision-record-loop/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story 1 (Phase 3): depends on Foundational completion.
- User Story 2 (Phase 4): depends on Foundational completion; can be implemented after US1 or independently with fixtures.
- User Story 3 (Phase 5): depends on Foundational completion and integrates with US2 status update behavior.
- Polish (Phase 6): depends on selected user stories being complete.

### User Story Dependencies

- US1 Record A Decision From A Recommendation: MVP and first delivery target.
- US2 Track Decision Status: independently testable after foundational services exist; composes with US1 created records.
- US3 Preserve Command Authority: depends on status update and approval semantics from the foundational rules and US2 mutation path.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001.
- T007, T008, T009, and T010 can run in parallel after T005 and T006.
- T012, T013, and T014 can run in parallel.
- T022, T023, and T024 can run in parallel.
- T032, T033, and T034 can run in parallel.
- T040 and T041 can run in parallel with final validation commands.

## Parallel Example: User Story 1

```bash
# Contract, unit, and component tests can be written together:
Task: "T012 Add contract tests for POST /api/decision-records"
Task: "T013 Add unit tests for source provenance mapping"
Task: "T014 Add component tests for creating a decision"

# Then implementation can proceed through endpoint, client service, state, and UI.
```

## Parallel Example: User Story 2

```bash
# Status/list tests can be written in parallel:
Task: "T022 Add contract tests for GET and PATCH decision records"
Task: "T023 Add unit tests for status transitions"
Task: "T024 Add component tests for list/detail/history"
```

## Parallel Example: User Story 3

```bash
# Approval-boundary tests can be written in parallel:
Task: "T032 Add contract tests for approval boundary"
Task: "T033 Add unit tests for approval requirement rules"
Task: "T034 Add component tests for approval boundary messaging"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate that a commander can create a proposed decision record from a command brief recommendation with source provenance.
4. Stop for review before expanding status updates and approval boundaries if needed.

### Incremental Delivery

1. US1 delivers durable decision recording from recommendations.
2. US2 adds operational tracking through status and history.
3. US3 adds constitutional approval boundaries for player-impacting decisions.
4. Polish records validation and quickstart evidence.
