# Tasks: EVE SSO Session Scope

**Input**: Design documents from `/specs/006-eve-sso-scope/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/session-api.md, quickstart.md

**Tests**: Required by FR-013, SC-001, SC-002, SC-003, SC-004, and SC-005.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared contract and server module locations for session scope.

- [x] T001 [P] Add browser-safe session contract exports in packages/contracts/src/auth-session.ts
- [x] T002 [P] Add Zod validation schemas for session responses and session scope in packages/contracts/src/auth-session.schema.ts
- [x] T003 Export auth session contracts and schemas from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared signed-cookie, SSO, and scope-resolution primitives required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Add signed HTTP-only cookie helpers for session and SSO state in netlify/functions/_shared/session-cookie.ts
- [x] T005 [P] Add EVE SSO configuration, state, redirect, and deterministic identity helpers in netlify/functions/_shared/eve-sso.ts
- [x] T006 Extend FunctionEvent typing for cookie-aware session resolution in netlify/functions/_shared/auth-scope.ts
- [x] T007 Update auth scope resolution to prefer valid signed session scope and fall back to EVEONLINE_CORPORATION_ID in netlify/functions/_shared/auth-scope.ts
- [x] T008 Update existing command API handlers to pass the Netlify event into getAuthScope in netlify/functions/command-brief.ts
- [x] T009 Update existing command API handlers to pass the Netlify event into getAuthScope in netlify/functions/research-status.ts
- [x] T010 Update existing command API handlers to pass the Netlify event into getAuthScope in netlify/functions/decision-records.ts
- [x] T011 Update existing command API handlers to pass the Netlify event into getAuthScope in netlify/functions/automation-queue.ts
- [x] T012 Update existing command API handlers to pass the Netlify event into getAuthScope in netlify/functions/people.ts
- [x] T013 [P] Add unit tests for signed cookie creation, verification, expiration, clearing, and tamper rejection in apps/web/tests/unit/session-cookie.test.ts
- [x] T014 [P] Add unit tests for session-first, fallback, missing, and browser-controlled corporation ID scope resolution in apps/web/tests/unit/auth-scope.test.ts

**Checkpoint**: Shared session scope resolution is testable without live EVE SSO.

---

## Phase 3: User Story 1 - Sign In To Establish Command Scope (Priority: P1) MVP

**Goal**: Allow a commander to start EVE SSO, complete callback validation with deterministic identity fixtures, and establish a server-owned session corporation scope.

**Independent Test**: Simulate a successful SSO callback with deterministic identity data, then verify command APIs resolve session corporation scope without accepting browser-provided corporation IDs.

### Tests for User Story 1

- [x] T015 [P] [US1] Add contract tests for GET /api/eve-sso-start and GET /api/eve-sso-callback in apps/web/tests/contract/eve-sso-api.test.ts
- [x] T016 [P] [US1] Add command API session precedence tests proving browser corporation inputs are ignored in apps/web/tests/contract/auth-session-scope.test.ts

### Implementation for User Story 1

- [x] T017 [US1] Implement GET /api/eve-sso-start handler with signed state cookie and local return path validation in netlify/functions/eve-sso-start.ts
- [x] T018 [US1] Implement GET /api/eve-sso-callback handler with state validation, deterministic identity support, session cookie creation, and safe errors in netlify/functions/eve-sso-callback.ts
- [x] T019 [US1] Wire callback identity conversion to EveSessionScope validation in netlify/functions/_shared/eve-sso.ts
- [x] T020 [US1] Add safe redirect and cookie response support needed by SSO handlers in netlify/functions/_shared/http.ts

**Checkpoint**: User Story 1 is independently functional with deterministic callback fixtures.

---

## Phase 4: User Story 2 - Preserve Local Development Fallback (Priority: P2)

**Goal**: Keep local development, tests, and command APIs working through EVEONLINE_CORPORATION_ID when no authenticated session exists.

**Independent Test**: Run existing contract/unit/browser validations without an SSO session and verify server APIs continue to use fallback corporation scope.

### Tests for User Story 2

- [x] T021 [P] [US2] Add contract tests for GET /api/eve-session fallback and missing-scope responses in apps/web/tests/contract/eve-session-api.test.ts
- [x] T022 [P] [US2] Update existing command API contract tests to cover no-session fallback behavior in apps/web/tests/contract/command-brief-api.test.ts

### Implementation for User Story 2

- [x] T023 [US2] Implement GET /api/eve-session fallback, missing-scope, and signed-in response handling in netlify/functions/eve-session.ts
- [x] T024 [US2] Ensure safe scope-not-configured errors contain no secrets in netlify/functions/_shared/auth-scope.ts
- [x] T025 [US2] Update test fixtures to provide deterministic fallback corporation scope in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: User Stories 1 and 2 work independently, and existing no-session validation still passes.

---

## Phase 5: User Story 3 - Inspect Session And Sign Out (Priority: P3)

**Goal**: Show active EVE character/corporation scope in the app and let the commander clear the server-owned session.

**Independent Test**: Simulate active and signed-out session states in browser smoke tests; verify display-safe metadata appears and sign-out clears session state.

### Tests for User Story 3

- [x] T026 [P] [US3] Add contract tests for POST /api/eve-session/sign-out idempotency and cookie clearing in apps/web/tests/contract/eve-session-api.test.ts
- [x] T027 [P] [US3] Add Playwright smoke tests for signed-out/fallback and signed-in visible session states in apps/web/e2e/session-scope.spec.ts

### Implementation for User Story 3

- [x] T028 [US3] Extend eve-session handler with POST /api/eve-session/sign-out in netlify/functions/eve-session.ts
- [x] T029 [P] [US3] Add session API client functions in apps/web/src/features/session/services/sessionClient.ts
- [x] T030 [P] [US3] Add session state hook in apps/web/src/features/session/state/useSessionState.ts
- [x] T031 [US3] Add command-scope status component with sign-in/sign-out controls in apps/web/src/features/session/components/SessionStatus.tsx
- [x] T032 [US3] Render session status in the command app shell in apps/web/src/App.tsx
- [x] T033 [US3] Update Playwright API fixtures for session endpoint interception in apps/web/e2e/fixtures/api-fixtures.ts

**Checkpoint**: All user stories are independently functional and browser-visible session behavior is covered.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quickstart validation, and full quality gate.

- [x] T034 [P] Update local environment documentation for EVE SSO session variables and fallback scope in README.md
- [x] T035 [P] Update M6 quickstart validation notes in specs/006-eve-sso-scope/quickstart.md
- [x] T036 Run npm run lint and record result in specs/006-eve-sso-scope/quickstart.md
- [x] T037 Run npm run typecheck and record result in specs/006-eve-sso-scope/quickstart.md
- [x] T038 Run npm test and record result in specs/006-eve-sso-scope/quickstart.md
- [x] T039 Run npm run test:e2e and record result in specs/006-eve-sso-scope/quickstart.md
- [x] T040 Run npm run build and record result in specs/006-eve-sso-scope/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion and may validate alongside US1.
- **User Story 3 (Phase 5)**: Depends on session-state and sign-out endpoints from US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers the MVP authenticated session path.
- **User Story 2 (P2)**: Can start after Foundational; preserves fallback behavior independently of live sign-in.
- **User Story 3 (P3)**: Depends on the session endpoint shape and adds browser-visible controls and sign-out.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T005, T013, and T014 can be prepared in parallel once contracts exist.
- T015 and T016 can run in parallel for US1 test coverage.
- T021 and T022 can run in parallel for US2 test coverage.
- T026 and T027 can run in parallel for US3 test coverage.
- T029 and T030 can run in parallel before T031 integrates them.

---

## Parallel Example: User Story 1

```bash
# Contract tests can be created in parallel:
Task: "Add contract tests for GET /api/eve-sso-start and GET /api/eve-sso-callback in apps/web/tests/contract/eve-sso-api.test.ts"
Task: "Add command API session precedence tests proving browser corporation inputs are ignored in apps/web/tests/contract/auth-session-scope.test.ts"
```

## Parallel Example: User Story 3

```bash
# Browser and client-state work can be split:
Task: "Add Playwright smoke tests for signed-out/fallback and signed-in visible session states in apps/web/e2e/session-scope.spec.ts"
Task: "Add session API client functions in apps/web/src/features/session/services/sessionClient.ts"
Task: "Add session state hook in apps/web/src/features/session/state/useSessionState.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 shared contracts.
2. Complete Phase 2 signed-cookie and scope-resolution foundation.
3. Complete Phase 3 sign-in start and callback with deterministic identity fixtures.
4. Validate US1 through contract/unit tests before adding UI.

### Incremental Delivery

1. Add shared foundation and session-scope tests.
2. Add SSO start/callback session creation.
3. Preserve fallback and missing-scope behavior.
4. Add browser-visible session status and sign-out.
5. Run the complete validation gate from quickstart.md.

### Notes

- [P] tasks target different files and can be done in parallel.
- All command API scope behavior must ignore browser-controlled corporation identity.
- This slice must not perform EVE writes, role/access changes, wallet/asset actions, worker dispatch, or long-running ESI sync.
