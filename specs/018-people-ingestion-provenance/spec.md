# Feature Specification: People Ingestion Provenance

**Feature Branch**: `018-people-ingestion-provenance`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M18: People ingestion history/provenance using the same browser-safe sync visibility pattern beyond Numbers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect People Ingestion Provenance (Priority: P1)

As a commander, I want the People surface to show whether member profile data came from completed ingestion history, historical profiles, or no available ingestion source so that I can trust the member context before delegating follow-ups.

**Why this priority**: People member profiles already drive leadership follow-ups. Commanders need the same provenance visibility that Numbers gained in M14 before extending ingestion or worker behavior.

**Independent Test**: Load the People member list and verify the response and browser panel show provenance mode, profile count, source count, section status, recent history, and no-execution boundary language.

**Acceptance Scenarios**:

1. **Given** completed People ingestion history exists, **When** the commander opens People, **Then** the browser says latest profiles are linked to completed ingestion history.
2. **Given** member profiles exist without ingestion history, **When** the commander opens People, **Then** the browser says profiles are available from historical profile records.
3. **Given** no People profiles or ingestion history exist, **When** the commander opens People, **Then** the browser says no People ingestion history is available.

---

### User Story 2 - See Section-Level Coverage (Priority: P2)

As a commander, I want People provenance to show identity, roles, activity, and delegation status so that I can separate trustworthy member signals from stale or missing operating context.

**Why this priority**: People decisions rely on role, activity, and delegation quality. Section-level coverage prevents generic confidence language from hiding missing records.

**Independent Test**: Parse People provenance with present, stale, and missing member coverage and verify aggregate section statuses are visible in API and browser fixtures.

**Acceptance Scenarios**:

1. **Given** one member lacks role or delegation data, **When** provenance is computed, **Then** the matching section status is missing.
2. **Given** one member has stale activity, **When** provenance is computed, **Then** activity is stale unless missing activity exists.
3. **Given** all members have present identity coverage, **When** provenance is computed, **Then** identity is present.

---

### User Story 3 - Preserve Browser-Safe Boundaries (Priority: P3)

As a commander, I want People ingestion history to be explicitly read-only so that the surface cannot be mistaken for a role, access, ESI, retry, dispatch, or external execution control.

**Why this priority**: People workflows can become player-impacting quickly. M18 must add visibility without creating execution affordances.

**Independent Test**: Verify People provenance responses and browser text contain no-execution boundary language and no secrets, token material, worker handles, role mutation data, or dispatch controls.

**Acceptance Scenarios**:

1. **Given** People ingestion history is displayed, **When** the commander reads it, **Then** it says the view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.
2. **Given** ingestion history has failure metadata, **When** it is serialized, **Then** only browser-safe reason and timestamp are included.
3. **Given** the People list API returns provenance, **When** the browser parses it, **Then** no token, secret, worker credential, role-write, access-write, or execution handle fields are present.

### Operating Model Alignment

- **Numbers**: Reuses the browser-safe provenance pattern established for Numbers sync history, but does not change Numbers data.
- **Opportunity**: N/A for this slice; Opportunity ingestion provenance remains a future M19 candidate.
- **People**: Primary source. The slice adds provenance and history visibility for member, role, activity, and delegation context.
- **Decision Boundary**: Observation only. The browser sees provenance and coverage, not approval or action execution.
- **Automation Boundary**: Read-only browser/API visibility. No retry scheduling, worker dispatch, ESI fetch, role mutation, access mutation, or external-service execution occurs.

### Edge Cases

- No `people_ingestion_requests` records exist but member profiles do exist.
- No member profiles or ingestion history exist.
- Ingestion history contains unknown status values.
- Ingestion result contains partial or malformed section status data.
- Failure metadata is present without a usable timestamp or reason.
- Browser fixtures route member detail before list responses.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include optional browser-safe People ingestion provenance in member list responses.
- **FR-002**: Provenance MUST include mode, source count, profile count, section statuses, recent history, message, and no-execution boundary language.
- **FR-003**: System MUST read bounded recent People ingestion history from corporation-scoped records.
- **FR-004**: System MUST aggregate People section statuses across member profile coverage for identity, roles, activity, and delegation.
- **FR-005**: System MUST fall back to historical profile provenance when member profiles exist without ingestion history.
- **FR-006**: System MUST return unavailable provenance when no profiles or ingestion history exist.
- **FR-007**: Browser UI MUST render People ingestion provenance and recent history without creating execution controls.
- **FR-008**: Responses MUST NOT include access tokens, refresh tokens, sealed token material, MongoDB credentials, cookie signatures, worker secrets, dispatch targets, role mutation handles, access mutation handles, or execution handles.
- **FR-009**: This slice MUST NOT schedule retries, dispatch workers, claim work, fetch ESI, write to EVE, change roles, change access, or execute external services.
- **FR-010**: Contract, unit, and browser smoke tests MUST cover provenance response parsing, history normalization, coverage fallback, and no-execution browser language.

### Key Entities *(include if feature involves data)*

- **PeopleIngestionProvenance**: Browser-safe summary of latest People data provenance, aggregate coverage, recent history, and boundary language.
- **PeopleIngestionHistoryItem**: Browser-safe representation of a recent People ingestion request status and safe result/failure metadata.
- **MemberProfile**: Existing People profile record used to compute profile count and aggregate section coverage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Member list responses parse successfully with People ingestion provenance.
- **SC-002**: Completed People ingestion history produces `latest_ingestion` provenance.
- **SC-003**: Existing member profiles without history produce `historical_profiles` provenance.
- **SC-004**: Browser smoke test verifies People provenance and no-execution language are visible.
- **SC-005**: Existing lint, typecheck, unit/contract tests, browser smoke tests, and production build continue to pass.

## Assumptions

- Existing People profile and follow-up collections remain authoritative for member context.
- `people_ingestion_requests` may exist before a dedicated People worker is implemented; M18 only reads safe status/history records.
- M18 does not add People ingestion worker execution, retry scheduling, role/access mutation, or EVE write behavior.
