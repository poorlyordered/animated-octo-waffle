# Tasks: Automation Queue

**Input**: Design documents from `/specs/003-automation-queue/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/automation-queue-api.md, quickstart.md

**Tests**: Include contract, unit, and component tests because the implementation plan explicitly requires queue API contract tests, queue normalization/eligibility unit tests, and create/list/detail component coverage.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add automation-queue module structure and shared contract files without changing behavior.

- [x] T001 Create automation-queue feature directories in apps/web/src/features/automation-queue/components, apps/web/src/features/automation-queue/services, and apps/web/src/features/automation-queue/state
- [x] T002 Create automation-queue test support files in apps/web/tests/contract, apps/web/tests/unit, and apps/web/tests/component
- [x] T003 [P] Create shared automation queue contract files in packages/contracts/src/automation-queue.ts and packages/contracts/src/automation-queue.schema.ts
- [x] T004 Export automation queue contracts from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, validation, persistence helpers, and queue eligibility rules required before any user story can work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Define AutomationQueueItem, QueueStatus, QueueProvenance, ApprovalSnapshot, QueueFailure, QueueOutput, QueueRetry, and API response/request types in packages/contracts/src/automation-queue.ts
- [x] T006 Define Zod schemas for queue items, queue create requests, list/detail responses, and status filters in packages/contracts/src/automation-queue.schema.ts
- [x] T007 [P] Add automation queue fixture data for queued, blocked, running, failed, completed, canceled, player-impacting, and empty states in apps/web/tests/fixtures/automationQueue.ts
- [x] T008 Implement queue eligibility and approval boundary helpers in netlify/functions/_shared/automation-queue-rules.ts
- [x] T009 Implement automation_queue document normalizer and queue provenance mapper in netlify/functions/_shared/automation-queue-normalizer.ts
- [x] T010 Implement automation_queue MongoDB adapter helpers for scoped list, find, and insert operations in netlify/functions/_shared/automation-queue-store.ts
- [x] T011 Create Netlify automation-queue function skeleton with method and path routing in netlify/functions/automation-queue.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Queue Work From An Approved Decision (Priority: P1) MVP

**Goal**: Commander can create a durable queue record from an approved decision with task intent, input summary, expected output, source decision linkage, provenance snapshot, and initial status `queued`.

**Independent Test**: Start from an approved decision fixture; create a queue item; verify task fields, source decision link, provenance snapshot, status `queued`, created timestamp, and no execution metadata.

### Tests for User Story 1

- [x] T012 [P] [US1] Add contract tests for POST /api/automation-queue success, malformed request, missing source decision, and unapproved source decision in apps/web/tests/contract/automation-queue-api.test.ts
- [x] T013 [P] [US1] Add unit tests for queue provenance mapping, create normalization, and no-execution-field defaults in apps/web/tests/unit/automation-queue-normalizer.test.ts
- [x] T014 [P] [US1] Add component tests for creating a queue item from an approved decision in apps/web/tests/component/AutomationQueueCreate.test.tsx

### Implementation for User Story 1

- [x] T015 [P] [US1] Implement POST create queue handling in netlify/functions/automation-queue.ts
- [x] T016 [US1] Implement source decision lookup and queue provenance snapshot creation in netlify/functions/_shared/automation-queue-store.ts
- [x] T017 [US1] Implement automation queue client create service in apps/web/src/features/automation-queue/services/automationQueueClient.ts
- [x] T018 [US1] Implement queue creation state hook in apps/web/src/features/automation-queue/state/useAutomationQueue.ts
- [x] T019 [US1] Add create-queue controls to approved decision details in apps/web/src/features/decision-records/components/DecisionRecordDetail.tsx
- [x] T020 [US1] Implement AutomationQueueCreate component with task intent, input summary, expected output, and owner inputs in apps/web/src/features/automation-queue/components/AutomationQueueCreate.tsx
- [x] T021 [US1] Render created queue confirmation with provenance and no-execution summary in apps/web/src/features/automation-queue/components/AutomationQueueSummary.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Inspect Queue State And Failures (Priority: P2)

**Goal**: Commander can list queue records, inspect queue detail, and understand queued, blocked, running, failed, completed, and canceled work without triggering retries or execution.

**Independent Test**: Load seeded queue records with multiple statuses; verify list filters, detail metadata, failure fields, retry eligibility, output summary, and source provenance are visible.

### Tests for User Story 2

- [x] T022 [P] [US2] Add contract tests for GET /api/automation-queue and GET /api/automation-queue/:id in apps/web/tests/contract/automation-queue-api.test.ts
- [x] T023 [P] [US2] Add unit tests for queue status filter validation and failed/completed record normalization in apps/web/tests/unit/automation-queue-normalizer.test.ts
- [x] T024 [P] [US2] Add component tests for queue list, detail, status, failure, retry, and output rendering in apps/web/tests/component/AutomationQueueStatus.test.tsx

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement GET queue list handling with optional status and sourceDecisionId filters in netlify/functions/automation-queue.ts
- [x] T026 [US2] Implement GET queue detail handling in netlify/functions/automation-queue.ts
- [x] T027 [US2] Extend automation queue client service with list and detail calls in apps/web/src/features/automation-queue/services/automationQueueClient.ts
- [x] T028 [US2] Extend automation queue state hook with list loading, detail loading, and status filter behavior in apps/web/src/features/automation-queue/state/useAutomationQueue.ts
- [x] T029 [US2] Implement AutomationQueueList component with status grouping or filtering in apps/web/src/features/automation-queue/components/AutomationQueueList.tsx
- [x] T030 [US2] Implement AutomationQueueDetail component with source decision, provenance, failure, retry, and output sections in apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx
- [x] T031 [US2] Add automation queue route integration in apps/web/src/routes/AutomationQueueRoute.tsx and apps/web/src/App.tsx

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Preserve Approval Boundaries (Priority: P3)

**Goal**: Queue creation rejects unapproved decisions and player-impacting decisions without approval metadata while clearly distinguishing queued work from execution.

**Independent Test**: Attempt queue creation from proposed, rejected, and player-impacting approval-missing decisions; verify rejection and no queue record; then queue a player-impacting approved decision and verify it remains `queued` with approval provenance only.

### Tests for User Story 3

- [x] T032 [P] [US3] Add contract tests for approval-boundary queue rejection and approved player-impacting queue success in apps/web/tests/contract/automation-queue-api.test.ts
- [x] T033 [P] [US3] Add unit tests for queue eligibility and player-impacting approval rules in apps/web/tests/unit/automation-queue-rules.test.ts
- [x] T034 [P] [US3] Add component tests for queue boundary messaging and no-execution language in apps/web/tests/component/AutomationQueueApproval.test.tsx

### Implementation for User Story 3

- [x] T035 [US3] Enforce approved-source-decision and player-impacting approval rules in netlify/functions/_shared/automation-queue-rules.ts
- [x] T036 [US3] Persist approval snapshot and reject queue creation without creating partial queue records in netlify/functions/_shared/automation-queue-store.ts
- [x] T037 [US3] Reject or clearly surface duplicate queue creation attempts for the same source decision and task intent in netlify/functions/_shared/automation-queue-store.ts
- [x] T038 [US3] Surface queue eligibility and approval-boundary messages in apps/web/src/features/decision-records/components/DecisionRecordDetail.tsx
- [x] T039 [US3] Add player-impacting queue boundary state handling in apps/web/src/features/automation-queue/state/useAutomationQueue.ts
- [x] T040 [US3] Verify queue mutation responses never emit execution, retry, EVE action, or external-service success language in netlify/functions/automation-queue.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and implementation hardening across all stories.

- [x] T041 [P] Update README.md with automation queue environment and local validation notes
- [x] T042 [P] Add validation results for Automation Queue in specs/003-automation-queue/validation.md
- [x] T043 Run npm run lint and record result in specs/003-automation-queue/validation.md
- [x] T044 Run npm run typecheck and record result in specs/003-automation-queue/validation.md
- [x] T045 Run npm test and record result in specs/003-automation-queue/validation.md
- [x] T046 Run npm run build and record result in specs/003-automation-queue/validation.md
- [x] T047 Validate quickstart flow from specs/003-automation-queue/quickstart.md against isolated MongoDB write target when available
- [x] T048 Review implementation against constitution gates in specs/003-automation-queue/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story 1 (Phase 3): depends on Foundational completion.
- User Story 2 (Phase 4): depends on Foundational completion; can be implemented after US1 or independently with fixtures.
- User Story 3 (Phase 5): depends on Foundational completion and integrates with US1 queue creation behavior.
- Polish (Phase 6): depends on selected user stories being complete.

### User Story Dependencies

- US1 Queue Work From An Approved Decision: MVP and first delivery target.
- US2 Inspect Queue State And Failures: independently testable after foundational services exist; composes with US1-created queue records.
- US3 Preserve Approval Boundaries: depends on the foundational queue rules and US1 mutation path.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001.
- T007, T008, T009, and T010 can run in parallel after T005 and T006.
- T012, T013, and T014 can run in parallel.
- T022, T023, and T024 can run in parallel.
- T032, T033, and T034 can run in parallel.
- T041 and T042 can run in parallel with final validation commands.

## Parallel Example: User Story 1

```bash
# Contract, unit, and component tests can be written together:
Task: "T012 Add contract tests for POST /api/automation-queue"
Task: "T013 Add unit tests for queue provenance mapping"
Task: "T014 Add component tests for creating a queue item"

# Then implementation can proceed through endpoint, client service, state, and UI.
```

## Parallel Example: User Story 2

```bash
# Status/list/detail tests can be written in parallel:
Task: "T022 Add contract tests for GET automation queue"
Task: "T023 Add unit tests for failed/completed normalization"
Task: "T024 Add component tests for list/detail/status rendering"
```

## Parallel Example: User Story 3

```bash
# Approval-boundary tests can be written in parallel:
Task: "T032 Add contract tests for approval boundary"
Task: "T033 Add unit tests for queue eligibility rules"
Task: "T034 Add component tests for approval boundary messaging"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate that a commander can create a queued work item from an approved decision with provenance and no execution metadata.
4. Stop for review before expanding queue inspection and approval-boundary edge cases if needed.

### Incremental Delivery

1. US1 delivers durable queue creation from approved decisions.
2. US2 adds operational visibility into queue state and future worker metadata.
3. US3 hardens constitutional approval boundaries for player-impacting queued work.
4. Polish records validation and quickstart evidence.
