# Feature Specification: Manual Refresh Console

**Feature Branch**: `061-manual-refresh-console`

**Created**: 2026-07-03

**Status**: Implemented

**Input**: User description: "Design a more manual method with better user feedback for data extraction/retrieval and evaluation. The command board currently shows generic processing states in many boxes. Build a manual refresh console that prepares data pulls and Brain evaluation runs, explains processing/blocking/failure/stale states, and keeps Spec Kit quality gates including code-review-and-quality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prepare A Refresh With Readiness Feedback (Priority: P1)

As an authorized commander, I can open a Refresh Console, see whether the corporation is ready for data retrieval and evaluation, choose a refresh mode and domains, and create a durable refresh run only when prerequisites and no-execution boundaries are clear.

**Why this priority**: The current board shows processing states without enough explanation. The MVP must let the commander intentionally prepare a run and understand blockers before creating more queued work.

**Independent Test**: With deterministic fixtures, show a readiness checklist, select domains and a refresh mode, create a refresh run, and verify the response records the chosen mode, domains, requested-by context, and browser-safe boundary text.

**Acceptance Scenarios**:

1. **Given** an authorized signed commander session and all required configuration is available, **When** the commander opens the Refresh Console, **Then** the system shows a readiness checklist with ready items for session, corporation authorization, data access, worker callback configuration, model provider configuration, and storage access.
2. **Given** one or more prerequisites are missing or blocked, **When** the commander opens the Refresh Console, **Then** the system explains each blocker and does not imply that opening the page executed a pull, worker dispatch, or evaluation.
3. **Given** the commander selects a refresh mode and at least one domain, **When** the commander creates a refresh run, **Then** a durable run is created with mode, domains, requested-by metadata, timestamps, and no-execution boundary language.

---

### User Story 2 - Inspect Run Timeline And Events (Priority: P2)

As a commander, I can inspect a refresh run detail view that explains each step, current owner, timestamps, blockers, failures, outputs, and historical events so I know why a run is waiting, processing, blocked, or complete.

**Why this priority**: Manual run creation is only useful if the commander can see where the pipeline is and what produced or blocked command data.

**Independent Test**: Load a run with queued, claimed, failed, skipped, and completed steps. Verify the timeline uses specific user-facing labels, displays safe event history, and links produced command artifacts without exposing secrets or raw payloads.

**Acceptance Scenarios**:

1. **Given** a refresh run exists with domain steps, **When** the commander opens run detail, **Then** the system shows a timeline with step-specific states such as waiting for worker, pulling source data, normalizing, evaluating, ready for review, failed, blocked, skipped, and completed.
2. **Given** a worker has claimed or completed a step, **When** the run detail is shown, **Then** the system shows worker identity, timestamps, result summaries, failure summaries, and linked artifacts when available.
3. **Given** events exist for a run, **When** the commander inspects the event log, **Then** the system shows commander actions, worker claims, completions, failures, retries, skipped steps, evaluation outcomes, and linked artifacts in chronological order.

---

### User Story 3 - Retry Or Skip Failed Work Safely (Priority: P3)

As a commander, I can create safe retry intent for failed or blocked refresh steps and understand when a step can be skipped, without dispatching workers or executing external services from the browser.

**Why this priority**: Processing states become actionable only when recovery options are visible and still preserve human authority and automation boundaries.

**Independent Test**: Given a failed step, use the console to schedule retry intent and verify a browser-safe event is recorded while no worker is dispatched and no external system is mutated.

**Acceptance Scenarios**:

1. **Given** a refresh step is failed or blocked and retry is eligible, **When** the commander requests a retry, **Then** the system records retry intent and an event without claiming work, dispatching a worker, fetching ESI, calling the model provider, or mutating EVE.
2. **Given** a refresh step is not eligible for retry, **When** the commander views the run detail, **Then** the system explains why retry is unavailable.
3. **Given** a step can be skipped without invalidating the run, **When** the commander requests skip, **Then** the system records a skip decision and explains which outputs will remain missing.

---

### User Story 4 - Explain Board Processing States (Priority: P4)

As a commander scanning the command board, I can see actionable labels instead of generic processing and jump to the relevant refresh run detail when a board state depends on a refresh run.

**Why this priority**: The board should remain a summary surface, but it must not hide the reason behind stale, failed, blocked, or active data states.

**Independent Test**: Render command board fixtures with active, failed, stale, and blocked refresh-derived states. Verify labels are specific and status pills link to the relevant run detail.

**Acceptance Scenarios**:

1. **Given** a command surface is using older data while a newer run is active, **When** the board renders, **Then** it shows "Using stale data while refresh runs" or equivalent specific language.
2. **Given** a command surface depends on a blocked prerequisite, **When** the board renders, **Then** it shows the blocker label such as "ESI authorization required" or "Worker configuration missing".
3. **Given** a status is derived from a refresh run, **When** the commander follows the status link, **Then** the relevant run detail opens without starting a new pull or evaluation.

### Operating Model Alignment

- **Numbers**: Refresh domains include Numbers data access, ESI sync readiness, snapshots, section health, and measurable output state.
- **Opportunity**: Refresh domains include Opportunity ingestion/readiness, command brief context, strategic impacts, watchlists, and research provenance.
- **People**: Refresh domains include People ingestion/readiness, member profiles, roles, activity, delegation, and follow-up context.
- **Decision Boundary**: The console presents observations, readiness, blockers, retry intent, skip decisions, and draft operational next steps. It does not execute player-impacting actions.
- **Automation Boundary**: Browser actions create durable records, retry intent, or skip decisions only. Worker collection, ESI fetches, Brain evaluation, and external service calls remain worker/server-owned and auditable.

### Edge Cases

- Readiness cannot be computed because storage, configuration, or authorization checks fail.
- The commander is signed in but the corporation is not authorized for command data.
- ESI vault consent is missing, revoked, stale, or lacks required scopes for a selected domain.
- OpenRouter or Brain worker configuration is missing for evaluation mode.
- A run already exists for the same active domain/mode selection.
- A run has only partial domain readiness and the commander chooses to evaluate existing data anyway.
- A worker claims a step while the commander is viewing the timeline.
- A failed step has an existing scheduled retry.
- A step is skipped and downstream evaluation must mark resulting data as missing.
- A board status references a run that was deleted, hidden by scope, or no longer active.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Refresh Console only to authorized signed commander sessions.
- **FR-002**: System MUST expose a browser-safe readiness checklist for refresh preparation.
- **FR-003**: System MUST show readiness status, blocker reason, required commander action, and no-execution boundary text for each checklist item.
- **FR-004**: System MUST let commanders select a refresh mode from evaluate existing data, prepare fresh source pulls, and full refresh.
- **FR-005**: System MUST let commanders select one or more refresh domains from Numbers, Opportunity, and People, while refresh modes explain whether ESI source preparation and Brain evaluation readiness are included.
- **FR-006**: System MUST create durable refresh runs with selected mode, domains, requested-by metadata, status, timestamps, and safe boundaries.
- **FR-007**: System MUST prevent duplicate active refresh runs for the same corporation, mode, and effective domain set.
- **FR-008**: System MUST provide a run detail timeline with domain steps, step-specific user-facing labels, worker ownership, timestamps, blocker/failure summaries, and linked artifacts.
- **FR-009**: System MUST provide a run event log with safe events for commander actions, worker claims, completions, failures, retries, skips, evaluation outcomes, and artifact links.
- **FR-010**: System MUST provide retry intent controls only for failed or blocked steps that are eligible for retry.
- **FR-011**: System MUST provide skip controls only where skipping preserves a valid partial run and clearly identifies missing outputs.
- **FR-012**: System MUST update command-board status labels so active, stale, failed, blocked, and missing data states are specific and actionable.
- **FR-013**: System MUST link board status labels to relevant refresh run details when a run is the source of the status.
- **FR-014**: System MUST reject or omit token material, raw ESI payloads, raw provider payloads, dispatch handles, browser-selected corporation scope, worker secrets, EVE write intents, wallet/asset/contract mutation fields, role/access/standing mutations, deploy/rollback intents, and external-service mutation fields.
- **FR-015**: System MUST NOT fetch ESI, call OpenRouter, dispatch workers, execute retries, mutate EVE, mutate player/corporation state, or mutate external services from browser request paths.
- **FR-016**: System MUST provide deterministic contract, unit, and browser tests for readiness, run creation, timeline rendering, event logging, retry/skip eligibility, board labels, scope isolation, and no-execution boundaries.

### Key Entities *(include if feature involves data)*

- **Refresh Readiness Checklist**: Browser-safe readiness result for the current corporation, including item status, blocker reason, required action, safe details, and boundary text.
- **Refresh Mode**: Commander-selected intent for evaluating existing data, preparing fresh source pulls, or running a full refresh.
- **Refresh Run**: Durable command artifact representing selected Numbers/Opportunity/People domains, mode, requester, lifecycle status, timestamps, step summaries, warnings, blockers, and linked outputs.
- **Refresh Step Timeline Item**: User-facing status for a domain or evaluation step, including safe label, worker ownership, timestamps, result summary, failure/blocker summary, retry/skip eligibility, and linked artifacts.
- **Refresh Run Event**: Durable event describing commander actions, worker transitions, retry/skip intent, evaluation outcomes, and artifact links without secrets or raw payloads.
- **Board Status Explanation**: Browser-safe summary that maps command-board processing/stale/failed/blocked states to actionable labels and optional run-detail links.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authorized commander can prepare a refresh run from the console in under 30 seconds using deterministic fixtures.
- **SC-002**: 100% of readiness checklist blockers include a clear reason and a safe next action.
- **SC-003**: 100% of refresh timeline steps render a specific state label instead of generic processing.
- **SC-004**: 100% of retry or skip controls record durable intent only and do not dispatch workers, fetch ESI, call model providers, write to EVE, or mutate external services.
- **SC-005**: Board surfaces that derive active/stale/failed/blocked state from a refresh run show a specific label and a link to the relevant run detail.
- **SC-006**: Automated tests cover readiness, run creation, duplicate active runs, timeline events, retry/skip eligibility, board labels, authorization, unsafe material rejection, and no-execution boundaries without live ESI or provider calls.

## Assumptions

- Existing EVE SSO signed-session authorization remains the commander access boundary.
- MongoDB remains the durable store for refresh runs, events, command data, and derived artifacts.
- Existing Intelligence Refresh Run and worker callback architecture remains the base for run lifecycle behavior.
- Refresh Console v1 may use browser polling or manual refresh after actions; push-style live updates are deferred.
- Dev/admin manual advance controls are out of MVP scope unless separately gated and specified.
- Existing command-board surfaces remain summary-first and do not become the execution surface for refresh work.
