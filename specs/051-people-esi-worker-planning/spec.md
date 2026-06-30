# Feature Specification: M51 People ESI Worker Planning

**Feature Branch**: `051-people-esi-worker-planning`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Let trusted ESI workers pick up People sync work (Priority: P1)

As an operations maintainer, I need the ESI worker endpoint to list and claim queued People sync requests after explicit read consent exists, so People ESI ingestion can run outside browser request paths.

**Independent Test**: Unit tests verify `people` ESI sync requests are claimable by trusted workers while `opportunity` remains outside this worker slice.

### User Story 2 - Record externally completed People sync summaries (Priority: P1)

As a People ingestion worker owner, I need a worker-only completion callback that stores safe People sync result summaries without putting ESI fetches or raw People data in the app request path.

**Independent Test**: Contract/store tests verify the worker completion request accepts a safe result summary, persists completion for a claimed People request, and exposes no token material or execution handles.

### User Story 3 - Preserve Numbers-only in-process run behavior (Priority: P1)

As a maintainer, I need the existing ESI worker `run` action to remain Numbers-only, so the app does not silently start fetching People ESI in a request/response function.

**Independent Test**: Unit tests verify `numbers` is runnable, `people` is externally completable but not runnable, and `opportunity` is neither claimable nor completable in this slice.

## Requirements

- **FR-001**: The ESI worker list endpoint MUST return queued People sync requests when `domain=people` and the worker callback is authorized.
- **FR-002**: The ESI worker claim endpoint MUST accept queued People sync requests and continue rejecting unsupported Opportunity sync requests.
- **FR-003**: The ESI worker MUST expose a worker-only completion request schema with `workerId` and safe `result` summary.
- **FR-004**: External completion MUST be allowed for claimed People sync requests only and MUST reject unsafe worker result material before storing or echoing it.
- **FR-005**: The existing `run` action MUST remain Numbers-only in this slice.
- **FR-006**: Worker-safe responses MUST NOT include access tokens, refresh tokens, sealed token material, OAuth secrets, dispatch targets, retry scheduling handles, raw ESI payloads, role/access mutation payloads, or external execution handles.
- **FR-007**: Browser paths MUST remain read-only planning/visibility paths and MUST NOT fetch ESI, dispatch workers, write to EVE, mutate roles/access/standings, move assets/wallets/contracts, or call external services.

## Success Criteria

- **SC-001**: Targeted ESI sync worker contract/unit tests pass.
- **SC-002**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M51 Spec Kit artifacts agree on the active M51 feature while this branch is in review.
- **SC-004**: `docs/roadmap.md` includes M51 completion evidence and names M52 as the next recommended slice.

## Assumptions

- M51 defines the worker-owned People ESI lifecycle boundary. It does not implement live People ESI fetching inside Netlify functions.
- Existing ESI token vault consent and queued People sync records from M48 are prerequisites.
