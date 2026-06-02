# Tasks: Worker Numbers ESI Ingestion

**Input**: Design documents from `/specs/013-worker-numbers-esi-ingestion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/worker-numbers-esi-ingestion-api.md, quickstart.md

**Tests**: Required by FR-001 through FR-013 and SC-001 through SC-006.

## Phase 1: Setup

- [x] T001 [P] Extend ESI sync contract types with worker-safe request summaries in packages/contracts/src/esi-sync.ts
- [x] T002 [P] Extend ESI sync schemas with worker-safe request summaries in packages/contracts/src/esi-sync.schema.ts

## Phase 2: Foundational

- [x] T003 [P] Add unit tests for ESI sync claim, complete, fail, and duplicate-claim rules in apps/web/tests/unit/esi-sync-request-store.test.ts
- [x] T004 [P] Add unit tests for Numbers ESI ingestion normalization and partial endpoint failures in apps/web/tests/unit/esi-numbers-ingestion.test.ts
- [x] T005 Extend sync request store with ready list, atomic claim, completion, and failure transitions in netlify/functions/_shared/esi-sync-request-store.ts
- [x] T006 Add Numbers snapshot write helper in netlify/functions/_shared/numbers-store.ts
- [x] T007 Add server-only Numbers ESI ingestion helper in netlify/functions/_shared/esi-numbers-ingestion.ts

## Phase 3: User Story 1 - Worker Claims Prepared Sync

- [x] T008 [P] [US1] Add contract tests for worker ready and claim routes in apps/web/tests/contract/esi-sync-worker-api.test.ts
- [x] T009 [US1] Add worker ready and claim handling in netlify/functions/esi-sync-worker.ts

## Phase 4: User Story 2 - Worker Writes Numbers Snapshot

- [x] T010 [P] [US2] Add contract tests for run success and secret-free response in apps/web/tests/contract/esi-sync-worker-api.test.ts
- [x] T011 [US2] Add worker run handling that calls ingestion and writes Numbers snapshots in netlify/functions/esi-sync-worker.ts

## Phase 5: User Story 3 - Worker Completes Or Fails Sync

- [x] T012 [P] [US3] Add contract tests for run failure and explicit fail route in apps/web/tests/contract/esi-sync-worker-api.test.ts
- [x] T013 [US3] Add worker fail handling and safe failure metadata in netlify/functions/esi-sync-worker.ts

## Phase 6: Polish

- [x] T014 [P] Update README worker-side ESI ingestion notes in README.md
- [x] T015 [P] Update roadmap with M13 delivered capabilities in docs/roadmap.md
- [x] T016 Run npm run lint and record result in specs/013-worker-numbers-esi-ingestion/quickstart.md
- [x] T017 Run npm run typecheck and record result in specs/013-worker-numbers-esi-ingestion/quickstart.md
- [x] T018 Run npm test and record result in specs/013-worker-numbers-esi-ingestion/quickstart.md
- [x] T019 Run npm run test:e2e and record result in specs/013-worker-numbers-esi-ingestion/quickstart.md
- [x] T020 Run npm run build and record result in specs/013-worker-numbers-esi-ingestion/quickstart.md

## Dependencies & Execution Order

- Setup precedes foundational work.
- Foundational store and ingestion helpers precede worker routes.
- US1 claim path precedes US2 run path.
- US3 completion/failure hardening depends on US2 run behavior.

## Implementation Strategy

Deliver the worker claim path first, then deterministic ingestion, then failure handling and docs. Keep the browser Numbers surface unchanged; it should read the processed snapshot written by the worker.
