# Tasks: ESI Token Vault Sync

**Input**: Design documents from `/specs/012-esi-token-vault-sync/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/esi-token-vault-sync-api.md, quickstart.md

**Tests**: Required by FR-001 through FR-014 and success criteria SC-001 through SC-008.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add ESI sync contracts, fixtures, and server-only vault configuration.

- [x] T001 [P] Add ESI sync browser-safe contract types in packages/contracts/src/esi-sync.ts
- [x] T002 [P] Add ESI sync Zod schemas in packages/contracts/src/esi-sync.schema.ts
- [x] T003 Export ESI sync contracts and schemas from packages/contracts/src/index.ts
- [x] T004 [P] Add ESI sync browser fixtures in apps/web/e2e/fixtures/esi-sync-fixtures.ts
- [x] T005 Add ESI token vault environment helpers in netlify/functions/_shared/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add token sealing, vault persistence, sync request persistence, domain scopes, duplicate checks, and unsafe input boundaries.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 [P] Add unit tests for token sealing and secret-free vault summaries in apps/web/tests/unit/esi-token-vault.test.ts
- [x] T007 [P] Add unit tests for sync domain scope requirements and missing-scope detection in apps/web/tests/unit/esi-token-vault.test.ts
- [x] T008 Add token sealing and browser-safe summary helpers in netlify/functions/_shared/esi-token-vault.ts
- [x] T009 Add ESI token vault Mongo store in netlify/functions/_shared/esi-token-vault-store.ts
- [x] T010 Add ESI sync request Mongo store with duplicate lookup in netlify/functions/_shared/esi-sync-request-store.ts
- [x] T011 Add ESI sync domain scope configuration and unsafe field detection in netlify/functions/_shared/esi-token-vault.ts

**Checkpoint**: Vault sealing, summary serialization, scope checks, duplicate checks, and unsafe request boundaries are testable without browser workflows.

---

## Phase 3: User Story 1 - Grant Read Sync Consent (Priority: P1) MVP

**Goal**: Let the commander explicitly grant read-sync consent and create an active server-side vault without exposing token material.

**Independent Test**: Complete the consent callback using deterministic live-SSO fixtures and verify active vault status, granted scopes, identity linkage, sealed token storage, and secret-free responses.

### Tests for User Story 1

- [x] T012 [P] [US1] Add contract tests for GET /api/esi-sync/status missing and POST /api/esi-sync/consent/start in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T013 [P] [US1] Add contract tests for consent callback vault creation and unsafe browser fields in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T014 [P] [US1] Add browser smoke test for missing consent and active consent status in apps/web/e2e/esi-token-vault-sync.spec.ts

### Implementation for User Story 1

- [x] T015 [US1] Add ESI sync status and consent-start routes in netlify/functions/esi-sync.ts
- [x] T016 [US1] Extend netlify/functions/eve-sso-callback.ts to complete ESI read-sync consent callbacks
- [x] T017 [US1] Add ESI sync API client in apps/web/src/features/esi-sync/services/esiSyncClient.ts
- [x] T018 [US1] Add ESI sync state hook in apps/web/src/features/esi-sync/state/useEsiSync.ts
- [x] T019 [US1] Add ESI sync panel status and consent controls in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
- [x] T020 [US1] Render the ESI sync panel from apps/web/src/App.tsx
- [x] T021 [US1] Add browser API fixtures for ESI sync status and consent in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Story 1 is independently functional and creates active consent vault status without exposing tokens.

---

## Phase 4: User Story 2 - Inspect And Revoke Vaulted Consent (Priority: P2)

**Goal**: Let the commander inspect and revoke active vaulted consent.

**Independent Test**: Start with an active vault, revoke it, and verify revoked vault status plus blocked future sync preparation.

### Tests for User Story 2

- [x] T022 [P] [US2] Add contract tests for POST /api/esi-sync/revoke active, missing, and revoked states in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T023 [P] [US2] Add browser smoke test for revoking vaulted consent in apps/web/e2e/esi-token-vault-sync.spec.ts

### Implementation for User Story 2

- [x] T024 [US2] Add ESI sync revoke route handling in netlify/functions/esi-sync.ts
- [x] T025 [US2] Add revoke client and state transition in apps/web/src/features/esi-sync/services/esiSyncClient.ts and apps/web/src/features/esi-sync/state/useEsiSync.ts
- [x] T026 [US2] Add revoke controls and revoked-state boundary language in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
- [x] T027 [US2] Add browser API fixtures for ESI vault revocation in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Stories 1 and 2 support inspectable consent lifecycle control.

---

## Phase 5: User Story 3 - Prepare Scoped Read Sync Work (Priority: P3)

**Goal**: Let the commander create queued read-sync requests from an active vault without fetching ESI data or dispatching workers.

**Independent Test**: Prepare Numbers sync from an active vault, verify queued status, duplicate handling, missing-scope blocking, and no-execution response language.

### Tests for User Story 3

- [x] T028 [P] [US3] Add contract tests for POST /api/esi-sync/prepare success and duplicate behavior in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T029 [P] [US3] Add contract tests for missing vault, revoked vault, missing scopes, unsafe fields, and secret-free prepare responses in apps/web/tests/contract/esi-sync-api.test.ts
- [x] T030 [P] [US3] Add browser smoke test for preparing Numbers sync, duplicate sync, and missing-scope blocking in apps/web/e2e/esi-token-vault-sync.spec.ts

### Implementation for User Story 3

- [x] T031 [US3] Add ESI sync prepare route handling in netlify/functions/esi-sync.ts
- [x] T032 [US3] Add prepare-sync client and state transition in apps/web/src/features/esi-sync/services/esiSyncClient.ts and apps/web/src/features/esi-sync/state/useEsiSync.ts
- [x] T033 [US3] Add prepare-sync controls, duplicate state, missing-scope state, and no-execution copy in apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
- [x] T034 [US3] Ensure ESI sync responses exclude token material, credentials, worker secrets, dispatch targets, retry schedules, and execution handles in netlify/functions/esi-sync.ts

**Checkpoint**: Sync requests are queued and inspectable without long-running ingestion or execution.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap update, and full quality gate.

- [x] T035 [P] Update README ESI token vault and no-execution boundary notes in README.md
- [x] T036 [P] Update roadmap with M12 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T037 Run npm run lint and record result in specs/012-esi-token-vault-sync/quickstart.md
- [x] T038 Run npm run typecheck and record result in specs/012-esi-token-vault-sync/quickstart.md
- [x] T039 Run npm test and record result in specs/012-esi-token-vault-sync/quickstart.md
- [x] T040 Run npm run test:e2e and record result in specs/012-esi-token-vault-sync/quickstart.md
- [x] T041 Run npm run build and record result in specs/012-esi-token-vault-sync/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 vault status and consent creation paths.
- **User Story 3 (Phase 5)**: Depends on US1 active vault behavior and US2 revoked-state blocking.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers MVP consent vaulting.
- **User Story 2 (P2)**: Starts after US1; adds revocation and lifecycle control.
- **User Story 3 (P3)**: Starts after US1 and integrates with US2 blocking rules; adds queued sync preparation.

### Parallel Opportunities

- T001, T002, and T004 can run in parallel.
- T006 and T007 can run in parallel after contract shape is clear.
- T012, T013, and T014 can run in parallel for US1 tests.
- T022 and T023 can run in parallel for US2 tests.
- T028, T029, and T030 can run in parallel for US3 tests.
- T035 and T036 can run in parallel after behavior is stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add contract tests for GET /api/esi-sync/status missing and POST /api/esi-sync/consent/start in apps/web/tests/contract/esi-sync-api.test.ts"
Task: "Add contract tests for consent callback vault creation and unsafe browser fields in apps/web/tests/contract/esi-sync-api.test.ts"
Task: "Add browser smoke test for missing consent and active consent status in apps/web/e2e/esi-token-vault-sync.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Add browser-safe ESI sync contracts and fixtures.
2. Add server-side token sealing, vault storage, domain scope checks, and unsafe field detection.
3. Add vault status, consent start, and consent callback vault creation.
4. Validate US1 independently before revocation and sync preparation.

### Incremental Delivery

1. Add explicit consent vaulting.
2. Add inspect and revoke lifecycle controls.
3. Add queued read-sync preparation and duplicate prevention.
4. Update docs and run the complete validation gate from quickstart.md.

### Notes

- M12 does not run live ESI ingestion, refresh tokens in worker execution, dispatch workers, schedule retries, write to EVE, move wallets or assets, mutate contracts, change roles, or execute external-service actions.
- Sync requests are future-worker work records, separate from player-impacting automation queue records.
- Token material must remain server-side and sealed before persistence.
