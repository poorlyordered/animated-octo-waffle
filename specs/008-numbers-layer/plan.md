# Implementation Plan: Numbers Operating Layer

**Branch**: `008-numbers-layer` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-numbers-layer/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a read-only Numbers operating surface that loads the latest scoped processed numbers snapshot from MongoDB `numbers_snapshots`, normalizes wallet/assets/logistics/market/activity sections, makes missing and stale data explicit, displays provenance, and presents follow-up candidates as planning recommendations only. The slice does not call EVE APIs, perform wallet/asset/logistics actions, dispatch workers, or mutate external services.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: MongoDB `numbers_snapshots` collection for processed read-only numbers snapshots

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Numbers endpoint performs a bounded latest-snapshot query by corporation scope and returns normalized data quickly; no request path performs ESI sync or external calls

**Constraints**: Session-derived corporation scope is server-owned; browser-controlled corporation IDs and action-like inputs are ignored; secrets/tokens/credentials remain server-side; all wallet/assets/logistics outputs are observations or recommendations only

**Scale/Scope**: One latest processed snapshot per corporation/focus is surfaced in M8. Live EVE ESI ingestion, token handling, historical analytics, charting, write actions, and decision/queue creation from numbers recommendations are future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M8 is primarily the numbers leg and connects opportunity/people only through display-safe recommendations. It separates observations and recommendations from actions, stores/reads provenance metadata when present, performs no long-running sync in request paths, and keeps all secrets/tokens server-side.

## Project Structure

### Documentation (this feature)

```text
specs/008-numbers-layer/
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
├── numbers.ts
└── numbers.schema.ts

netlify/functions/
├── numbers.ts
└── _shared/
    ├── numbers-normalizer.ts
    └── numbers-store.ts

apps/web/src/
├── routes/NumbersRoute.tsx
└── features/numbers/
    ├── components/
    ├── services/
    └── state/

apps/web/tests/unit/
apps/web/tests/contract/
apps/web/e2e/
```

**Structure Decision**: Extend the existing contracts/functions/web-feature layout. Numbers contracts live beside command/queue/people contracts, Netlify shared modules mirror existing normalizer/store patterns, and the web surface is a bounded feature module rendered in the existing command shell.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
