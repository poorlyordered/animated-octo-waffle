# Feature Specification: M54 Opportunity ESI Worker Planning

**Feature Branch**: `054-opportunity-esi-worker-planning`
**Created**: 2026-07-01
**Status**: Draft
**Input**: Roadmap M54: "Opportunity ESI Worker Planning. Define worker-owned Opportunity ESI sync handling after People ESI worker planning is stable."

## User Stories & Testing

### User Story 1 - Let trusted ESI workers pick up Opportunity sync work (Priority: P1)

As an operations maintainer, I need the ESI worker endpoint to list and claim queued Opportunity sync requests after explicit read consent exists, so Opportunity ESI ingestion can run outside browser request paths.

**Independent Test**: Unit tests verify `opportunity` ESI sync requests are claimable by trusted workers while the in-process `run` action remains Numbers-only.

### User Story 2 - Record externally completed Opportunity sync summaries (Priority: P1)

As an Opportunity ingestion worker owner, I need a worker-only completion callback that stores safe Opportunity sync result summaries without putting ESI fetches or raw Opportunity data in app request paths.

**Independent Test**: Contract/store tests verify an Opportunity worker completion request accepts a safe result summary, persists completion for a claimed Opportunity request, and exposes no token material or execution handles.

### User Story 3 - Preserve browser and run-action boundaries (Priority: P1)

As a commander, I need Opportunity ESI worker planning to remain worker-owned so the browser can prepare/read sync records without fetching ESI, dispatching workers, or writing to EVE.

**Independent Test**: Boundary tests verify `numbers` is runnable, `people` and `opportunity` are externally completable but not runnable, and unsafe result material is rejected before completion.

## Requirements

- **FR-001**: The ESI worker list endpoint MUST return queued Opportunity sync requests when `domain=opportunity` and the worker callback is authorized.
- **FR-002**: The ESI worker claim endpoint MUST accept queued Opportunity sync requests.
- **FR-003**: External completion MUST be allowed for claimed Opportunity sync requests through the existing worker-only complete callback.
- **FR-004**: The existing `run` action MUST remain Numbers-only.
- **FR-005**: Worker-safe responses MUST NOT include access tokens, refresh tokens, sealed token material, OAuth secrets, dispatch targets, retry scheduling handles, raw ESI payloads, role/access mutation payloads, or external execution handles.
- **FR-006**: Browser paths MUST remain read-only planning/visibility paths and MUST NOT fetch ESI, dispatch workers, write to EVE, mutate roles/access/standings, move assets/wallets/contracts, or call external services.

## Success Criteria

- **SC-001**: Targeted ESI sync worker contract/unit tests pass.
- **SC-002**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M54 Spec Kit artifacts agree on the active M54 feature while this branch is in review.
- **SC-004**: `docs/roadmap.md` includes M54 completion evidence and states no roadmap feature slices remain.

## Assumptions

- M54 defines the worker-owned Opportunity ESI lifecycle boundary. It does not implement live Opportunity ESI fetching inside Netlify functions.
- Existing ESI token vault consent and queued Opportunity sync records are prerequisites.
