# Tasks: Retry Cancellation and Policy Controls

**Input**: Design documents from `specs/020-retry-cancellation-policy/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/retry-cancellation-policy-api.md`, `quickstart.md`

## Phase 1: Setup

- [x] T001 Verify active Spec Kit pointer and AGENTS plan reference for `specs/020-retry-cancellation-policy`
- [x] T002 [P] Add retry cancellation and policy contract types/schemas in `packages/contracts/src/retry.ts` and `packages/contracts/src/retry.schema.ts`

## Phase 2: Foundational

- [x] T003 Add retry policy summaries and cancellation transition in `netlify/functions/_shared/retry-request-store.ts`
- [x] T004 Add worker handoff retry cancel endpoint in `netlify/functions/worker-handoffs.ts`
- [x] T005 Add ESI sync retry cancel endpoint in `netlify/functions/esi-sync.ts`

## Phase 3: User Story 1 - Cancel Scheduled or Blocked Retries

- [x] T006 [US1] Add browser clients and hook methods for handoff and ESI retry cancellation
- [x] T007 [US1] Add cancel controls in automation queue and ESI sync panels
- [x] T008 [US1] Add unit coverage for canceling scheduled retry records

## Phase 4: User Story 2 - Surface Retry Policy Controls

- [x] T009 [US2] Include policy metadata in retry summaries and fixtures
- [x] T010 [US2] Add contract coverage for retry policy and cancellation responses

## Phase 5: User Story 3 - Preserve No-Execution Boundaries

- [x] T011 [US3] Update browser smoke fixtures and assertions for policy/cancel no-execution text
- [x] T012 [US3] Preserve unsafe retry field rejection for scheduling and cancellation bodies

## Phase 6: Polish & Cross-Cutting

- [x] T013 Update `docs/roadmap.md`, `README.md`, `.specify/feature.json`, and `AGENTS.md`
- [x] T014 Run validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`
- [x] T015 Update `quickstart.md` with validation results

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before browser rendering.
- US1 is the MVP slice.
- US2 depends on policy metadata in summaries.
- US3 depends on final response shape and browser copy.
