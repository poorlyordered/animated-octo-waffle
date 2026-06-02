# Implementation Plan: Worker Handoff Callbacks

**Branch**: `010-worker-callbacks` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-worker-callbacks/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the M7 worker handoff layer with worker-facing callback endpoints for polling ready work, atomically claiming a handoff, recording progress, completing work, and reporting failure. The implementation updates existing `worker_handoffs` records with safe claim/progress/result metadata, keeps worker credentials server-side, preserves existing commander read APIs, and does not dispatch workers, retry work, call EVE APIs, or execute player-impacting actions in request handlers.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: MongoDB `worker_handoffs` collection extended with worker claim/progress/result metadata

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Worker polling and state transitions use bounded scoped MongoDB queries/updates; callback handlers perform validation and persistence only.

**Constraints**: Worker callback secret stays server-side; browser-controlled corporation scope, status overrides, worker owner spoofing, execution flags, dispatch targets, tokens, credentials, and raw external payloads are ignored or rejected; no EVE/external mutations occur in request paths.

**Scale/Scope**: One handoff is claimed at a time by atomic update. M10 covers polling, claim, progress, completion, and failure status callbacks only. Retry policy, worker scheduling, external dispatch, token vaulting, and EVE actions remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M10 supports all three operating legs through handoff status visibility. It records observations/results from workers rather than approving or executing actions, performs no long-running processing in request paths, stores no AI output beyond safe summaries/events, and keeps worker credentials plus all player-impacting actions behind server boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/010-worker-callbacks/
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
    ├── worker-callback-auth.ts
    ├── worker-handoff-normalizer.ts
    └── worker-handoff-store.ts

apps/web/tests/
├── unit/
├── contract/
└── e2e/
```

**Structure Decision**: Extend the existing M7 worker handoff contracts/functions/store. Worker callback auth is a small server-only helper, MongoDB state transitions live in `worker-handoff-store.ts`, and browser-visible commander surfaces keep using existing handoff reads.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
