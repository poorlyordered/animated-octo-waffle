# Tasks: Browser Workflow Smoke Tests

**Input**: Design documents from `/specs/005-browser-workflow-smoke/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/browser-smoke.md, quickstart.md

**Tests**: Browser smoke tests are the feature. Keep Jest contract/unit tests in Node and add a separate real-browser smoke command.

**Organization**: Tasks are grouped by user story so each validation capability can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add browser smoke test infrastructure without changing app behavior.

- [x] T001 Add browser automation dependency and lockfile updates in package.json and package-lock.json
- [x] T002 Create root browser runner configuration in playwright.config.ts
- [x] T003 [P] Create browser smoke test directory and fixture directory in apps/web/e2e and apps/web/e2e/fixtures
- [x] T004 Add test:e2e and test:e2e:ui scripts in package.json while preserving npm test as Jest Node validation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared fixtures, diagnostics, and request interception required before any surface scenario can run.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create deterministic command surface fixture module in apps/web/e2e/fixtures/command-surfaces.ts
- [x] T006 Implement API route interception helpers for /api/command-brief, /api/research-status, /api/decision-records, /api/automation-queue, and /api/people in apps/web/e2e/fixtures/api-fixtures.ts
- [x] T007 Implement shared browser diagnostics for console errors, page errors, and failed requests in apps/web/e2e/support/diagnostics.ts
- [x] T008 Create shared surface assertion helpers for headings, landmarks, forbidden text, and nonblank rendering in apps/web/e2e/support/surface-assertions.ts

**Checkpoint**: Foundation ready - user story scenarios can now be implemented.

---

## Phase 3: User Story 1 - Validate Command Surfaces Render (Priority: P1) MVP

**Goal**: Browser smoke validation confirms all four command operating surfaces render with deterministic data.

**Independent Test**: Run the browser smoke command and verify command brief, decision records, automation queue, and people scenarios pass with expected headings and primary sections.

### Tests for User Story 1

- [x] T009 [US1] Add command surface render smoke scenarios in apps/web/e2e/command-surfaces.spec.ts

### Implementation for User Story 1

- [x] T010 [US1] Assert command brief heading, status, recommendations, and operating leg coverage in apps/web/e2e/command-surfaces.spec.ts
- [x] T011 [US1] Assert decision record heading, list item, and detail status in apps/web/e2e/command-surfaces.spec.ts
- [x] T012 [US1] Assert automation queue heading, queue item, and detail status in apps/web/e2e/command-surfaces.spec.ts
- [x] T013 [US1] Assert people heading, member profile, and leadership follow-up content in apps/web/e2e/command-surfaces.spec.ts

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Validate Core Command Boundaries (Priority: P2)

**Goal**: Browser smoke validation catches UI regressions that imply execution or omit approval boundaries.

**Independent Test**: Run the browser smoke command and verify player-impacting approval messaging plus no-execution language on queue and people surfaces.

### Tests for User Story 2

- [x] T014 [US2] Add command boundary smoke scenarios in apps/web/e2e/command-boundaries.spec.ts

### Implementation for User Story 2

- [x] T015 [US2] Assert player-impacting decision approval boundary is visible in apps/web/e2e/command-boundaries.spec.ts
- [x] T016 [US2] Assert automation queue surfaces do not show dispatch or external-service success language in apps/web/e2e/command-boundaries.spec.ts
- [x] T017 [US2] Assert people follow-up surfaces do not show role, access, queue status, or EVE mutation success language in apps/web/e2e/command-boundaries.spec.ts
- [x] T018 [US2] Add forbidden execution language list to apps/web/e2e/support/surface-assertions.ts

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Keep Fast Node Validation Separate (Priority: P3)

**Goal**: Developers can run fast Jest tests and browser smoke tests independently with clear setup and output.

**Independent Test**: Run npm test and npm run test:e2e separately; npm test does not require a browser, and npm run test:e2e runs only browser smoke tests.

### Tests for User Story 3

- [x] T019 [US3] Add package script contract checks in apps/web/tests/unit/test-runner-contract.test.ts

### Implementation for User Story 3

- [x] T020 [US3] Verify npm test remains Jest Node validation without browser or DOM emulator dependencies in package.json and jest.config.cjs
- [x] T021 [US3] Document browser dependency setup and separate commands in README.md
- [x] T022 [US3] Update specs/005-browser-workflow-smoke/quickstart.md with final command names and setup notes

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and Spec Kit closure.

- [x] T023 [P] Update docs/roadmap.md with M5 status and validation notes
- [x] T024 [P] Add validation results in specs/005-browser-workflow-smoke/validation.md
- [x] T025 Run npm run lint and record result in specs/005-browser-workflow-smoke/validation.md
- [x] T026 Run npm run typecheck and record result in specs/005-browser-workflow-smoke/validation.md
- [x] T027 Run npm test and record result in specs/005-browser-workflow-smoke/validation.md
- [x] T028 Run npm run test:e2e and record result in specs/005-browser-workflow-smoke/validation.md
- [x] T029 Run npm run build and record result in specs/005-browser-workflow-smoke/validation.md
- [x] T030 Review implementation against constitution gates in specs/005-browser-workflow-smoke/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story 1 (Phase 3): depends on Foundational completion and is the MVP.
- User Story 2 (Phase 4): depends on Foundational completion and may run after US1 or independently with shared helpers.
- User Story 3 (Phase 5): depends on Setup and validates test-runner separation.
- Polish (Phase 6): depends on all desired stories being complete.

### User Story Dependencies

- US1 Validate Command Surfaces Render: first delivery target.
- US2 Validate Core Command Boundaries: can run after shared fixture/assertion helpers exist.
- US3 Keep Fast Node Validation Separate: can run after package scripts and browser command exist.

### Parallel Opportunities

- T003 can run in parallel with T002.
- T005, T006, T007, and T008 can run in parallel once directories exist.
- T010, T011, T012, and T013 can be implemented in parallel within the same spec file only after T009 establishes the file.
- T015, T016, T017, and T018 can be implemented together after T014.
- T023 and T024 can run in parallel during polish.

## Parallel Example: User Story 1

```bash
Task: "T010 Assert command brief heading, status, recommendations, and operating leg coverage"
Task: "T011 Assert decision record heading, list item, and detail status"
Task: "T012 Assert automation queue heading, queue item, and detail status"
Task: "T013 Assert people heading, member profile, and leadership follow-up content"
```

## Parallel Example: User Story 2

```bash
Task: "T015 Assert player-impacting decision approval boundary is visible"
Task: "T016 Assert automation queue surfaces do not show dispatch or external-service success language"
Task: "T017 Assert people follow-up surfaces do not show role, access, queue status, or EVE mutation success language"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate all four command surfaces render in a real browser.
4. Stop for review if browser dependency setup is blocked locally.

### Incremental Delivery

1. US1 delivers route-level browser confidence.
2. US2 adds command authority and no-execution boundary checks.
3. US3 keeps Jest and browser validation cleanly separated.
4. Polish records validation and updates roadmap/docs.
