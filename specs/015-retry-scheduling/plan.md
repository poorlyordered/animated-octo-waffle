# Implementation Plan: Retry Scheduling

**Branch**: `015-retry-scheduling` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/015-retry-scheduling/spec.md`

## Summary

Add commander-approved retry scheduling records for failed worker handoffs and failed Numbers ESI sync requests. The implementation will add browser-safe retry contracts, a MongoDB-backed retry request store, schedule routes on existing handoff and ESI sync APIs, and read-only UI status without dispatching workers, running retries, refreshing tokens, fetching ESI, or mutating EVE/external state.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: New MongoDB `retry_requests` collection plus reads from `worker_handoffs` and `esi_sync_requests`

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Retry scheduling performs bounded target lookup and single retry record insert-or-find.

**Constraints**: Server-resolved corporation scope, browser-safe responses, no execution in request paths, and no token/secret/execution metadata in responses.

**Scale/Scope**: M15 covers retry eligibility, scheduling records, duplicate surfacing, queue/ESI UI display, and validation. Execution, cancellation, automated backoff, and worker dispatch remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M15 affects Numbers retry visibility and worker handoff operations. Retry scheduling is an approved commander intent record, not execution. Long-running sync and worker retry execution remain outside request paths. Failure state and retry metadata are inspectable. Secrets remain server-side.

Post-design gate status: PASS. Contracts and stores enforce failed-target eligibility, scoped reads, duplicate scheduled retry surfacing, unsafe field rejection, and no execution metadata.

## Project Structure

### Documentation (this feature)

```text
specs/015-retry-scheduling/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── retry.ts
├── retry.schema.ts
└── index.ts

netlify/functions/
├── worker-handoffs.ts
├── esi-sync.ts
└── _shared/
    ├── retry-request-store.ts
    ├── worker-handoff-store.ts
    └── esi-sync-request-store.ts

apps/web/src/features/
├── automation-queue/
└── esi-sync/
```

**Structure Decision**: Add a small shared retry contract/store and expose scheduling through the existing failed-target surfaces instead of creating a new top-level command area.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
