# Implementation Plan: M33 People Worker Handoff

**Branch**: `033-people-worker-handoff` | **Date**: 2026-06-30 | **Spec**: `specs/033-people-worker-handoff/spec.md`

**Input**: Feature specification from `specs/033-people-worker-handoff/spec.md`

## Summary

Extend the People follow-up surface so approved queued People work can prepare a worker handoff through the existing automation queue handoff API. Show queue and handoff detail in the People list while preserving the no-dispatch/no-execution automation boundary.

## Technical Context

**Language/Version**: TypeScript on Node 22

**Primary Dependencies**: React, Vite, Netlify Functions, MongoDB driver, Zod, Jest, Playwright

**Storage**: Existing `automation_queue` and `worker_handoffs`

**Testing**: Jest unit tests and Playwright browser smoke tests

**Target Platform**: Browser command center and existing Netlify Functions

**Project Type**: Web application with shared TypeScript contracts

**Performance Goals**: No additional list-wide backend fetches; handoff preparation is a single commander-triggered request.

**Constraints**: Reuse existing worker handoff API; no worker dispatch, claim, retry, execution, EVE role/access write, or external-service call.

**Scale/Scope**: One browser workflow slice on top of M32 People queued work.

## Constitution Check

- Command Simulation: Keeps People queued-work recovery/preparation in the command workflow.
- Three-Leg Data Stool: Primary People slice; no Numbers or Opportunity mutation.
- Automation With Auditability: Creates durable handoff metadata only.
- Human Authority: Handoff preparation is commander-triggered.
- Durable Architecture: Reuses existing automation queue handoff contracts and client.

## Project Structure

```text
specs/033-people-worker-handoff/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── people-worker-handoff-api.md
├── checklists/
│   └── requirements.md
└── tasks.md

apps/web/src/features/people/
├── components/PeopleFollowUpList.tsx
└── state/usePeople.ts

apps/web/src/routes/PeopleRoute.tsx
apps/web/e2e/command-surfaces.spec.ts
```

**Structure Decision**: Browser-only integration with the existing automation queue worker handoff client. No new backend route or storage collection.

## Complexity Tracking

No constitution violations.
