# Implementation Plan: Worker Handoff For Automation Queue

**Branch**: `007-worker-handoff` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-worker-handoff/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a bounded worker handoff layer for approved automation queue items. The implementation creates durable `worker_handoffs` records from eligible queue items, returns idempotent active handoff metadata, exposes scoped handoff reads and queue-detail summaries, and keeps Netlify request handlers limited to validation plus MongoDB writes. It does not call external workers, run retries, perform EVE writes, or mutate player-impacting state.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: MongoDB `automation_queue` remains the source queue; new MongoDB `worker_handoffs` collection stores handoff records

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Handoff preparation performs bounded queue lookup, duplicate check, and single write; no request path starts long-running processing or external dispatch

**Constraints**: Session-derived corporation scope is server-owned; browser-controlled scope, worker owner, status, execution flags, and dispatch targets are ignored; secrets/tokens/credentials remain server-side; player-impacting work requires existing approval metadata

**Scale/Scope**: One handoff preparation request per queue item at a time; M7 covers handoff record creation, scoped read surfaces, and browser visibility only. Worker polling, claim/complete callbacks, retries, external dispatch, and live EVE actions are future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M7 supports numbers/opportunity/people as a handoff prerequisite, not as direct execution. It creates auditable preparation records only, preserves explicit approval checks for player-impacting queue items, performs no EVE writes or external dispatch, and keeps all worker credentials/secrets out of browser-visible data.

## Project Structure

### Documentation (this feature)

```text
specs/007-worker-handoff/
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
├── worker-handoff.ts
└── worker-handoff.schema.ts

netlify/functions/
├── worker-handoffs.ts
└── _shared/
    ├── worker-handoff-normalizer.ts
    ├── worker-handoff-rules.ts
    └── worker-handoff-store.ts

apps/web/src/features/automation-queue/
├── components/
├── services/
└── state/

apps/web/tests/unit/
apps/web/tests/contract/
apps/web/e2e/
```

**Structure Decision**: Extend the existing contracts/functions/web-feature layout. Worker handoff contracts live beside queue contracts, server normalization/rules/store modules mirror existing automation queue patterns, and browser UI extends the automation queue feature rather than adding a separate product shell.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
