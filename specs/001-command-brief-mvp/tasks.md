# Tasks: Command Brief MVP

**Input**: Design documents from `/specs/001-command-brief-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/command-brief-api.md, quickstart.md

**Tests**: Include contract, unit, and component tests because the feature specification defines independent tests for every user story and the constitution requires verifiable data boundaries.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling for the greenfield app.

- [ ] T001 Create app and package directory structure in apps/web/src, apps/web/tests, netlify/functions, and packages/contracts
- [ ] T002 Initialize TypeScript web application package configuration in package.json and apps/web/package.json
- [ ] T003 [P] Configure TypeScript project references in tsconfig.json, apps/web/tsconfig.json, and packages/contracts/tsconfig.json
- [ ] T004 [P] Configure test runner and DOM/component test setup in apps/web/vitest.config.ts and apps/web/tests/setup.ts
- [ ] T005 [P] Configure linting and formatting scripts in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, server adapters, and command brief skeleton required before user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Define shared command brief, research request, source reference, coverage, and response types in packages/contracts/src/command-brief.ts
- [ ] T007 Define validation schemas for command brief API responses in packages/contracts/src/command-brief.schema.ts
- [ ] T008 Implement server-side environment validation for MongoDB and database names in netlify/functions/_shared/env.ts
- [ ] T009 Implement MongoDB connection helper with server-only credentials in netlify/functions/_shared/mongo.ts
- [ ] T010 Implement authenticated corporation scope helper interface in netlify/functions/_shared/auth-scope.ts
- [ ] T011 Implement safe error response helper in netlify/functions/_shared/http.ts
- [ ] T012 Create command brief feature shell files in apps/web/src/features/command-brief/
- [ ] T013 Add route placeholder for command brief screen in apps/web/src/routes/CommandBriefRoute.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Current Command Brief (Priority: P1) MVP

**Goal**: Commander can see the latest processed command brief with summary, recommendations, watchlist, memory, and metadata.

**Independent Test**: Seed one processed brief; load the command brief screen; verify the complete brief and metadata render without initiating research processing.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add contract test for GET /api/command-brief metadata, source references, success, and empty responses in apps/web/tests/contract/command-brief-api.test.ts
- [ ] T015 [P] [US1] Add unit tests for command brief document normalization in apps/web/tests/unit/command-brief-normalizer.test.ts
- [ ] T016 [P] [US1] Add component test for processed command brief rendering in apps/web/tests/component/CommandBriefProcessed.test.tsx

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement command brief document normalizer in netlify/functions/_shared/command-brief-normalizer.ts
- [ ] T018 [US1] Implement GET command brief Netlify function in netlify/functions/command-brief.ts
- [ ] T019 [US1] Implement command brief client service in apps/web/src/features/command-brief/services/commandBriefClient.ts
- [ ] T020 [US1] Implement command brief state hook in apps/web/src/features/command-brief/state/useCommandBrief.ts
- [ ] T021 [US1] Implement processed brief UI component in apps/web/src/features/command-brief/components/CommandBriefPanel.tsx
- [ ] T022 [US1] Wire command brief route to load and render processed brief data in apps/web/src/routes/CommandBriefRoute.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Understand Research Status (Priority: P2)

**Goal**: Commander can see whether research is queued, processing, processed, or failed.

**Independent Test**: Seed request records for each status value; load the command brief screen; verify state, timestamp, and error handling match the request state.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add contract test for GET /api/research-status states in apps/web/tests/contract/research-status-api.test.ts
- [ ] T024 [P] [US2] Add unit tests for display state derivation in apps/web/tests/unit/command-brief-display-state.test.ts
- [ ] T025 [P] [US2] Add component tests for processing and failed states in apps/web/tests/component/CommandBriefStatus.test.tsx

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement research request normalizer in netlify/functions/_shared/research-request-normalizer.ts
- [ ] T027 [US2] Implement GET research status Netlify function in netlify/functions/research-status.ts
- [ ] T028 [US2] Implement display state derivation in apps/web/src/features/command-brief/services/displayState.ts
- [ ] T029 [US2] Extend command brief client service to load research status in apps/web/src/features/command-brief/services/commandBriefClient.ts
- [ ] T030 [US2] Extend command brief UI with processing, failed, and stale states in apps/web/src/features/command-brief/components/CommandBriefPanel.tsx

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - See Missing Operating Data (Priority: P3)

**Goal**: Commander can tell which numbers, opportunity, and people data legs are present, missing, or stale.

**Independent Test**: Seed briefs with complete and incomplete operating-leg coverage; load the command brief; verify missing data is visible separately from recommendations.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add unit tests for operating leg coverage derivation in apps/web/tests/unit/operating-leg-coverage.test.ts
- [ ] T032 [P] [US3] Add component tests for complete and incomplete coverage displays in apps/web/tests/component/OperatingLegCoverage.test.tsx

### Implementation for User Story 3

- [ ] T033 [P] [US3] Implement operating leg coverage derivation in apps/web/src/features/command-brief/services/coverage.ts
- [ ] T034 [US3] Apply coverage derivation in command brief normalizer in netlify/functions/_shared/command-brief-normalizer.ts
- [ ] T035 [US3] Implement coverage display component in apps/web/src/features/command-brief/components/OperatingLegCoverage.tsx
- [ ] T036 [US3] Integrate coverage display into command brief recommendations in apps/web/src/features/command-brief/components/CommandBriefPanel.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and operational hardening.

- [ ] T037 [P] Add local fixture data for processed, processing, failed, stale, and empty states in apps/web/tests/fixtures/commandBrief.ts
- [ ] T038 [P] Add README setup notes for required environment variables in README.md
- [ ] T039 Validate quickstart flow from specs/001-command-brief-mvp/quickstart.md
- [ ] T040 Run full validation suite and record results in specs/001-command-brief-mvp/validation.md
- [ ] T041 Review implementation against constitution gates in specs/001-command-brief-mvp/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story 1 (Phase 3): depends on Foundational completion.
- User Story 2 (Phase 4): depends on Foundational completion; can be implemented after or alongside US1, but integrated display benefits from US1.
- User Story 3 (Phase 5): depends on Foundational completion; can be implemented after US1 data shape exists.
- Polish (Phase 6): depends on selected user stories being complete.

### User Story Dependencies

- US1 View Current Command Brief: MVP and first delivery target.
- US2 Understand Research Status: independently testable but composes with US1 for stale states.
- US3 See Missing Operating Data: independently testable but must integrate with US1 recommendation rendering.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel after T002.
- T008, T009, T010, T011, T012, and T013 can run in parallel after T006 and T007.
- T014, T015, and T016 can run in parallel.
- T023, T024, and T025 can run in parallel.
- T031 and T032 can run in parallel.
- T037 and T038 can run in parallel.

## Parallel Example: User Story 1

```bash
# Contract, unit, and component tests can be written together:
Task: "T014 Add contract test for GET /api/command-brief success and empty responses"
Task: "T015 Add unit tests for command brief document normalization"
Task: "T016 Add component test for processed command brief rendering"

# Then implementation can proceed through normalizer, endpoint, client state, and UI.
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate that the commander can see the latest processed brief without running research.
4. Stop for review before expanding to status and coverage if needed.

### Incremental Delivery

1. US1 delivers readable processed briefs.
2. US2 adds operational trust through request status and failure visibility.
3. US3 adds constitutional grounding through numbers/opportunity/people coverage.
4. Polish validates the quickstart and records evidence.
