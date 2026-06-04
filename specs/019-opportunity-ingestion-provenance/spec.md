# Feature Specification: Opportunity Ingestion Provenance

**Feature Branch**: `019-opportunity-ingestion-provenance`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M19: Opportunity ingestion history/provenance using the same browser-safe sync visibility pattern."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Opportunity Research Provenance (Priority: P1)

As a commander, I want the command brief to show whether Opportunity context came from processed research history, historical brief records, or no available research source so that I can trust opportunity recommendations before recording decisions.

**Why this priority**: Opportunity currently appears through command briefs, but its research provenance is implicit. M19 makes that source history visible without adding a new worker or execution path.

**Independent Test**: Load the command brief and verify the response and browser panel show Opportunity provenance mode, focus, source count, brief count, recent research history, and no-execution boundary language.

**Acceptance Scenarios**:

1. **Given** processed research history exists, **When** the commander opens the command brief, **Then** the browser says Opportunity context is linked to processed research history.
2. **Given** a command brief exists without recent processed research history, **When** the commander opens the command brief, **Then** the browser says Opportunity context is available from historical command brief records.
3. **Given** no command brief or research history exists, **When** the command brief API responds, **Then** provenance reports unavailable history without secrets or execution controls.

---

### User Story 2 - See Opportunity Section Coverage (Priority: P2)

As a commander, I want Opportunity provenance to show source, impact, recommendation, and watchlist coverage so that I can distinguish complete opportunity context from missing research sections.

**Why this priority**: Opportunity recommendations are useful only when their source and downstream command sections are visible. A single confidence value is not enough.

**Independent Test**: Parse Opportunity provenance with present and missing sections and verify section statuses are visible in API and browser fixtures.

**Acceptance Scenarios**:

1. **Given** a brief has source references, **When** provenance is computed, **Then** sources are present.
2. **Given** a brief has strategic impacts and recommended actions, **When** provenance is computed, **Then** impacts and recommendations are present.
3. **Given** a brief lacks watchlist entries, **When** provenance is computed, **Then** watchlist is missing.

---

### User Story 3 - Preserve Browser-Safe Boundaries (Priority: P3)

As a commander, I want Opportunity ingestion history to be explicitly read-only so that the surface cannot be mistaken for research scheduling, worker dispatch, ESI fetch, EVE write, or external execution.

**Why this priority**: Research and opportunity workflows are long-running and should not be triggered from the browser provenance display.

**Independent Test**: Verify Opportunity provenance responses and browser text include no-execution language and no secrets, token material, worker handles, dispatch targets, or execution handles.

**Acceptance Scenarios**:

1. **Given** Opportunity provenance is displayed, **When** the commander reads it, **Then** it says the view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services.
2. **Given** failed research history exists, **When** it is serialized, **Then** only browser-safe reason and timestamp are included.
3. **Given** the command brief response includes provenance, **When** the browser parses it, **Then** no tokens, secrets, worker credentials, dispatch targets, or execution handles are present.

### Operating Model Alignment

- **Numbers**: N/A for this slice; Numbers provenance remains unchanged.
- **Opportunity**: Primary source. The slice exposes research/brief provenance for opportunity context, strategic impacts, recommendations, and watchlists.
- **People**: N/A for this slice; People provenance remains unchanged.
- **Decision Boundary**: Observation only. The browser sees provenance and coverage before possible decision recording.
- **Automation Boundary**: Read-only browser/API visibility. No research scheduling, worker dispatch, ESI fetch, EVE write, or external-service execution occurs.

### Edge Cases

- No `research_requests` records exist but a command brief does exist.
- No command brief or research history exists.
- Research history contains unknown status values.
- Research result section statuses are absent or malformed.
- Failed research has no safe error message.
- Browser receives Opportunity provenance with an otherwise empty command brief response.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include optional browser-safe Opportunity ingestion provenance in command brief responses.
- **FR-002**: Provenance MUST include mode, focus, source count, brief count, section statuses, recent history, message, and no-execution boundary language.
- **FR-003**: System MUST read bounded recent Opportunity research history from corporation- and focus-scoped `research_requests`.
- **FR-004**: System MUST compute section statuses for sources, impacts, recommendations, and watchlist from the latest command brief.
- **FR-005**: System MUST fall back to historical brief provenance when a command brief exists without processed research history.
- **FR-006**: System MUST return unavailable provenance when no command brief or research history exists.
- **FR-007**: Browser UI MUST render Opportunity provenance and recent history without creating execution controls.
- **FR-008**: Responses MUST NOT include access tokens, refresh tokens, sealed token material, MongoDB credentials, cookie signatures, worker secrets, dispatch targets, EVE write handles, or execution handles.
- **FR-009**: This slice MUST NOT schedule research pulls, dispatch workers, claim work, fetch ESI, write to EVE, or execute external services.
- **FR-010**: Contract, unit, and browser smoke tests MUST cover provenance response parsing, history normalization, fallback behavior, and no-execution browser language.

### Key Entities *(include if feature involves data)*

- **OpportunityIngestionProvenance**: Browser-safe summary of Opportunity research provenance, aggregate section coverage, recent history, and boundary language.
- **OpportunityIngestionHistoryItem**: Browser-safe representation of a recent research request status and safe result/failure metadata.
- **CommandBrief**: Existing processed brief record used to compute source, impact, recommendation, and watchlist coverage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Command brief responses parse successfully with Opportunity provenance.
- **SC-002**: Processed research history produces `latest_research` provenance.
- **SC-003**: Existing command briefs without processed history produce `historical_brief` provenance.
- **SC-004**: Browser smoke test verifies Opportunity provenance and no-execution language are visible.
- **SC-005**: Existing lint, typecheck, unit/contract tests, browser smoke tests, and production build continue to pass.

## Assumptions

- Existing `research_briefs` remain the authoritative processed Opportunity artifact.
- Existing `research_requests` remain the authoritative research history artifact for this slice.
- M19 does not add research scheduling, worker execution, ESI ingestion, EVE writes, or external-service execution.
