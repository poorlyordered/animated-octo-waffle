# Feature Specification: Intelligence Refresh Runs

**Feature Branch**: `059-intelligence-refresh-runs`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Follow the Spec Kit driven development plan for M59. Build Intelligence Refresh Runs: commander-approved refresh orchestration that creates durable refresh run records, prepares eligible Numbers/People/Opportunity data pull requests, lets trusted workers complete data collection outside request paths, triggers Brain evaluation after completed or partial data refresh, stores the resulting command brief with provenance, and exposes browser-safe run status, partial failures, retry state, and final evaluation. Keep EVE writes, worker dispatch, token material, and player-impacting actions out of browser/request paths."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start An Auditable Refresh Run (Priority: P1)

As an authenticated commander, I can create an intelligence refresh run that records the requested operating domains, current commander identity, source scope, and no-execution boundaries before any data pull or evaluation work happens.

**Why this priority**: Gryyk-47 currently has separate preparation and worker paths, but no durable command-level run object that explains what was requested, what is pending, and what will happen next.

**Independent Test**: Create a refresh run for Numbers, Opportunity, and People with a signed command session. The run is persisted with queued domain steps, no command data is pulled in the browser request, and the response contains only browser-safe run metadata.

**Acceptance Scenarios**:

1. **Given** an authenticated commander with an authorized corporation session, **When** they request a refresh run for one or more supported domains, **Then** the system creates a durable refresh run in queued status with requested domain steps and safe provenance metadata.
2. **Given** a refresh run request contains unsupported domains, execution flags, raw tokens, dispatch targets, EVE write intents, or player-impacting mutation fields, **When** the request is submitted, **Then** the system rejects or ignores unsafe fields and records no external action.
3. **Given** an active queued or running refresh run already exists for the same corporation and requested domain set, **When** the commander requests the same refresh again, **Then** the system returns the existing active run or a duplicate-safe explanation instead of creating duplicate work.

---

### User Story 2 - Coordinate Worker-Owned Data Collection (Priority: P2)

As a trusted worker, I can claim a refresh run step, link it to the appropriate existing data-pull request lifecycle, and report completed, failed, or skipped data collection without exposing token material or raw source payloads.

**Why this priority**: A refresh run is only useful if it ties the existing ESI, People ingestion, and Opportunity ingestion lifecycles into one command-level status while preserving worker-only execution boundaries.

**Independent Test**: Given a queued refresh run, a trusted worker claims domain steps and reports safe completion/failure summaries. The refresh run updates each step status and aggregate status without browser-side fetching or direct worker dispatch.

**Acceptance Scenarios**:

1. **Given** a queued refresh run with eligible domain steps, **When** an authorized worker claims a step, **Then** that step moves to running with worker identity, timestamps, and a link to the prepared sync or ingestion request.
2. **Given** a worker completes a data collection step, **When** the worker submits a safe result summary, **Then** the refresh run records completion, source counts, freshness metadata, and safe failure/warning details without raw tokens or raw ESI payloads.
3. **Given** one domain fails while another completes, **When** the run is inspected, **Then** the system shows partial status and preserves enough detail for retry or evaluation with partial data.

---

### User Story 3 - Trigger Brain Evaluation From Refresh State (Priority: P3)

As a trusted evaluation worker, I can start Brain evaluation for a refresh run after data collection completes or reaches an approved partial state, and the resulting command brief links back to the refresh run and domain provenance.

**Why this priority**: The Brain already produces command intelligence, but it is not currently tied to a specific refresh cycle, source freshness window, or partial-data explanation.

**Independent Test**: Complete or partially complete a refresh run, invoke the evaluation worker, and verify the run records the Brain run, resulting command brief, model/prompt metadata, source references, confidence, and missing-data explanation.

**Acceptance Scenarios**:

1. **Given** all requested data collection steps completed, **When** a trusted evaluation worker starts Brain evaluation, **Then** the system creates a Brain run linked to the refresh run and stores the resulting command brief with refresh provenance.
2. **Given** one or more requested domain steps failed or were skipped, **When** partial evaluation is allowed by run policy, **Then** the Brain output explicitly marks missing or stale data and the refresh run remains inspectable as completed-with-warnings.
3. **Given** Brain provider configuration is missing, unavailable, or returns invalid output, **When** evaluation is attempted, **Then** the run records a safe failed evaluation state without exposing provider secrets, raw prompts with sensitive material, stack traces, or token material.

---

### User Story 4 - Inspect Refresh Status And Results (Priority: P4)

As a commander, I can see current and recent refresh runs, their domain step status, failures, retries, final evaluation, and resulting command brief linkage from the command center.

**Why this priority**: Refresh orchestration must be visible and auditable, not a hidden background job.

**Independent Test**: Load the command center with fixture refresh runs in queued, running, partial, failed, and completed states. The UI shows safe status, domain details, retry/evaluation readiness, and final brief linkage without exposing secrets or raw source data.

**Acceptance Scenarios**:

1. **Given** recent refresh runs exist, **When** the commander opens the command center, **Then** they can inspect each run's requested domains, step statuses, created/completed timestamps, worker-safe summaries, and final evaluation state.
2. **Given** a refresh run completed with a command brief, **When** the commander views the run, **Then** they can navigate to or identify the generated command brief and its provenance.
3. **Given** a refresh run is failed or partial, **When** the commander inspects it, **Then** the UI shows safe failure reasons and retry readiness without offering direct EVE writes, worker dispatch, or external-service execution.

### Operating Model Alignment

- **Numbers**: Refresh runs coordinate Numbers ESI sync request preparation, worker collection state, snapshot freshness, and Numbers evidence used by Brain evaluation.
- **Opportunity**: Refresh runs coordinate Opportunity ingestion request preparation/completion and official-news or research context freshness used by Brain evaluation.
- **People**: Refresh runs coordinate People ingestion or People ESI sync request state and member/profile freshness used by Brain evaluation.
- **Decision Boundary**: Refresh outputs are observations, recommendations, missing-data explanations, and draft orders only. They do not approve decisions, create queued work, or execute player-impacting actions.
- **Automation Boundary**: The commander creates a durable run request. Trusted workers may claim and complete steps through worker-only callbacks. Browser/request paths do not dispatch workers, fetch ESI, write to EVE, mutate roles/access/standings, move assets/wallets/contracts, or call external services.

### Edge Cases

- No active ESI token vault exists for a requested ESI-backed domain.
- Requested domain has no supported worker execution path yet.
- A duplicate active run exists for the same corporation and domain set.
- One or more domain steps complete after Brain evaluation has already failed.
- A worker attempts to complete a step it did not claim.
- A worker result includes token material, raw ESI payloads, raw prompts, dispatch targets, or mutation intents.
- Brain evaluation is requested before required data collection reaches a runnable state.
- Brain provider configuration is missing, rate-limited, times out, or returns malformed output.
- The commander signs out while a refresh run continues in worker-owned background state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authorized signed-in commander to create a durable intelligence refresh run for one or more supported operating domains.
- **FR-002**: System MUST persist refresh run status, requested domains, domain step statuses, timestamps, commander/session-safe provenance, and no-execution boundary metadata.
- **FR-003**: System MUST reject or ignore browser-supplied token material, raw source payloads, worker secrets, dispatch targets, retry execution handles, EVE write intents, role/access/standing mutations, wallet/asset/contract mutation fields, and external execution fields.
- **FR-004**: System MUST prevent duplicate active refresh runs for the same corporation and equivalent requested domain set unless the previous run is terminal.
- **FR-005**: System MUST prepare or link eligible existing data-pull request records for requested Numbers, Opportunity, and People domains without performing long-running data collection in browser/request paths.
- **FR-006**: System MUST expose trusted-worker endpoints or callbacks that can claim refresh run steps, record safe progress, complete steps, fail steps, or mark steps skipped.
- **FR-007**: System MUST require server-side worker callback authorization for all worker-owned refresh step and evaluation transitions.
- **FR-008**: System MUST record partial completion when at least one domain completes and at least one domain fails, blocks, or is skipped.
- **FR-009**: System MUST allow Brain evaluation only when refresh state is completed or explicitly eligible for partial evaluation.
- **FR-010**: System MUST link Brain run records and generated command brief records back to the refresh run and the domain step provenance used for evaluation.
- **FR-011**: System MUST store Brain evaluation status, model, provider, prompt version, source reference summary, confidence, created timestamp, and safe failure metadata.
- **FR-012**: System MUST make current and recent refresh runs visible through browser-safe command APIs and command center UI.
- **FR-013**: System MUST keep EVE SSO secrets, ESI token material, MongoDB credentials, OpenRouter credentials, worker callback secrets, raw ESI payloads, and unsafe raw prompts out of browser responses and command-surface storage.
- **FR-014**: System MUST preserve explicit commander approval boundaries for downstream decisions, queued work, retries, EVE writes, role/access changes, standings, wallets, assets, contracts, and external service mutations.
- **FR-015**: System MUST provide deterministic tests for run creation, duplicate prevention, worker transitions, partial completion, Brain evaluation readiness, unsafe material rejection, and browser-safe status rendering.

### Key Entities *(include if feature involves data)*

- **Intelligence Refresh Run**: A commander-created orchestration record scoped to a corporation, requested domains, aggregate status, provenance, timestamps, domain steps, Brain evaluation linkage, final command brief linkage, and safe failure/warning summaries.
- **Refresh Domain Step**: A per-domain unit within a refresh run, including domain, status, prepared request linkage, claimed worker metadata, source/freshness summary, failure metadata, and timestamps.
- **Refresh Evaluation**: The Brain evaluation lifecycle attached to a refresh run, including readiness state, Brain run id, command brief id, model/prompt metadata, source summary, confidence, and failure state.
- **Refresh Run Policy**: Server-owned rules for duplicate handling, supported domains, partial evaluation eligibility, unsafe material rejection, and no-execution boundaries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can create a refresh run for at least one supported domain and receive a browser-safe run summary in under 2 seconds without triggering long-running data collection in the request path.
- **SC-002**: 100% of active duplicate requests for the same corporation and domain set return the existing active run or a duplicate-safe response rather than creating duplicate active runs.
- **SC-003**: A trusted worker can move a domain step through claim and terminal completion/failure states with all transitions persisted and visible in browser-safe summaries.
- **SC-004**: Partial refresh runs clearly identify completed, failed, blocked, and skipped domains and expose at least one safe next-step reason for each non-completed domain.
- **SC-005**: Brain evaluation linked to a refresh run produces a command brief whose provenance includes refresh run id, domain step summary, model, prompt version, source references, confidence, and created timestamp.
- **SC-006**: Automated tests confirm unsafe material patterns are rejected or omitted from refresh run, worker, evaluation, and browser responses.

## Assumptions

- Existing EVE SSO signed sessions remain the commander authorization boundary.
- Existing MongoDB-backed stores remain the persistence authority for command data and refresh run records.
- Existing Numbers ESI sync, People ingestion, Opportunity ingestion, ESI sync worker, and Brain worker contracts are reused instead of replacing them.
- Browser actions may prepare durable records and show state, but worker execution continues outside request/response paths.
- The first M59 increment may support only the domains with existing preparation or worker contracts while recording unsupported-domain status safely.
