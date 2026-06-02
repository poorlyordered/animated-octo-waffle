# Tasks: Retry Scheduling

**Input**: Design documents from `/specs/015-retry-scheduling/`

**Tests**: Required by FR-001 through FR-011.

## Phase 1: Setup

- [x] T001 [P] Add retry contract types in packages/contracts/src/retry.ts
- [x] T002 [P] Add retry Zod schemas in packages/contracts/src/retry.schema.ts
- [x] T003 Export retry contracts from packages/contracts/src/index.ts
- [x] T004 [P] Add retry fixtures in apps/web/tests/fixtures/retry.ts

## Phase 2: Foundational

- [x] T005 [P] Add unit tests for retry request store in apps/web/tests/unit/retry-request-store.test.ts
- [x] T006 Add retry request store in netlify/functions/_shared/retry-request-store.ts
- [x] T007 Add retry summaries to worker handoff and sync history contracts as needed

## Phase 3: User Story 1 - Schedule Failed Handoff Retry

- [x] T008 [P] [US1] Add contract tests for handoff retry responses in apps/web/tests/contract/worker-handoff-api.test.ts
- [x] T009 [US1] Add POST /api/worker-handoffs/:id/retry handling in netlify/functions/worker-handoffs.ts
- [x] T010 [US1] Add retry client/state wiring in apps/web/src/features/automation-queue/
- [x] T011 [US1] Render retry scheduling controls/status in apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx

## Phase 4: User Story 2 - Schedule Failed ESI Sync Retry

- [x] T012 [P] [US2] Add contract tests for ESI sync retry responses in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T013 [US2] Add POST /api/esi-sync/:id/retry handling in netlify/functions/esi-sync.ts
- [x] T014 [US2] Add retry client/state wiring in apps/web/src/features/esi-sync/
- [x] T015 [US2] Render failed sync retry scheduling controls/status in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx

## Phase 5: User Story 3 - Inspect Retry Status

- [x] T016 [P] [US3] Add browser smoke coverage in apps/web/e2e/worker-handoff.spec.ts and apps/web/e2e/esi-token-vault-sync.spec.ts
- [x] T017 [US3] Include scheduled retry summaries in failed handoff detail and ESI sync history fixtures
- [x] T018 [US3] Ensure unsafe retry fields are rejected or ignored in netlify/functions/_shared/retry-request-store.ts

## Phase 6: Polish

- [x] T019 [P] Update README retry scheduling notes in README.md
- [x] T020 [P] Update roadmap with M15 delivered capabilities in docs/roadmap.md
- [x] T021 Run npm run lint and record result in quickstart.md
- [x] T022 Run npm run typecheck and record result in quickstart.md
- [x] T023 Run npm test and record result in quickstart.md
- [x] T024 Run npm run test:e2e and record result in quickstart.md
- [x] T025 Run npm run build and record result in quickstart.md
