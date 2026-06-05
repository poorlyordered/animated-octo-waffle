# Feature Specification: M29 Retry Policy Controls

**Feature Branch**: `029-retry-policy-controls`
**Created**: 2026-06-05
**Status**: Draft
**Input**: User description: "Proceed with the next recommended feature: retry policy controls beyond the current one-active-scheduled-retry boundary."

## User Stories & Testing

### User Story 1 - Apply Visible Retry Timing Policy (Priority: P1)

As a commander reviewing scheduled retry work, I can choose a server-owned timing policy such as run when due, defer 1 hour, defer 6 hours, or defer 24 hours so retry timing is explicit and auditable.

**Why this priority**: Existing reschedule controls defer by a fixed browser choice. Policy options make the command boundary clearer without introducing worker execution.

**Independent Test**: From a scheduled worker handoff retry and a scheduled Numbers ESI sync retry, select a visible policy delay and confirm the retry remains scheduled with updated reason/not-before metadata.

### User Story 2 - Preserve Retry Execution Boundaries (Priority: P1)

As a commander, I can see that policy controls only update scheduled retry timing and never dispatch, claim, execute, fetch ESI, mutate EVE, or call external services.

**Independent Test**: Browser smoke tests assert the no-execution copy near policy controls and the existing schedule/cancel/reschedule responses remain safe.

## Requirements

- **FR-001**: Retry policy summaries MUST expose server-owned delay options.
- **FR-002**: Delay options MUST include an immediate option and bounded deferred options for 1 hour, 6 hours, and 24 hours.
- **FR-003**: Browser retry controls MUST render policy delay options only when `canReschedule` is true.
- **FR-004**: Selecting a delay option MUST reuse the existing reschedule command path and keep the retry record scheduled.
- **FR-005**: Selecting the immediate option MUST clear `notBefore`; selecting deferred options MUST set a future ISO timestamp.
- **FR-006**: Policy controls MUST remain browser-safe and MUST NOT accept or expose secrets, dispatch targets, execution flags, token material, wallet actions, asset actions, contract actions, role changes, or external mutations.
- **FR-007**: Browser copy MUST state that policy controls update scheduled retry timing only.

## Success Criteria

- **SC-001**: Scheduled worker handoff retries expose and apply all server-owned delay options.
- **SC-002**: Scheduled Numbers ESI sync retries expose and apply all server-owned delay options.
- **SC-003**: Contract and unit tests verify policy delay metadata on retry summaries.
- **SC-004**: Browser smoke tests verify delay controls and no-execution language.

## Out of Scope

- Changing retry worker claim or execution semantics.
- Multiple concurrent scheduled retries per target.
- Recurring retries, exponential backoff, or automatic policy escalation.
- Backend saved commander preferences.
- Opportunity or People retry surfaces.
- ESI fetches, EVE writes, wallet/asset/contract/role mutation, worker dispatch, retry execution, or external-service execution.
