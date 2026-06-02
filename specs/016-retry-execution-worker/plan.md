# Implementation Plan: Retry Execution Worker

**Branch**: `016-retry-execution-worker` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/016-retry-execution-worker/spec.md`

## Summary

Add a trusted-worker-only retry execution path that consumes M15 scheduled retry requests. The worker can list due scheduled retries, claim one atomically, and execute policy-safe preparation: failed worker handoff retries create a replacement ready handoff, and failed Numbers ESI sync retries create a replacement queued sync request. Browser surfaces only receive safe retry outcome summaries.

## Technical Context

**Language/Version**: TypeScript on Node-compatible Netlify Functions with React/TypeScript browser app

**Primary Dependencies**: Existing MongoDB adapter helpers, Zod contracts, Netlify Functions, React state hooks, Playwright, Vitest/Jest

**Storage**: MongoDB operational collections: `retry_requests`, `worker_handoffs`, `esi_sync_requests`, and ESI token vault metadata

**Testing**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`

**Target Platform**: Netlify server functions plus browser command surfaces

**Project Type**: Web application with server APIs and worker callback endpoints

**Performance Goals**: Ready retry listing should remain bounded and deterministic; one retry execution should create at most one replacement target.

**Constraints**: No browser/request-path retry execution, no ESI fetch, no token refresh, no EVE writes, no external worker dispatch, no raw payload or secret exposure.

**Scale/Scope**: M16 supports scheduled retry targets for `worker_handoff` and `esi_sync_request` only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Operating legs: Numbers through ESI sync retries; automation through worker handoff retries. Opportunity and People are future retry targets.
- Decision boundary: retry execution consumes prior commander-approved retry intent and reports outcomes; browser surfaces do not execute.
- Long-running work: execution is exposed only through trusted worker endpoints, not browser command endpoints.
- Metadata: retry records capture worker id, timestamps, replacement target id, status, and safe blocked reasons.
- Secret protection: worker secrets and ESI token material stay server-side and are excluded from browser responses.

## Project Structure

### Documentation (this feature)

```text
specs/016-retry-execution-worker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── retry-execution-worker-api.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── retry.ts
└── retry.schema.ts

netlify/functions/
├── retry-worker.ts
├── worker-handoffs.ts
├── esi-sync.ts
└── _shared/
    ├── retry-request-store.ts
    ├── retry-execution-service.ts
    ├── worker-handoff-store.ts
    ├── worker-handoff-normalizer.ts
    └── esi-sync-request-store.ts

apps/web/src/features/
├── automation-queue/
└── esi-sync/

apps/web/tests/
├── contract/
├── fixtures/
└── unit/

apps/web/e2e/
```

**Structure Decision**: Extend the existing contracts, Netlify functions, shared stores, React command surfaces, and existing test layout used by M15 retry scheduling and M13 worker Numbers ESI ingestion.

## Complexity Tracking

No constitution violations or extra complexity exceptions.
