# Implementation Plan: Intelligence Refresh Runs

**Branch**: `059-intelligence-refresh-runs` | **Date**: 2026-07-03 | **Spec**: `specs/059-intelligence-refresh-runs/spec.md`

**Input**: Feature specification from `specs/059-intelligence-refresh-runs/spec.md`

## Summary

Add a durable Intelligence Refresh Run layer that lets a signed-in commander request a Numbers/Opportunity/People refresh, tracks per-domain preparation and worker-owned collection state, gates Brain evaluation on completed or explicitly partial data, and exposes browser-safe run status and final command brief linkage. The implementation reuses existing ESI sync, People ingestion, Opportunity ingestion, Brain worker, MongoDB, and command-surface patterns; it does not dispatch workers or perform long-running data pulls in browser/request paths.

## Technical Context

**Language/Version**: TypeScript on Node `22.x`

**Primary Dependencies**: React `19.x`, Vite, Netlify Functions, MongoDB driver, Zod, existing `@gryyk/contracts`

**Storage**: MongoDB collection `intelligence_refresh_runs`, plus existing `esi_sync_requests`, People ingestion history, Opportunity ingestion history, `research_requests`, and `research_briefs`

**Testing**: Jest unit/contract tests, Playwright browser smoke tests, TypeScript build, ESLint

**Target Platform**: Netlify web app with trusted external/background workers

**Project Type**: Web application with React frontend, shared contracts, and Netlify function backend

**Performance Goals**: Commander run creation and status reads complete under 2 seconds without executing long-running work; worker step transitions are single-record atomic updates where possible; browser listing remains bounded to recent runs

**Constraints**: Signed EVE session required for commander APIs in production; worker transitions require server-side worker callback secrets; EVE SSO secrets, ESI token material, worker secrets, MongoDB credentials, OpenRouter credentials, raw ESI payloads, and unsafe raw prompts stay server-side; no browser/request-path worker dispatch, ESI fetch loops, Brain calls, EVE writes, role/access/standing mutations, wallet/asset/contract mutations, or external-service execution

**Scale/Scope**: One corporation command scope per signed session; initial supported domains are Numbers, Opportunity, and People; run status history is bounded for command-center display; first implementation coordinates existing worker lifecycles rather than introducing a scheduler

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Operating legs: The feature explicitly coordinates numbers, opportunity, and people data refresh state.
- Decision separation: Refresh results and Brain output remain observations, recommendations, missing-data explanations, and draft orders only.
- Long-running boundary: Browser/request paths create durable records and read state only; workers own data collection and Brain evaluation.
- AI provenance: Evaluation links Brain run, generated command brief, source/domain step summaries, prompt version, model, confidence, timestamps, and safe failures.
- Secret and approval boundaries: Server-side sessions and worker secrets protect all transitions; token material and credentials are never browser-visible; downstream player-impacting actions remain separate approval-gated flows.

## Project Structure

### Documentation (this feature)

```text
specs/059-intelligence-refresh-runs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── intelligence-refresh-runs.md
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
├── intelligence-refresh-worker.ts
└── _shared/
    ├── intelligence-refresh-store.ts
    ├── intelligence-refresh-rules.ts
    ├── esi-sync-request-store.ts
    ├── people-ingestion-history.ts
    ├── opportunity-ingestion-history.ts
    ├── brain-store.ts
    └── worker-callback-auth.ts

apps/web/src/
├── App.tsx
├── routes/IntelligenceRefreshRoute.tsx
└── features/intelligence-refresh/
    ├── components/IntelligenceRefreshPanel.tsx
    ├── services/intelligenceRefreshClient.ts
    └── state/useIntelligenceRefresh.ts

apps/web/tests/
├── contract/
└── unit/

apps/web/e2e/
└── intelligence-refresh.spec.ts
```

**Structure Decision**: Add a new bounded `intelligence-refresh` feature that coordinates existing stores and workers by id/status rather than moving ESI, ingestion, or Brain execution into the browser request path. Keep shared contracts in `packages/contracts`, persistence/rules in `netlify/functions/_shared`, route handlers in `netlify/functions`, and command-center UI under `apps/web/src/features/intelligence-refresh`.

## Complexity Tracking

No constitution violations or exceptional complexity are required. The feature adds an orchestration record because existing independent worker records do not provide a commander-facing refresh lifecycle.

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/intelligence-refresh-runs.md`, and `quickstart.md`.

## Post-Design Constitution Check

- Numbers, Opportunity, and People are modeled as explicit domain steps with missing/stale/failed states.
- Brain evaluation remains worker-owned and stores provenance; no model output executes actions.
- Refresh creation, status read, and UI rendering are short request/response paths; long-running collection and evaluation remain behind worker callbacks.
- Browser-safe contracts reject unsafe material and omit token/credential/raw payload fields.
- Downstream decisions, queued work, retries, EVE writes, player-impacting actions, and external-service mutations remain separate explicit approvals.
