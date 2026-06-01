# Implementation Plan: Automation Queue

**Branch**: `003-automation-queue` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-automation-queue/spec.md`

## Summary

Build the third Gryyk-47 command-system slice: an auditable automation queue that lets the commander create and inspect queue records from approved decision records while preserving approval boundaries and avoiding worker execution. The implementation extends the existing TypeScript/React/Netlify/MongoDB architecture with queue contracts, a short server-side queue API, a bounded web feature module, and isolated write-target validation.

## Technical Context

**Language/Version**: TypeScript on Node.js 22

**Primary Dependencies**: React for queue UI, Netlify serverless functions for short queue endpoints, MongoDB driver for document persistence, Zod schemas for boundary validation

**Storage**: MongoDB Atlas operational database, adding an `automation_queue` collection linked to `strategic_decisions`

**Testing**: Contract tests for queue API shapes and approval boundaries, unit tests for queue normalization and eligibility rules, component tests for queue creation/list/detail flows, isolated MongoDB write-flow validation before real worker integration

**Target Platform**: Web application deployed to Netlify-compatible static hosting plus serverless functions

**Project Type**: Web application with server-owned corporation scope and read/write backend adapters for queue records

**Performance Goals**: Commander can create or inspect a queue item within 10 seconds under normal network conditions; local seeded create flow completes within 30 seconds

**Constraints**: MongoDB credentials and corporation scope remain server-side; no long-running AI/research/sync processing in request/response functions; no worker dispatch, retry, EVE write, access-control mutation, wallet action, contract action, standings change, or external-service mutation in M3; player-impacting queue creation requires explicit approval already present on the source decision

**Scale/Scope**: Single commander view for one server-configured corporation in MVP, focused on queue records created from approved decisions and designed for later worker dispatch, EVE SSO, multi-user assignment, and retry handling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
  - Pass. Queue records preserve decision and source provenance, including available numbers/opportunity/people context and missing-data explanations from the originating decision.
- Does it separate observations, recommendations, draft orders, and executed actions?
  - Pass. M3 creates queued work items from approved decisions but does not execute actions or mark work as performed by the system.
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
  - Pass. Endpoints only create/list/read queue records; worker execution and retries are explicitly out of scope.
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
  - Pass. Queue provenance snapshots source decision and brief metadata where available. Queue records expose failure/output fields when future workers write them but do not create AI output in this slice.
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?
  - Pass. MongoDB credentials and corporation scope stay server-side; player-impacting queue creation is rejected unless source decision approval metadata exists.

## Project Structure

### Documentation (this feature)

```text
specs/003-automation-queue/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── automation-queue-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── features/
│   │   ├── decision-records/
│   │   └── automation-queue/
│   │       ├── components/
│   │       ├── services/
│   │       └── state/
│   └── routes/
└── tests/
    ├── component/
    ├── contract/
    └── unit/

netlify/functions/
├── decision-records.ts
├── automation-queue.ts
└── _shared/

packages/contracts/
└── src/
    ├── decision-record.ts
    ├── decision-record.schema.ts
    ├── automation-queue.ts
    └── automation-queue.schema.ts
```

**Structure Decision**: Extend the existing monorepo-style layout. Automation Queue gets a bounded feature module in `apps/web`, shared contract schemas beside decision contracts, and one Netlify function for short queue-list/create/detail operations. Worker dispatch remains outside this repository slice.

## Complexity Tracking

No constitution violations identified.

## Phase 0 Research

See [research.md](./research.md).

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/automation-queue-api.md](./contracts/automation-queue-api.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Operating legs remain visible through queue provenance copied from the source decision and command brief context where available.
- Queue records are draft work orders, not executed actions.
- The feature does not introduce long-running request/response work.
- Existing AI provenance is preserved from source decision and brief data; M3 does not create new AI output.
- Server secrets and corporation scope stay server-side; player-impacting queue creation remains approval-gated.
