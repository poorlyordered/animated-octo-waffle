# Feature Specification: Dedicated Opportunity Surface

**Feature Branch**: `022-dedicated-opportunity-surface`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M22: Dedicated Opportunity surface once the command brief provenance model has settled."

## User Scenarios & Testing

### User Story 1 - Inspect Opportunity As A First-Class Domain (Priority: P1)

As a commander, I want a dedicated Opportunity surface so that official-news findings, strategic impacts, recommendations, watchlist items, and source context are not buried inside the general command brief.

**Why this priority**: M19 made Opportunity provenance explicit. The next product step is giving Opportunity its own operating surface alongside Numbers and People.

**Independent Test**: Load the browser command surface and verify the Opportunity surface renders a distinct heading, summary, impacts, recommendations, watchlist, source references, and provenance status.

**Acceptance Scenarios**:

1. **Given** a processed command brief exists, **When** the commander opens the app, **Then** the Opportunity surface shows the latest Opportunity summary and sections.
2. **Given** source references exist, **When** the Opportunity surface renders, **Then** sources are shown as browser-safe references.
3. **Given** recommendations exist, **When** the Opportunity surface renders, **Then** recommendations remain read-only findings and not execution controls.

---

### User Story 2 - Show Opportunity Provenance And Research History (Priority: P2)

As a commander, I want Opportunity provenance visible on the dedicated surface so that I can evaluate whether opportunity context is fresh, historical, or unavailable.

**Why this priority**: Opportunity recommendations are only useful when their source history and coverage are inspectable.

**Independent Test**: Render latest-research, historical-brief, and unavailable provenance fixtures and verify mode, source count, brief count, section status, history, and no-execution boundary are visible.

**Acceptance Scenarios**:

1. **Given** latest processed research history exists, **When** the surface renders, **Then** it says Opportunity context is linked to processed research history.
2. **Given** only historical brief context exists, **When** the surface renders, **Then** historical mode is visible.
3. **Given** no Opportunity context exists, **When** the surface renders, **Then** the empty state explains unavailable Opportunity history.

---

### User Story 3 - Preserve Read-Only Boundaries (Priority: P3)

As a commander, I want the Opportunity surface to be clearly read-only so that it is not mistaken for research scheduling, worker dispatch, EVE writes, or external execution.

**Why this priority**: Opportunity research may become long-running later; this slice only exposes existing processed information.

**Independent Test**: Verify Opportunity surface responses and browser text contain no scheduling, dispatch, EVE write, token, secret, worker, or external execution handles.

**Acceptance Scenarios**:

1. **Given** Opportunity findings are visible, **When** the commander reads the surface, **Then** no research pull or worker action is presented.
2. **Given** a recommendation is displayed, **When** it is shown, **Then** it is labeled as a read-only command finding.
3. **Given** provenance history includes failed research, **When** it is rendered, **Then** only safe failure reason and timestamp are shown.

### Operating Model Alignment

- **Numbers**: Unchanged.
- **Opportunity**: Primary source. M22 promotes Opportunity from command brief subsection to first-class operating surface.
- **People**: Unchanged.
- **Decision Boundary**: Observation and recommendation only. Decision recording remains on existing command brief/decision surfaces.
- **Automation Boundary**: No research scheduling, worker dispatch, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Requirements

### Functional Requirements

- **FR-001**: Browser MUST render a dedicated Opportunity operating surface.
- **FR-002**: Surface MUST show summary, strategic impacts, recommended actions, watchlist, and source references from the latest command brief when available.
- **FR-003**: Surface MUST show Opportunity ingestion provenance mode, source count, brief count, section status, recent history, and boundary language.
- **FR-004**: Surface MUST render unavailable and stale/processing/failed states without implying execution.
- **FR-005**: Surface MUST not introduce a new request-path research scheduler, worker dispatch, ESI fetch, EVE write, or external service mutation.
- **FR-006**: Surface MUST not expose access tokens, refresh tokens, sealed token material, worker secrets, dispatch targets, EVE write handles, or execution handles.
- **FR-007**: Contract/unit and browser smoke tests MUST cover the Opportunity surface view model, browser rendering, empty state, provenance, and no-execution language.

## Success Criteria

- **SC-001**: Browser smoke test verifies the dedicated Opportunity surface renders from deterministic fixtures.
- **SC-002**: Unit tests verify Opportunity view-model derivation for processed and unavailable states.
- **SC-003**: Existing lint, typecheck, Jest, Playwright, and production build continue to pass.

## Assumptions

- Existing `/api/command-brief` and `/api/research-status` remain the data sources for M22.
- M22 does not add a new durable collection.
- Decision creation from Opportunity recommendations remains available through existing command brief paths, not the new read-only surface.
