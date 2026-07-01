# Tasks: Auth Landing Gate

**Input**: Design documents from `specs/057-auth-landing-gate/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-landing-gate.md, quickstart.md

**Tests**: Required. This feature changes authentication, authorization, and app-shell behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing auth shell, legacy reference, and validation targets.

- [X] T001 Verify active feature pointer and branch in `.specify/feature.json` and `AGENTS.md`
- [X] T002 [P] Capture legacy front-page reference from `/mnt/f/Eve AI/project/src/pages/Home.tsx` and `/mnt/f/Eve AI/project/src/pages/Login.tsx` in `specs/057-auth-landing-gate/research.md`
- [X] T003 [P] Confirm current React session and command shell files in `apps/web/src/App.tsx`, `apps/web/src/features/session/`, and `apps/web/src/styles/app.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared production authorization policy before UI work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add production session-required tests in `apps/web/tests/unit/auth-scope.test.ts`
- [X] T005 Implement production session-required auth scope behavior in `netlify/functions/_shared/auth-scope.ts`
- [X] T006 Update affected command API contract tests in `apps/web/tests/contract/command-brief-api.test.ts`, `apps/web/tests/contract/numbers-api.test.ts`, and related API tests as needed

**Checkpoint**: Production command data APIs reject no-session fallback while local/test fallback remains available.

---

## Phase 3: User Story 1 - Gate Command Data Behind EVE Session (Priority: P1) MVP

**Goal**: Unauthenticated visitors see only the landing/login gate and the browser does not start command data API requests.

**Independent Test**: Open `/` without a signed session in browser smoke coverage and confirm no command surfaces or command API calls occur.

### Tests for User Story 1

- [X] T007 [P] [US1] Add app-shell unit tests for no-session gate behavior in `apps/web/tests/unit/app-auth-gate.test.ts`
- [X] T008 [P] [US1] Add Playwright unauthenticated gate coverage in `apps/web/e2e/auth-landing-gate.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Refactor `apps/web/src/App.tsx` to load session state before mounting command surfaces
- [X] T010 [US1] Add `apps/web/src/features/session/components/LoginGate.tsx` based on the legacy front-page identity and EVE SSO CTA
- [X] T011 [US1] Add landing gate styles in `apps/web/src/styles/app.css` with responsive layout and no nested card sections
- [X] T012 [US1] Verify unauthenticated gate does not invoke command data clients in `apps/web/src/features/*/state` by mount prevention

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Enter Command Center After Authorized Session (Priority: P2)

**Goal**: Authorized signed-in corporation users see the existing command shell and can sign out back to the gate.

**Independent Test**: Load with a valid signed session fixture and confirm command surfaces render; sign out removes them.

### Tests for User Story 2

- [X] T013 [P] [US2] Add app-shell unit tests for signed-session command shell behavior in `apps/web/tests/unit/app-auth-gate.test.ts`
- [X] T014 [P] [US2] Add or update Playwright signed-session command-shell coverage in `apps/web/e2e/command-surfaces.spec.ts`

### Implementation for User Story 2

- [X] T015 [US2] Update `apps/web/src/features/session/components/SessionStatus.tsx` to render as authenticated shell status without owning session fetch
- [X] T016 [US2] Wire sign-out state transition through `apps/web/src/App.tsx` and `apps/web/src/features/session/state/useSessionState.ts`
- [X] T017 [US2] Preserve existing command shell order and command operating boundary copy in `apps/web/src/App.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Explain Unauthorized Corporation State (Priority: P3)

**Goal**: Signed-in users from another corporation see a safe unauthorized state and no command data.

**Independent Test**: Load with a mismatched corporation session fixture and confirm unauthorized state plus sign-out, with no command surfaces.

### Tests for User Story 3

- [X] T018 [P] [US3] Add unauthorized app-shell unit tests in `apps/web/tests/unit/app-auth-gate.test.ts`
- [X] T019 [P] [US3] Add Playwright unauthorized session coverage in `apps/web/e2e/auth-landing-gate.spec.ts`

### Implementation for User Story 3

- [X] T020 [US3] Add unauthorized-state rendering to `apps/web/src/features/session/components/LoginGate.tsx`
- [X] T021 [US3] Ensure unauthorized sign-out returns to the login gate in `apps/web/src/App.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap sync, and full validation.

- [X] T022 [P] Update `README.md` server environment and application usage notes for production session-gated command access
- [X] T023 [P] Update `docs/roadmap.md` with M57 Auth Landing Gate completion details
- [X] T024 Run focused validation from `specs/057-auth-landing-gate/quickstart.md`
- [X] T025 Run full quality gate: `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, `npm run build`, `git diff --check`
- [X] T026 Mark completed tasks in `specs/057-auth-landing-gate/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup completion; blocks all user stories.
- **User Story 1 (P1)**: Depends on foundational auth boundary.
- **User Story 2 (P2)**: Depends on User Story 1 app-shell gate.
- **User Story 3 (P3)**: Depends on User Story 1 app-shell gate.
- **Polish**: Depends on selected user stories being complete.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T007 and T008 can run in parallel.
- T013 and T014 can run in parallel.
- T018 and T019 can run in parallel.
- T022 and T023 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete setup and foundational production auth boundary.
2. Complete US1 so unauthenticated visitors see only the landing/login gate.
3. Validate US1 independently before expanding signed-in and unauthorized flows.

### Incremental Delivery

1. Shared production API protection.
2. Unauthenticated landing gate.
3. Authorized command shell.
4. Unauthorized corporation state.
5. Documentation, roadmap, and full quality gate.
