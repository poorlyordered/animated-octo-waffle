# Implementation Plan: M32 People Follow-Up Handoff

**Branch**: `032-people-followup-handoff` | **Date**: 2026-06-30 | **Spec**: `specs/032-people-followup-handoff/spec.md`

**Input**: Feature specification from `specs/032-people-followup-handoff/spec.md`

## Summary

Add People follow-up parity with the existing Numbers and Opportunity command loops. A commander can record a proposed decision from a leadership follow-up, approve or reject that People-origin decision, and create queued planning work only after approval. The implementation reuses existing decision-record and automation-queue persistence while deriving People-specific handoff metadata server-side.

## Technical Context

**Language/Version**: TypeScript on Node 22

**Primary Dependencies**: React, Vite, Netlify Functions, MongoDB driver, Zod, Jest, Playwright

**Storage**: Existing MongoDB `leadership_followups`, `member_profiles`, `strategic_decisions`, and `automation_queue`

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify Functions backend and browser command center frontend

**Project Type**: Web application with shared TypeScript contracts

**Performance Goals**: Use bounded point reads for follow-up, decision, and queue linkage; avoid unbounded client-side expansion beyond existing follow-up list responses.

**Constraints**: Keep server secrets server-side; derive provenance server-side; no worker dispatch, EVE write, role/access mutation, retry execution, or external-service execution.

**Scale/Scope**: One vertical command-loop slice for People follow-ups.

## Constitution Check

- Command Simulation: Advances leadership follow-ups into decisions and queued work inside the command workflow.
- Three-Leg Data Stool: Primary People slice; Numbers and Opportunity are used as parity references but not changed.
- Automation With Auditability: Queue creation prepares auditable work only and exposes status/linkage.
- Human Authority: Decision creation, approval/rejection, and queue creation are commander-triggered actions.
- Durable Architecture: Reuses typed contracts, existing decision and queue stores, and server-derived handoff metadata.

## Project Structure

### Documentation (this feature)

```text
specs/032-people-followup-handoff/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── people-followup-handoff-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── people.ts
├── people.schema.ts
└── index.ts

netlify/functions/
├── people.ts
└── _shared/
    ├── people-store.ts
    └── people-rules.ts

apps/web/src/
├── features/people/
│   ├── components/
│   └── state/
└── routes/PeopleRoute.tsx

apps/web/tests/
├── contract/people-api.test.ts
├── fixtures/people.ts
└── unit/people-followup-handoff.test.ts

apps/web/e2e/
├── command-surfaces.spec.ts
└── fixtures/
```

**Structure Decision**: Use the established shared-contract, Netlify Function, React route, Jest, and Playwright layout. Do not add a new backend service or dependency.

## Complexity Tracking

No constitution violations.
