# Feature Specification: Browser Workflow Smoke Tests

**Feature Branch**: `005-browser-workflow-smoke`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Add browser workflow smoke tests for the command operating surfaces so the app validates command brief, decision records, automation queue, and people screens in a real browser without jsdom."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Command Surfaces Render (Priority: P1)

A developer can run a browser smoke validation that opens the local Gryyk-47 app and confirms the command brief, decision records, automation queue, and people operating layer render as usable command surfaces.

**Why this priority**: M1-M4 are now merged, and the default Jest suite intentionally avoids a DOM emulator. A real-browser smoke check closes the highest-risk validation gap without slowing unit and contract tests.

**Independent Test**: Start the local app with deterministic test data, run the browser smoke command, and verify each command surface is visible with expected headings and primary sections.

**Acceptance Scenarios**:

1. **Given** the local app is running with deterministic test responses, **When** the browser smoke command runs, **Then** it confirms the command brief, decisions, automation queue, and people surfaces render without blank states or runtime errors.
2. **Given** one command surface fails to render, **When** the browser smoke command runs, **Then** it fails with the surface name and enough diagnostic context to reproduce locally.

---

### User Story 2 - Validate Core Command Boundaries (Priority: P2)

A developer can verify that visible browser workflows preserve command authority boundaries: decision approval text is required for player-impacting decisions, queue records remain queued work, and people follow-ups do not claim to mutate roles, access, queue status, or EVE state.

**Why this priority**: These boundaries are constitutional requirements. Browser validation should catch regressions where UI copy or forms imply execution instead of observation, draft orders, or auditable records.

**Independent Test**: Run browser checks against seeded player-impacting and non-player-impacting states, then verify approval and non-execution boundary messages are visible.

**Acceptance Scenarios**:

1. **Given** a player-impacting decision or follow-up form is visible, **When** the browser smoke check inspects it, **Then** explicit approval messaging or inputs are present before any player-impacting progression can be submitted.
2. **Given** automation queue and people follow-up surfaces are visible, **When** the browser smoke check inspects them, **Then** the page presents records and queued work without external-service, role/access, or EVE action success language.

---

### User Story 3 - Keep Fast Node Validation Separate (Priority: P3)

A developer can run fast Jest contract/unit validation independently from browser smoke validation, so local development remains quick while browser coverage is available when validating user-facing flows.

**Why this priority**: M4 moved default tests away from jsdom because browser-emulated component tests were too slow. This feature must keep that improvement and add browser coverage as a separate command.

**Independent Test**: Run the fast test command and browser smoke command separately; each completes with a clear purpose and no hidden dependency on jsdom.

**Acceptance Scenarios**:

1. **Given** a developer runs the default test command, **When** tests execute, **Then** only Node-safe contract/unit tests run and no DOM emulator is required.
2. **Given** a developer runs the browser smoke command, **When** tests execute, **Then** a real browser validates the command surfaces and reports browser-focused diagnostics.

---

### Operating Model Alignment

- **Numbers**: Validates that the command brief and future numbers surfaces can render measurable operational data without blank-state regressions.
- **Opportunity**: Validates that command brief recommendations and decision records remain inspectable as opportunity/decision surfaces.
- **People**: Validates that the people operating layer renders member and follow-up context while preserving role/access boundaries.
- **Decision Boundary**: Observation and validation only; no recommendation, draft order, approval, or executed action is created by the smoke tests.
- **Automation Boundary**: Safe automatic validation only. Tests may create isolated local test records if needed, but they MUST NOT touch live EVE, external services, or production MongoDB data.

### Edge Cases

- If the local app server is not running, the browser smoke command must fail quickly with startup instructions.
- If deterministic test data is missing, the browser smoke command must fail with the missing fixture or mocked endpoint name.
- If a route renders but has a client-side runtime error, the command must fail and report the browser console error.
- If a form or workflow would require live server secrets, the smoke test must use local fixtures or mocks rather than production credentials.
- If the browser engine is not installed locally, the command must explain the setup step rather than silently skipping tests.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated browser smoke validation command separate from the default Node contract/unit test command.
- **FR-002**: Browser smoke validation MUST run in a real browser context and MUST NOT rely on jsdom or other DOM emulators.
- **FR-003**: Browser smoke validation MUST cover the command brief, decision records, automation queue, and people operating layer surfaces.
- **FR-004**: Browser smoke validation MUST use deterministic local data through fixtures, mocks, or isolated local services.
- **FR-005**: Browser smoke validation MUST fail on blank command surfaces, missing primary headings, missing primary sections, client-side runtime errors, or failed local API calls.
- **FR-006**: Browser smoke validation MUST verify that automation queue and people follow-up surfaces do not present queue dispatch, role/access mutation, EVE action, or external-service success language.
- **FR-007**: Browser smoke validation MUST verify that player-impacting decision or follow-up workflows visibly require explicit approval before progression.
- **FR-008**: The default test command MUST continue to run Node-safe Jest contract/unit tests without requiring a browser or DOM emulator.
- **FR-009**: Browser smoke validation results MUST be documented in the feature validation artifact with command output, pass/fail status, and any known local setup constraints.
- **FR-010**: The implementation MUST keep server secrets server-side and MUST NOT require live MongoDB or EVE credentials for browser smoke validation.

### Key Entities *(include if feature involves data)*

- **Browser Smoke Scenario**: A named real-browser validation flow for one command surface, including expected visible landmarks, fixture inputs, and failure diagnostics.
- **Command Surface Fixture**: Deterministic local data representing command brief, decision record, automation queue, or people state for browser validation.
- **Validation Result**: Recorded command, timestamp, pass/fail outcome, and known limitations for the smoke suite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can run the default Node test command and browser smoke command independently.
- **SC-002**: Browser smoke validation covers all four existing command surfaces: command brief, decision records, automation queue, and people.
- **SC-003**: Browser smoke validation completes locally in under two minutes on a normal development machine after browser dependencies are installed.
- **SC-004**: A deliberate missing heading, blank route, or client-side runtime error causes the browser smoke command to fail.
- **SC-005**: The browser smoke suite requires no production MongoDB, EVE, or external-service credentials.

## Assumptions

- The browser smoke runner can use local fixtures or request interception instead of live MongoDB-backed function calls.
- The existing React app can be served locally for browser validation without deploying to Netlify.
- Browser workflow tests are smoke coverage, not exhaustive component or visual regression tests.
- Live MongoDB quickstart checks remain separate from browser smoke validation.
- Future CI can install browser dependencies or run the browser smoke command in a separate job.
