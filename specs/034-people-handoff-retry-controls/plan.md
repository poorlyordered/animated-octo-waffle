# Implementation Plan: M34 People Handoff Retry Controls

**Branch**: `034-people-handoff-retry-controls` | **Date**: 2026-06-30 | **Spec**: `specs/034-people-handoff-retry-controls/spec.md`

**Input**: Feature specification from `specs/034-people-handoff-retry-controls/spec.md`

## Summary

Extend People queued-work detail with failed-handoff retry controls by reusing existing worker handoff retry APIs. The People surface can schedule, reschedule, apply bounded retry delay policy, cancel retry intent, and show retry history without dispatching or executing work.

## Technical Context

**Language/Version**: TypeScript on Node 22

**Primary Dependencies**: React, Vite, Netlify Functions, MongoDB driver, Zod, Jest, Playwright

**Storage**: Existing `worker_handoffs` and `retry_requests`

**Testing**: Jest unit tests and Playwright browser smoke tests

**Target Platform**: Browser command center with existing worker handoff retry APIs

**Project Type**: Web application

**Performance Goals**: Commander-triggered retry requests only; no list-wide polling.

**Constraints**: Reuse existing retry APIs; no People-specific backend route; no dispatch, claim, retry execution, EVE role/access mutation, or external-service action.

**Scale/Scope**: People failed-handoff retry controls only.

## Constitution Check

- Command Simulation: Keeps People failed-handoff recovery in command workflow.
- Three-Leg Data Stool: Primary People slice; no Numbers or Opportunity mutation.
- Automation With Auditability: Retry metadata, policy, and history are visible.
- Human Authority: Retry actions are commander-triggered.
- Durable Architecture: Reuses existing retry contracts and worker handoff APIs.

## Project Structure

```text
specs/034-people-handoff-retry-controls/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── people-handoff-retry-api.md
├── checklists/
│   └── requirements.md
└── tasks.md

apps/web/src/features/people/components/PeopleFollowUpList.tsx
apps/web/src/routes/PeopleRoute.tsx
apps/web/e2e/command-surfaces.spec.ts
```

**Structure Decision**: Browser-only integration with existing worker handoff retry client functions.

## Complexity Tracking

No constitution violations.
