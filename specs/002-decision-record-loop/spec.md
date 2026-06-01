# Feature Specification: Decision Record Loop

**Feature Branch**: `002-decision-record-loop`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Build the M2 Decision Record Loop: let the commander turn a command brief recommendation into a tracked decision record, link it to source briefs and data snapshots, track status proposed/approved/delegated/done/rejected, capture rationale and expected result, preserve the command authority boundary, and require explicit approval before any player-impacting action."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record A Decision From A Recommendation (Priority: P1)

As the corporation commander, I want to turn a command brief recommendation into a decision record so the reasoning, source context, and expected outcome are preserved before any action is taken.

**Why this priority**: This creates the first command loop beyond reading intelligence. The commander can convert observation and recommendation into an auditable decision without executing player-impacting actions.

**Independent Test**: Start from a processed command brief with at least one recommendation; create a decision record from that recommendation; verify the record includes the recommendation text, source brief link, rationale, expected result, initial status, and created timestamp.

**Acceptance Scenarios**:

1. **Given** a command brief recommendation is visible, **When** the commander chooses to record a decision from it, **Then** the system creates a decision record linked to the source brief and recommendation.
2. **Given** the commander is recording a decision, **When** they provide rationale and expected result, **Then** those fields are saved with the decision and shown in the decision detail view.
3. **Given** a recommendation has source references and operating-leg coverage, **When** a decision is created from it, **Then** the decision keeps visible provenance back to the brief, sources, and numbers/opportunity/people coverage state.

---

### User Story 2 - Track Decision Status (Priority: P2)

As the corporation commander, I want each decision to move through explicit statuses so I can see what is proposed, approved, delegated, done, or rejected.

**Why this priority**: A decision record is only useful if the commander can track where it stands and separate pending intent from completed action.

**Independent Test**: Create a decision record and update it through each allowed status; verify the current status, timestamp, and history are visible without changing the source command brief.

**Acceptance Scenarios**:

1. **Given** a new decision record exists, **When** it is first saved, **Then** its initial status is `proposed`.
2. **Given** a proposed decision exists, **When** the commander approves, delegates, completes, or rejects it, **Then** the status changes only to an allowed status and the change is recorded in the decision history.
3. **Given** a decision has changed status multiple times, **When** the commander opens the decision detail, **Then** the commander can inspect the current status and prior status changes.

---

### User Story 3 - Preserve Command Authority For Player-Impacting Actions (Priority: P3)

As the corporation commander, I want Gryyk-47 to distinguish decision records from executed player-impacting actions so no automation affects players, assets, permissions, standings, wallets, contracts, or external services without explicit approval.

**Why this priority**: The constitution requires human command authority. This feature must not blur the line between recording intent and executing action.

**Independent Test**: Create decisions that are informational, delegable, and player-impacting; verify player-impacting decisions require explicit approval before any action-like state or queue entry can be created.

**Acceptance Scenarios**:

1. **Given** a decision is informational only, **When** it is recorded, **Then** it remains a decision record and does not create an automation task.
2. **Given** a decision would affect players, assets, permissions, standings, wallets, contracts, or external services, **When** the commander attempts to advance it toward action, **Then** the system requires explicit approval and records that approval.
3. **Given** explicit approval has not been recorded for a player-impacting decision, **When** the system displays the decision, **Then** it clearly shows that no action has been executed or queued.

### Operating Model Alignment

- **Numbers**: Decisions may cite financial, asset, market, activity, or other measurable context from the source brief or data snapshot. If numbers data is missing, the decision must retain that missing-data context.
- **Opportunity**: Decisions are commonly created from opportunity recommendations, including official news, patch changes, market openings, recruiting moments, timing windows, or risk signals.
- **People**: Decisions may affect members, roles, delegation, onboarding, retention, or leadership workload. Player-impacting people decisions require explicit approval before action.
- **Decision Boundary**: This feature records observations, recommendations, rationale, and commander decisions. It may mark a decision as approved, delegated, done, or rejected, but it does not execute game or external-service actions.
- **Automation Boundary**: Manual decision recording only in the MVP. Any future queue or automation handoff must require explicit approval for player-impacting actions.

### Edge Cases

- The source command brief or recommendation is no longer the latest brief.
- The source brief has missing numbers, opportunity, or people data.
- The commander starts a decision but omits rationale or expected result.
- The commander tries to set an invalid status.
- The commander rejects a decision after it was previously approved or delegated.
- A decision references a source brief that has been deleted or is unavailable.
- A decision is player-impacting but lacks explicit approval.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the commander to create a decision record from a command brief recommendation.
- **FR-002**: System MUST link each decision record to its source command brief and the recommendation that triggered it.
- **FR-003**: System MUST save commander-provided rationale and expected result for each decision record.
- **FR-004**: System MUST assign new decision records the initial status `proposed`.
- **FR-005**: System MUST support decision statuses `proposed`, `approved`, `delegated`, `done`, and `rejected`.
- **FR-006**: System MUST record status changes with timestamp and previous/current status.
- **FR-007**: System MUST show the current status and status history for each decision record.
- **FR-008**: System MUST preserve source provenance, including source brief identity, source references, confidence, created timestamp, and operating-leg coverage state available at decision creation time.
- **FR-009**: System MUST show missing numbers, opportunity, or people data on decision records when that context was missing from the source brief.
- **FR-010**: System MUST distinguish decision records from executed actions or automation queue entries.
- **FR-011**: System MUST require explicit commander approval before any player-impacting action-like state or future queue handoff is created.
- **FR-012**: System MUST prevent browser-controlled corporation identity from selecting or writing decision records outside the server-owned corporation scope.
- **FR-013**: System MUST show an empty decision state when no decisions have been recorded.

### Key Entities *(include if feature involves data)*

- **Decision Record**: Commander-owned record of a choice or intended course of action. Includes status, rationale, expected result, source brief link, source recommendation, provenance snapshot, created timestamp, and status history.
- **Decision Status History**: Ordered record of status changes, including previous status, next status, timestamp, and actor identity when available.
- **Source Provenance Snapshot**: Immutable decision-time context from the source brief, including brief identity, source references, confidence, created timestamp, and operating-leg coverage.
- **Approval Record**: Explicit commander approval for a player-impacting decision to move toward action or a future automation queue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can create a decision record from a visible recommendation in under 30 seconds using seeded validation data.
- **SC-002**: 100% of decision records created from recommendations include a source brief link and source recommendation text.
- **SC-003**: 100% of decision records show current status and status history after at least one status change.
- **SC-004**: Player-impacting decisions cannot be represented as executed or queued without an explicit approval record.
- **SC-005**: In seeded validation data, decisions for another corporation are never visible or writable from the configured corporation scope.

## Assumptions

- The Command Brief MVP remains the primary source surface for recommendations in this milestone.
- The first Decision Record Loop stores decision records but does not execute game actions or external-service changes.
- EVE SSO-derived commander identity may arrive in a later slice; until then, corporation scope remains server-owned.
- Automation Queue integration is a later milestone; this feature may prepare approval semantics but does not implement worker execution.
