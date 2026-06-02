# Feature Specification: Numbers Follow-Up Actions

**Feature Branch**: `011-numbers-followup-actions`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M11: Create decision records or queued work from Numbers follow-up candidates while preserving commander approval and no-execution boundaries."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record A Decision From A Numbers Follow-Up (Priority: P1)

As a commander, I want to turn a Numbers follow-up candidate into a decision record so that measurable corporation findings can enter the auditable decision loop.

**Why this priority**: Numbers follow-ups are currently display-only. Creating a decision record is the lowest-risk way to move from observation to command intent while preserving human authority.

**Independent Test**: Seed a processed Numbers snapshot with a decision-path follow-up candidate, open the Numbers surface, create a decision record from the candidate, and verify the resulting decision preserves the candidate text, rationale, expected result, operating-leg context, provenance, and proposed status.

**Acceptance Scenarios**:

1. **Given** a Numbers follow-up candidate suggests a decision path, **When** the commander records it as a decision, **Then** a decision record is created with proposed status and no execution metadata.
2. **Given** the candidate is tied to a Numbers snapshot, **When** the decision is created, **Then** the decision references snapshot provenance and identifies that it originated from a Numbers follow-up.
3. **Given** the candidate is player-impacting, **When** the decision is created, **Then** it remains proposed until the commander explicitly approves it through the existing approval boundary.

---

### User Story 2 - Queue Approved Numbers Follow-Up Work (Priority: P2)

As a commander, I want an approved Numbers follow-up decision to create queued work so that workers can later prepare or process it through the auditable queue.

**Why this priority**: Queue creation connects Numbers findings to the existing automation loop, but only after the decision record captures commander intent and approval where required.

**Independent Test**: Start from a Numbers follow-up decision that is already approved, create queued work from it, and verify the queue item links to the decision, preserves provenance, starts queued, and does not dispatch a worker.

**Acceptance Scenarios**:

1. **Given** a Numbers follow-up decision is approved, **When** the commander creates queued work, **Then** the queue item is created with queued status and source decision linkage.
2. **Given** a Numbers follow-up decision is still proposed or rejected, **When** the commander attempts to create queued work, **Then** the system refuses and explains the approval boundary.
3. **Given** queued work is created from a Numbers follow-up, **When** the commander inspects it, **Then** the queue item clearly states that no worker has been dispatched and no EVE action has been executed.

---

### User Story 3 - Prevent Duplicate Or Unsafe Follow-Up Actions (Priority: P3)

As a commander, I want the system to prevent duplicate or unsafe follow-up actions so that Numbers recommendations do not create confusing repeated decisions, queue items, or implied execution.

**Why this priority**: The command loop must stay inspectable. Duplicate records and action-like inputs would weaken auditability and the explicit approval model.

**Independent Test**: Attempt to create the same decision or queue item twice from one Numbers follow-up, attempt action-like browser inputs, and verify existing records are surfaced or unsafe requests are rejected without mutation.

**Acceptance Scenarios**:

1. **Given** a decision already exists for a Numbers follow-up candidate, **When** the commander asks to record it again, **Then** the system surfaces the existing decision instead of creating a duplicate.
2. **Given** queued work already exists for an approved follow-up decision with the same task intent, **When** the commander asks to queue it again, **Then** the system surfaces the existing queue item or refuses the duplicate.
3. **Given** a browser request includes wallet movement, asset movement, dispatch, retry, EVE write, or external-service execution flags, **When** the request is handled, **Then** those inputs are rejected or ignored and no mutation occurs beyond explicitly requested decision or queue creation.

---

### Operating Model Alignment

- **Numbers**: Primary source. The feature uses wallet, asset, logistics, market, and activity findings already present in processed Numbers snapshots.
- **Opportunity**: Market, logistics, and activity findings may become opportunity-oriented decisions or queued analysis work.
- **People**: People impacts may be flagged when a follow-up affects leadership workload, member activity, recruiting, or delegation, but no people records are changed by this feature.
- **Decision Boundary**: Numbers findings become decision records or queue preparation requests only when explicitly initiated by the commander.
- **Automation Boundary**: Queue creation is allowed from approved decisions, but no worker dispatch, retry scheduling, EVE write, wallet transfer, asset movement, contract action, or external-service mutation is performed.

### Edge Cases

- The active corporation has no Numbers snapshot or the selected follow-up candidate no longer exists.
- A follow-up candidate belongs to a different corporation scope.
- The follow-up candidate lacks enough rationale, expected result, or provenance to support decision creation.
- The commander attempts to queue work from a proposed, rejected, or player-impacting unapproved decision.
- A duplicate decision or queue item already exists for the same Numbers follow-up.
- The browser submits corporation scope, approval metadata, execution flags, worker dispatch fields, retry scheduling, wallet actions, asset actions, or external-service mutation fields.
- The Numbers snapshot has partial provenance or no model/prompt metadata.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a commander to create a proposed decision record from an eligible Numbers follow-up candidate.
- **FR-002**: System MUST preserve the Numbers follow-up title, rationale, related section, suggested path, player-impacting flag, and operating-leg context in the created decision record or its provenance.
- **FR-003**: System MUST assign a commander-visible expected result for created decisions from either optional commander input or a safe default derived from stored candidate context.
- **FR-004**: System MUST link created decisions to the originating Numbers snapshot and follow-up candidate in an inspectable way.
- **FR-005**: System MUST preserve source references, source count, confidence, created timestamp, and model/prompt metadata when available from the Numbers snapshot.
- **FR-006**: System MUST require existing explicit approval behavior before player-impacting decisions can progress beyond proposed status.
- **FR-007**: System MUST allow queued work to be created only from an approved Numbers follow-up decision.
- **FR-008**: System MUST preserve source decision linkage, provenance, task intent, input summary, expected output, and initial queued status when queued work is created.
- **FR-009**: System MUST prevent duplicate decisions from the same Numbers follow-up candidate for the same corporation scope.
- **FR-010**: System MUST prevent duplicate queued work for the same source decision and task intent.
- **FR-011**: System MUST ignore or reject browser-controlled corporation scope, raw provenance overrides, approval forgery, wallet or asset actions, worker dispatch fields, retry scheduling fields, EVE write flags, and external-service execution flags.
- **FR-012**: System MUST NOT dispatch workers, claim handoffs, schedule retries, perform live ESI sync, write to EVE, move wallets or assets, mutate contracts, change roles, or call external execution services as part of this feature.
- **FR-013**: System MUST NOT expose MongoDB credentials, EVE OAuth tokens, cookie signatures, worker callback secrets, or other server secrets in responses.
- **FR-014**: System MUST provide browser-visible status and boundary language for created decisions, duplicate decisions, created queue items, duplicate queue items, and blocked unsafe actions.
- **FR-015**: Decision creation, queue creation, duplicate prevention, approval boundaries, scoped access, provenance preservation, and browser-visible no-execution behavior MUST be covered by contract/unit tests and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **NumbersFollowUpCandidate**: A processed recommendation from the Numbers snapshot that can become a decision record or queued work candidate.
- **NumbersSnapshot**: Source processed corporation data and provenance for the follow-up candidate.
- **DecisionRecord**: Auditable commander intent created from a Numbers follow-up, initially proposed unless later approved through existing decision workflow.
- **AutomationQueueItem**: Queued work created from an approved Numbers follow-up decision for later worker preparation without dispatch or execution.
- **FollowUpActionLink**: Inspectable relationship between a Numbers follow-up candidate and the decision or queue item created from it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can create a proposed decision from a seeded Numbers follow-up candidate in the browser smoke suite.
- **SC-002**: A commander can create queued work from an approved Numbers follow-up decision, and the queue item remains queued with no dispatch or execution metadata.
- **SC-003**: Duplicate decision and queue attempts return or surface the existing artifact instead of creating duplicate records.
- **SC-004**: Player-impacting follow-ups cannot progress to approved decisions or queued work without explicit commander approval.
- **SC-005**: Contract/unit tests prove browser-provided corporation scope, approval forgery, raw provenance overrides, execution flags, dispatch fields, retry fields, wallet actions, and asset actions cannot bypass server-side rules.
- **SC-006**: API and browser responses contain no secrets, tokens, credentials, cookie signatures, worker secrets, or external execution handles.
- **SC-007**: Existing command brief, decision, automation queue, people, session, Numbers, handoff, worker callback, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M11 reuses the existing authenticated command scope and local `EVEONLINE_CORPORATION_ID` fallback.
- M11 reads already processed Numbers snapshots; it does not add live ESI sync or ESI token storage.
- Decision records remain the required approval gateway before queued work can be created.
- Queue creation remains preparation only; worker handoff preparation, worker claims, retry scheduling, and external execution stay outside this slice.
- Existing MongoDB collections for Numbers snapshots, strategic decisions, and automation queue remain the durable stores for this slice.
