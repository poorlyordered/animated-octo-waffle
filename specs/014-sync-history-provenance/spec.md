# Feature Specification: Sync History Provenance

**Feature Branch**: `014-sync-history-provenance`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M14: Browser-visible sync history and latest live Numbers provenance from completed ESI syncs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Latest Live Numbers Provenance (Priority: P1)

As a commander, I want the Numbers surface to show whether the current corporation health snapshot came from a completed ESI sync so that I can judge freshness, source coverage, and confidence before acting on it.

**Why this priority**: M13 writes processed Numbers snapshots from worker-side ESI ingestion. The first visible payoff should be making that live provenance inspectable in the command surface.

**Independent Test**: Seed a completed Numbers ESI sync request linked to a Numbers snapshot, load the Numbers command surface, and verify the latest sync provenance, section health, source count, snapshot timestamp, and no-execution boundary are visible without exposing token or worker secrets.

**Acceptance Scenarios**:

1. **Given** a completed Numbers ESI sync produced the latest snapshot, **When** the commander opens Numbers, **Then** the surface shows the linked sync request, completion time, source count, section health, and snapshot provenance.
2. **Given** the latest snapshot has no linked ESI sync request, **When** the commander opens Numbers, **Then** the surface labels the data source as processed historical data and explains that live sync provenance is unavailable.
3. **Given** browser-visible Numbers provenance is returned, **When** it is serialized, **Then** it contains no access tokens, refresh tokens, sealed token material, worker secrets, dispatch targets, retry schedules, or external execution handles.

---

### User Story 2 - Review Recent Sync History (Priority: P2)

As a commander, I want to see recent Numbers ESI sync attempts so that I can understand whether live ingestion is current, queued, claimed, completed, or failed.

**Why this priority**: A command operating system must expose automation status and failure state. Recent sync history gives the commander an audit trail without adding retry behavior yet.

**Independent Test**: Seed queued, claimed, completed, and failed Numbers sync requests for the active corporation, load ESI sync settings, and verify the recent history is ordered, scoped, browser-safe, and linked to snapshot outcomes when available.

**Acceptance Scenarios**:

1. **Given** multiple Numbers sync requests exist for the active corporation, **When** the commander views ESI sync settings, **Then** the system shows recent sync attempts ordered newest first with status, domain, requested time, worker claim metadata, completion or failure summary, and linked snapshot id where applicable.
2. **Given** sync requests exist for a different corporation, **When** the commander views sync history, **Then** those requests are not included.
3. **Given** more sync requests exist than the display limit, **When** history is loaded, **Then** the newest bounded set is shown and the response remains fast and browser-safe.

---

### User Story 3 - Inspect Failed Or Partial Sync Outcomes (Priority: P3)

As a commander, I want failed or partial sync outcomes to explain which Numbers sections are missing or stale so that I know what data is safe to trust and what still needs attention.

**Why this priority**: M13 can complete with partial ESI failures. The commander needs clear status and provenance before making decisions from incomplete data.

**Independent Test**: Seed completed partial and failed sync requests, load the sync history and Numbers surface, and verify failure reasons, missing/stale section statuses, source counts, and boundary language are visible without creating retries or actions.

**Acceptance Scenarios**:

1. **Given** a completed sync has partial section failures, **When** the commander reviews the latest live provenance, **Then** affected sections are labeled missing or stale with safe reasons.
2. **Given** a sync request failed, **When** the commander reviews sync history, **Then** the failure reason and failed timestamp are visible without raw provider payloads or token material.
3. **Given** the commander sees a failed or partial sync, **When** the UI presents next-step language, **Then** it does not schedule retries, dispatch workers, write to EVE, or imply that assets, wallets, contracts, roles, or external services were mutated.

---

### Operating Model Alignment

- **Numbers**: Primary domain. M14 exposes live sync provenance, snapshot freshness, source count, and section health for wallet, assets, logistics, market, and activity.
- **Opportunity**: Market and industry provenance can later support opportunity analysis, but M14 does not create recommendations.
- **People**: Character and corporation scope protect history visibility, but M14 does not update people records.
- **Decision Boundary**: M14 shows observations, provenance, status, and failure context only. It does not create decisions, draft orders, approvals, or queued work.
- **Automation Boundary**: M14 is read-only inspection of worker-produced sync state. It MUST NOT retry syncs, dispatch workers, refresh tokens, fetch ESI data in browser/request paths, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions.

### Edge Cases

- Active command scope is missing or signed out.
- No ESI vault exists, the vault is revoked, or no sync request has ever run.
- Latest Numbers snapshot exists but has no linked ESI sync metadata.
- Latest completed sync references a missing or deleted snapshot.
- Sync history contains queued, claimed, completed, failed, or cancelled requests.
- Partial ingestion produced missing or stale section states.
- Sync requests exist for another corporation or vault and must remain hidden.
- Browser requests include token material, corporation overrides, retry flags, dispatch fields, wallet or asset actions, contract actions, role changes, or external mutation fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose browser-safe latest Numbers ESI sync provenance for the active command scope.
- **FR-002**: System MUST link completed Numbers sync requests to the Numbers snapshot they produced when that relationship exists.
- **FR-003**: System MUST show source count, section health, requested timestamp, completion timestamp, and snapshot timestamp for latest live Numbers provenance.
- **FR-004**: System MUST distinguish historical processed snapshots from snapshots linked to completed ESI syncs.
- **FR-005**: System MUST expose a bounded recent Numbers sync history for the active corporation scope.
- **FR-006**: System MUST exclude sync requests from other corporation scopes, vaults, or domains not visible to the active command scope.
- **FR-007**: System MUST show queued, claimed, completed, failed, and cancelled sync statuses with browser-safe summaries.
- **FR-008**: System MUST show partial, missing, stale, or failed Numbers section states using safe reasons rather than raw ESI payloads.
- **FR-009**: System MUST show no-execution boundary language for sync history and provenance surfaces.
- **FR-010**: System MUST reject or ignore browser-provided token material, corporation overrides, retry flags, worker dispatch fields, EVE write flags, wallet actions, asset actions, contract actions, role changes, and external-service mutation fields.
- **FR-011**: System MUST NOT fetch ESI data, refresh tokens, dispatch workers, schedule retries, write to EVE, move wallets, move assets, mutate contracts, change roles, or execute external-service actions in browser or request paths.
- **FR-012**: System MUST keep access tokens, refresh tokens, sealed token material, OAuth secrets, MongoDB credentials, worker secrets, dispatch targets, retry schedules, and external execution handles out of API and browser responses.
- **FR-013**: System MUST cover latest provenance, scoped history, missing-link behavior, failed/partial outcomes, unsafe field rejection, and secret-free responses with contract/unit and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **EsiSyncHistoryItem**: Browser-safe summary of a recent ESI sync request, including status, timestamps, worker claim metadata, result or failure summary, and linked snapshot id.
- **NumbersLiveProvenance**: Browser-safe latest live sync context for a Numbers snapshot, including sync request id, completion status, source count, section health, and provenance boundary.
- **NumbersSnapshot**: Existing processed corporation health record; M14 adds browser-visible linkage to completed ESI sync provenance when available.
- **EsiSyncRequest**: Existing worker sync request record; M14 reads recent scoped records and does not mutate them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can identify whether the visible Numbers snapshot came from a completed ESI sync or from historical processed data.
- **SC-002**: A commander can review the newest recent Numbers sync attempts for the active corporation with status, timestamps, and safe result or failure summaries.
- **SC-003**: Partial and failed sync outcomes clearly identify affected Numbers sections or safe failure reasons.
- **SC-004**: Sync history and provenance responses never include token material, secret material, dispatch targets, retry schedules, raw ESI payloads, or external execution handles.
- **SC-005**: Browser-visible surfaces do not provide retry, dispatch, EVE write, wallet, asset, contract, role, or external mutation controls.
- **SC-006**: Existing command brief, decision, automation queue, people, session, ESI vault, Numbers, worker ingestion, handoff, worker callback, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M14 uses the existing completed and failed `esi_sync_requests` records written by M13.
- M14 supports the Numbers sync domain first.
- M14 reads processed `numbers_snapshots` and does not persist raw ESI payloads.
- Retry policy, commander-approved retry scheduling, and approval handoff remain future roadmap slices.
- The initial sync history display uses a bounded recent-history limit rather than pagination.
