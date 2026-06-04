# Feature Specification: Opportunity Decision Handoff

**Feature Branch**: `023-opportunity-decision-handoff`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M23: Opportunity decision handoff from dedicated surface once Opportunity-specific provenance is stable."

## User Scenarios & Testing

### User Story 1 - Record A Decision From Opportunity Surface (Priority: P1)

As a commander, I want to record a proposed decision directly from a dedicated Opportunity recommendation so that Opportunity findings can enter the same auditable decision loop as command brief recommendations.

**Why this priority**: M22 made Opportunity first-class. The next step is to let commanders convert Opportunity recommendations into decision records without leaving the Opportunity surface.

**Independent Test**: Open the Opportunity surface, select a recommendation, submit a decision record, and verify the response shows a proposed decision linked to the source brief.

**Acceptance Scenarios**:

1. **Given** Opportunity recommendations exist, **When** the commander records a decision, **Then** a proposed decision record is created from the source brief.
2. **Given** the decision is recorded, **When** the browser renders the handoff, **Then** it shows decision id, proposed status, source brief id, provenance mode, and no-execution boundary language.
3. **Given** the decision is recorded, **When** the browser updates, **Then** no queued work, worker dispatch, research scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external execution occurs.

---

### User Story 2 - Preserve Opportunity Provenance In Handoff (Priority: P2)

As a commander, I want Opportunity decision handoff details to include source and provenance context so that I can audit why the decision was recorded.

**Why this priority**: Opportunity decisions are only useful when they remain tied to source history and brief provenance.

**Independent Test**: Record a decision from a recommendation and verify the handoff includes source count, focus, provenance mode, and source brief id.

**Acceptance Scenarios**:

1. **Given** Opportunity provenance is available, **When** a decision is recorded, **Then** the handoff includes provenance mode and focus.
2. **Given** source references exist, **When** a decision is recorded, **Then** the handoff includes a source count and source brief id.
3. **Given** provenance is unavailable, **When** a decision is recorded from existing brief context, **Then** the handoff remains browser-safe and does not invent provenance.

---

### User Story 3 - Keep Approval And Queueing Separate (Priority: P3)

As a commander, I want Opportunity decision recording to stop at proposed decision state so that approval and queueing remain explicit later steps.

**Why this priority**: The constitution requires human authority and auditability across recommendations, decisions, queued work, and execution.

**Independent Test**: Record a decision and verify only a proposed decision is created; no approval, queue item, worker handoff, retry, research request, or execution handle is present.

**Acceptance Scenarios**:

1. **Given** the commander records an Opportunity decision, **When** the response returns, **Then** the status is proposed.
2. **Given** the decision is proposed, **When** the handoff renders, **Then** it says approval and queueing remain separate workflows.
3. **Given** browser-visible handoff metadata is serialized, **When** it is inspected, **Then** it contains no secrets, tokens, dispatch targets, worker handles, or execution handles.

### Operating Model Alignment

- **Numbers**: Unchanged.
- **Opportunity**: Primary source. Converts Opportunity recommendations into decision records.
- **People**: Unchanged.
- **Decision Boundary**: Creates proposed decisions only.
- **Automation Boundary**: No queueing, worker dispatch, research scheduling, retry, ESI fetch, EVE write, or external-service execution.

## Requirements

### Functional Requirements

- **FR-001**: Opportunity surface MUST expose a decision-recording control for recommended actions when a source brief is available.
- **FR-002**: Opportunity decision recording MUST use existing `CreateDecisionRecordRequest` and create proposed decision records only.
- **FR-003**: Opportunity surface MUST render browser-safe handoff metadata after decision creation.
- **FR-004**: Handoff metadata MUST include decision id, decision status, source brief id, source recommendation, source count, provenance mode when available, focus, message, and boundary language.
- **FR-005**: Handoff metadata MUST state approval and queueing remain separate workflows.
- **FR-006**: Browser UI MUST not expose approval, queueing, dispatch, retry, research scheduling, EVE write, wallet, asset, contract, role, or external execution controls in this slice.
- **FR-007**: Contract/unit and browser smoke tests MUST cover handoff derivation, decision recording, provenance context, and no-execution boundary language.

## Success Criteria

- **SC-001**: Browser smoke test records an Opportunity decision from the dedicated surface.
- **SC-002**: Unit tests verify handoff derivation with and without Opportunity provenance.
- **SC-003**: Existing lint, typecheck, Jest, Playwright, and production build continue to pass.

## Assumptions

- Existing `/api/decision-records` remains the write path.
- M23 does not add a new durable collection or backend route.
- Approval, rejection, and queue creation for Opportunity decisions remain future slices.
