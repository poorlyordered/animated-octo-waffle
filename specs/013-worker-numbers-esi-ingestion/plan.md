# Implementation Plan: Worker Numbers ESI Ingestion

**Branch**: `013-worker-numbers-esi-ingestion` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-worker-numbers-esi-ingestion/spec.md`

## Summary

Add a trusted-worker ingestion path for M12 queued ESI sync requests. The worker can claim queued Numbers sync work, load an active same-corporation token vault, unseal token material only inside server helpers, fetch read-only ESI Numbers endpoints, write a processed `numbers_snapshots` document, and mark the sync request completed or failed with safe audit metadata.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Node crypto, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: Existing `esi_sync_requests`, `esi_token_vaults`, and `numbers_snapshots` MongoDB collections

**Testing**: Jest contract/unit tests and existing Playwright browser smoke tests

**Target Platform**: Trusted worker/API helper path plus local developer environment

**Project Type**: Web application with serverless API functions and server-only worker helpers

**Performance Goals**: Worker claim and status transitions are bounded single-record updates. ESI ingestion runs only through worker-authorized paths and is isolated from browser request paths.

**Constraints**: Worker requests require `WORKER_CALLBACK_SECRET`. Token material stays server-side. Raw ESI payloads are summarized and not persisted. No EVE writes, role changes, wallet/asset movement, contract mutation, worker dispatch, retry scheduling, or external-service execution.

**Scale/Scope**: M13 covers the Numbers domain. Retry policy, scheduling, raw payload retention, people/opportunity ingestion, and commander retry approval remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M13 is a Numbers ingestion slice. It creates observations/status only, runs through worker authorization, preserves token material server-side, stores safe provenance/failure state, and performs no player-impacting EVE or external mutations.

Post-design gate status: PASS. Contracts and helpers require worker authorization, same-corporation vault/request matching, browser-safe responses, no raw token serialization, and no execution handles.

## Project Structure

### Documentation (this feature)

```text
specs/013-worker-numbers-esi-ingestion/
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
├── esi-sync.ts
└── esi-sync.schema.ts

netlify/functions/
├── esi-sync-worker.ts
└── _shared/
    ├── esi-numbers-ingestion.ts
    ├── esi-sync-request-store.ts
    ├── esi-token-vault-store.ts
    ├── numbers-store.ts
    └── worker-callback-auth.ts

apps/web/tests/
├── unit/
└── contract/
```

**Structure Decision**: Extend M12 ESI sync contracts and stores. Keep ingestion in server-only shared helpers so it can later be called by a dedicated worker runtime without changing browser contracts.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
