# Tasks: Live EVE SSO

**Input**: Design documents from `/specs/009-live-eve-sso/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/eve-sso-live.md, quickstart.md

**Tests**: Required by FR-002, FR-003, FR-007, and success criteria SC-001 through SC-005.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish live adapter boundaries and server-only configuration.

- [x] T001 Add live EVE SSO adapter module in netlify/functions/_shared/eve-sso-live.ts
- [x] T002 Extend EVE SSO configuration helpers for live server-only settings in netlify/functions/_shared/eve-sso.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Token exchange, JWT validation, and identity lookup primitives required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Add unit tests for EVE JWT parsing, signature validation, issuer, audience, expiry, and subject handling in apps/web/tests/unit/eve-sso-live.test.ts
- [x] T004 [P] Add unit tests for token exchange and ESI identity lookup safe failure behavior in apps/web/tests/unit/eve-sso-live.test.ts
- [x] T005 Implement authorization-code token exchange in netlify/functions/_shared/eve-sso-live.ts
- [x] T006 Implement metadata/JWKS loading and RS256 JWT validation in netlify/functions/_shared/eve-sso-live.ts
- [x] T007 Implement character and corporation identity resolution in netlify/functions/_shared/eve-sso-live.ts

**Checkpoint**: Live validation primitives are testable without the browser or live EVE network.

---

## Phase 3: User Story 1 - Sign In With Verified EVE Identity (Priority: P1) MVP

**Goal**: Create command session scope only after live EVE identity validation succeeds.

**Independent Test**: Mock EVE SSO and ESI responses, invoke the callback with valid state/code, and verify the session cookie contains browser-safe command identity.

### Tests for User Story 1

- [x] T008 [P] [US1] Add callback contract test for successful live EVE SSO validation in apps/web/tests/contract/eve-sso-api.test.ts
- [x] T009 [P] [US1] Add callback contract tests rejecting invalid live token issuer, audience, expiry, signature, and subject cases in apps/web/tests/contract/eve-sso-api.test.ts

### Implementation for User Story 1

- [x] T010 [US1] Wire live adapter into callback after state validation in netlify/functions/eve-sso-callback.ts
- [x] T011 [US1] Preserve redirect and transient state cleanup behavior for successful live callbacks in netlify/functions/eve-sso-callback.ts

**Checkpoint**: User Story 1 is independently functional through mocked live SSO/ESI responses.

---

## Phase 4: User Story 2 - Keep EVE Credentials Server-Side (Priority: P2)

**Goal**: Ensure client secrets, token material, and raw JWT claims never leave server-only callback processing.

**Independent Test**: Complete live and failing callback flows with sensitive fixture values and verify responses/session payloads do not contain them.

### Tests for User Story 2

- [x] T012 [P] [US2] Add contract tests proving live callback responses and session cookies exclude access tokens, refresh tokens, client secrets, and raw JWT claims in apps/web/tests/contract/eve-sso-api.test.ts
- [x] T013 [P] [US2] Add contract tests for safe errors when live SSO configuration or provider responses fail in apps/web/tests/contract/eve-sso-api.test.ts

### Implementation for User Story 2

- [x] T014 [US2] Add safe live callback error handling that clears SSO state without exposing secret or token details in netlify/functions/eve-sso-callback.ts
- [x] T015 [US2] Ensure live adapter returns only normalized identity to callback callers in netlify/functions/_shared/eve-sso-live.ts

**Checkpoint**: User Stories 1 and 2 keep all EVE credential material server-side.

---

## Phase 5: User Story 3 - Preserve Deterministic Local Auth Fixtures (Priority: P3)

**Goal**: Keep the existing deterministic local callback path for fast validation without live credentials.

**Independent Test**: Configure deterministic identity and verify callback creates the same command session shape without mocked EVE network calls.

### Tests for User Story 3

- [x] T016 [P] [US3] Update deterministic callback contract tests to prove live adapter is not required when fixture identity is configured in apps/web/tests/contract/eve-sso-api.test.ts
- [x] T017 [P] [US3] Run existing browser session-scope smoke coverage with deterministic fixture behavior in apps/web/e2e/session-scope.spec.ts

### Implementation for User Story 3

- [x] T018 [US3] Keep deterministic identity precedence in netlify/functions/eve-sso-callback.ts
- [x] T019 [US3] Update quickstart deterministic and live setup notes in specs/009-live-eve-sso/quickstart.md

**Checkpoint**: Local auth fixtures still support contract and browser validation without live EVE credentials.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap update, and full quality gate.

- [x] T020 [P] Update README EVE SSO environment notes for live adapter and deterministic fixture behavior in README.md
- [x] T021 [P] Update roadmap with M9 delivered capabilities and next-slice candidates in docs/roadmap.md
- [x] T022 Run npm run lint and record result in specs/009-live-eve-sso/quickstart.md
- [x] T023 Run npm run typecheck and record result in specs/009-live-eve-sso/quickstart.md
- [x] T024 Run npm test and record result in specs/009-live-eve-sso/quickstart.md
- [x] T025 Run npm run test:e2e and record result in specs/009-live-eve-sso/quickstart.md
- [x] T026 Run npm run build and record result in specs/009-live-eve-sso/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 callback wiring.
- **User Story 3 (Phase 5)**: Depends on US1 callback wiring and protects existing deterministic behavior.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; delivers the MVP live validation path.
- **User Story 2 (P2)**: Starts after US1; adds explicit credential non-exposure coverage.
- **User Story 3 (P3)**: Starts after US1; confirms deterministic local behavior remains intact.

### Parallel Opportunities

- T003 and T004 can run in parallel in the same test file before implementation.
- T008 and T009 can be prepared in parallel once helper fixtures exist.
- T012 and T013 can run in parallel for credential-boundary coverage.
- T016 and T017 can run in parallel for deterministic validation coverage.
- T020 and T021 can be updated in parallel after implementation behavior is stable.

---

## Parallel Example: Foundational

```bash
Task: "Add unit tests for EVE JWT parsing, signature validation, issuer, audience, expiry, and subject handling in apps/web/tests/unit/eve-sso-live.test.ts"
Task: "Add unit tests for token exchange and ESI identity lookup safe failure behavior in apps/web/tests/unit/eve-sso-live.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 live adapter boundaries.
2. Complete Phase 2 token exchange, JWT validation, and identity lookup primitives.
3. Complete Phase 3 callback integration and contract tests.
4. Validate US1 before adding credential-boundary and deterministic-regression coverage.

### Incremental Delivery

1. Add live adapter tests and server-only implementation.
2. Wire callback to deterministic-first then live validation behavior.
3. Add explicit credential non-exposure tests.
4. Confirm deterministic local path remains stable.
5. Run the complete validation gate from quickstart.md.

### Notes

- [P] tasks target different work streams or can be prepared independently.
- M9 must not persist refresh tokens, call long-running workers, or mutate EVE/player state.
- Browser-visible session scope must remain compatible with existing M6 contracts.
