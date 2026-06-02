# Tasks: Retry Execution Worker

**Input**: Design documents from `specs/016-retry-execution-worker/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/retry-execution-worker-api.md`, `quickstart.md`

## Phase 1: Setup

- [x] T001 Verify active Spec Kit pointer and AGENTS plan reference for `specs/016-retry-execution-worker`
- [x] T002 [P] Extend retry contracts and schemas in `packages/contracts/src/retry.ts` and `packages/contracts/src/retry.schema.ts`

## Phase 2: Foundational

- [x] T003 Extend retry request persistence for due listing, atomic claim, completion, and blocked updates in `netlify/functions/_shared/retry-request-store.ts`
- [x] T004 Add retry execution service helpers for handoff and ESI sync replacement preparation in `netlify/functions/_shared/retry-execution-service.ts`
- [x] T005 Add trusted retry worker routing in `netlify/functions/retry-worker.ts`

## Phase 3: User Story 1 - Execute Scheduled Handoff Retry (Priority: P1)

**Goal**: A trusted worker can execute a scheduled failed handoff retry and create one replacement ready handoff.

**Independent Test**: Seed a failed handoff and scheduled retry, execute through the retry worker route, and assert the retry completes with one replacement ready handoff.

- [x] T006 [P] [US1] Add handoff retry execution fixtures in `apps/web/tests/fixtures/retry.ts` and `apps/web/tests/fixtures/workerHandoff.ts`
- [x] T007 [US1] Add handoff retry execution contract tests in `apps/web/tests/contract/retry-worker-api.test.ts`
- [x] T008 [US1] Implement replacement handoff creation and retry completion linkage in `netlify/functions/_shared/retry-execution-service.ts`
- [x] T009 [US1] Surface completed handoff retry summaries in `netlify/functions/_shared/worker-handoff-normalizer.ts` and `netlify/functions/automation-queue.ts`

## Phase 4: User Story 2 - Execute Scheduled ESI Sync Retry (Priority: P2)

**Goal**: A trusted worker can execute a scheduled failed Numbers ESI sync retry and create one replacement queued sync request.

**Independent Test**: Seed a failed ESI sync and scheduled retry, execute through the retry worker route, and assert the retry completes with one replacement queued sync request and no ESI fetch.

- [x] T010 [P] [US2] Add ESI sync retry execution fixtures in `apps/web/tests/fixtures/retry.ts` and `apps/web/tests/fixtures/esiSync.ts`
- [x] T011 [US2] Add ESI sync retry execution contract tests in `apps/web/tests/contract/retry-worker-api.test.ts`
- [x] T012 [US2] Implement replacement ESI sync request creation and consent blocking in `netlify/functions/_shared/retry-execution-service.ts`
- [x] T013 [US2] Surface completed and blocked ESI retry summaries in `netlify/functions/_shared/esi-sync-request-store.ts` and `netlify/functions/esi-sync.ts`

## Phase 5: User Story 3 - Inspect Retry Execution Outcomes (Priority: P3)

**Goal**: Browser surfaces display scheduled, claimed, completed, and blocked retry outcomes without execution controls or secret exposure.

**Independent Test**: Load automation queue and ESI sync history fixtures with retry execution outcomes and verify safe status text.

- [x] T014 [P] [US3] Update automation queue browser fixtures and smoke coverage in `apps/web/e2e/worker-handoff.spec.ts` and `apps/web/e2e/fixtures/command-surfaces.ts`
- [x] T015 [P] [US3] Update ESI sync browser fixtures and smoke coverage in `apps/web/e2e/esi-token-vault-sync.spec.ts` and `apps/web/e2e/fixtures/api-fixtures.ts`
- [x] T016 [US3] Render completed and blocked retry outcomes in `apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx`
- [x] T017 [US3] Render completed and blocked retry outcomes in `apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx`

## Phase 6: Polish & Cross-Cutting

- [x] T018 Update `docs/roadmap.md` and `README.md` with M16 delivered capabilities and validation notes
- [x] T019 Run validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`
- [x] T020 Update `specs/016-retry-execution-worker/quickstart.md` with validation results

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before user story implementation.
- US1 can complete independently after Phase 2.
- US2 depends on the same foundational retry worker route but is otherwise independent of US1.
- US3 depends on US1/US2 outcome summaries.

## Parallel Opportunities

- T002 can run alongside documentation verification.
- T006 and T010 can be prepared independently.
- T014 and T015 can run in parallel after backend summaries are available.

## Implementation Strategy

Start with the trusted worker route and retry store state machine, complete handoff retry execution as the MVP, then add ESI sync retry execution and browser outcome display.
