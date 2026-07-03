# Implementation Plan: Manual Refresh Console

**Branch**: `061-manual-refresh-console` | **Date**: 2026-07-03 | **Spec**: `specs/061-manual-refresh-console/spec.md`

**Input**: Feature specification from `specs/061-manual-refresh-console/spec.md`

## Summary

Extend the existing Intelligence Refresh Runs surface into a manual Refresh Console. The console adds readiness feedback, refresh mode selection, richer run timeline labels, durable run events, safe retry/skip intent, and board-facing status explanations without moving ESI fetches, Brain calls, worker dispatch, or external mutations into browser request paths.

## Technical Context

**Language/Version**: TypeScript on Node `22.x`

**Primary Dependencies**: React `19.x`, Vite, Netlify Functions, MongoDB driver, Zod, `@gryyk/contracts`

**Storage**: MongoDB `intelligence_refresh_runs`, new/extended refresh event data, existing ESI token vault/sync request collections, existing People/Opportunity ingestion request collections, Brain/command brief collections

**Testing**: Jest unit/contract tests, Playwright browser smoke tests, TypeScript build, ESLint

**Target Platform**: Netlify web app with serverless functions and authorized EVE SSO command sessions

**Project Type**: Web application with React frontend, shared contracts, and Netlify function backend

**Performance Goals**: Readiness and run list/detail responses complete within normal command API request budgets; recent runs/events remain bounded; command board does not start long-running work on render

**Constraints**: Signed EVE session required; no browser ESI fetch; no browser OpenRouter calls; no worker dispatch from browser paths; no request-path long-running collection/evaluation; secrets remain server-side; unsafe mutation fields are rejected

**Scale/Scope**: One corporation command scope per signed session; MVP covers readiness, run creation with mode, run detail timeline/events, retry intent, skip intent, and board status labels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Operating legs: The feature explicitly covers Numbers, Opportunity, and People refresh domains and readiness.
- Decision separation: The console creates refresh runs, retry intent, and skip intent; it does not execute EVE/player-impacting actions.
- Long-running boundary: ESI fetches, source collection, worker execution, and Brain evaluation remain worker/server-owned outside browser request paths.
- AI provenance: Brain/evaluation output continues to store prompt/model/source/confidence metadata through existing Brain and command brief linkage.
- Secret and approval boundaries: EVE SSO tokens, ESI vault secrets, OpenRouter keys, worker secrets, Mongo credentials, and player-impacting actions stay server-side.

## Project Structure

### Documentation (this feature)

```text
specs/061-manual-refresh-console/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── manual-refresh-console.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── intelligence-refresh.ts
├── intelligence-refresh.schema.ts
└── index.ts

netlify/functions/
├── intelligence-refresh.ts
└── _shared/
    ├── intelligence-refresh-store.ts
    ├── intelligence-refresh-rules.ts
    ├── auth-scope.ts
    ├── esi-token-vault-store.ts
    ├── env.ts
    └── mongo.ts

apps/web/src/
├── routes/IntelligenceRefreshRoute.tsx
├── features/intelligence-refresh/
│   ├── components/IntelligenceRefreshPanel.tsx
│   ├── services/intelligenceRefreshClient.ts
│   ├── services/intelligenceRefreshSurface.ts
│   └── state/useIntelligenceRefresh.ts
└── styles/app.css

apps/web/tests/
├── contract/
└── unit/

apps/web/e2e/
├── intelligence-refresh.spec.ts
└── command-surfaces.spec.ts
```

**Structure Decision**: Extend the existing Intelligence Refresh feature rather than add a second refresh subsystem. Shared contracts stay in `packages/contracts`; durable readiness/event/run helpers stay under Netlify `_shared`; the existing `/api/intelligence-refresh` endpoint gains bounded readiness/detail/action routes; React UI stays under `features/intelligence-refresh`.

## Complexity Tracking

No constitution violations or exceptional complexity are required. The feature builds on existing refresh-run and worker callback boundaries.

## Codebase Memory Context

The codebase memory index is available as `mnt-f-gryyk-47-greenfield` and reports the current branch `061-manual-refresh-console` at `09e442d`. Architecture search identifies the main refresh seam as `netlify/functions/_shared/intelligence-refresh-store.ts`, `netlify/functions/_shared/intelligence-refresh-rules.ts`, `netlify/functions/intelligence-refresh.ts`, `packages/contracts/src/intelligence-refresh.*`, and `apps/web/src/features/intelligence-refresh/*`.

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/manual-refresh-console.md`, and `quickstart.md`.

## Post-Design Constitution Check

- Numbers, Opportunity, and People are represented as selected refresh domains, readiness items, timeline steps, or explicit missing/blocker states.
- Retry and skip controls record commander intent only; worker execution remains separate.
- Readiness checks and board labels provide observations and next actions, not silent automation.
- Run events and timelines expose status, timestamps, failures, retries, and linked artifacts.
- Browser contracts omit secrets, raw ESI payloads, raw provider payloads, dispatch handles, and player/corporation mutation fields.
