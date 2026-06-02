# Implementation Plan: Sync History Provenance

**Branch**: `014-sync-history-provenance` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-sync-history-provenance/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Expose browser-safe Numbers ESI sync history and latest live provenance for processed Numbers snapshots. The implementation will extend existing ESI sync contracts and read APIs, add scoped history/provenance store helpers over existing `esi_sync_requests` and `numbers_snapshots`, and surface read-only status in the ESI sync and Numbers panels without retry scheduling, worker dispatch, token refresh, ESI fetching, or player-impacting actions in request paths.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: Existing MongoDB `esi_sync_requests` and `numbers_snapshots` collections

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Latest provenance and recent history perform bounded scoped reads. History uses a small default limit and does not scan unbounded records.

**Constraints**: Active corporation scope is server-resolved. Browser-controlled corporation IDs, token material, retry flags, worker dispatch fields, EVE write flags, wallet actions, asset actions, contract actions, role changes, and external mutation fields are rejected or ignored. Responses never include token material, worker secrets, dispatch targets, retry schedules, raw ESI payloads, or external execution handles.

**Scale/Scope**: M14 covers read-only latest live Numbers provenance, bounded recent Numbers sync history, partial/failed sync display, UI rendering, and validation. Retry policy, commander-approved retry scheduling, approval handoff, token refresh execution, EVE writes, wallet/asset/contract mutations, role changes, and external-service execution remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M14 is primarily a Numbers inspection feature, with Opportunity and People left as future consumers. It presents observations, provenance, and sync status only. No long-running sync, ESI fetch, token refresh, worker dispatch, retry scheduling, or player-impacting mutation happens in request paths. Source count, section status, timestamps, and failure summaries remain visible. Token material and worker secrets remain server-side.

Post-design gate status: PASS. The contracts require browser-safe response schemas, server-resolved scope, bounded history, explicit no-execution boundaries, and no response fields for token material, raw ESI payloads, worker credentials, dispatch targets, retry schedules, external execution handles, or player-impacting mutation targets.

## Project Structure

### Documentation (this feature)

```text
specs/014-sync-history-provenance/
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
├── esi-sync.schema.ts
└── index.ts

netlify/functions/
├── esi-sync.ts
├── numbers.ts
└── _shared/
    ├── esi-sync-request-store.ts
    ├── numbers-store.ts
    └── esi-sync-history.ts

apps/web/src/features/
├── esi-sync/
└── numbers/

apps/web/tests/
├── contract/
├── unit/
└── e2e/
```

**Structure Decision**: Extend the existing `esi-sync` and `numbers` surfaces rather than introducing a new feature area. Keep history/provenance normalization in server-only shared helpers, expose browser-safe contracts through `packages/contracts`, and render read-only status in the existing ESI sync and Numbers panels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
