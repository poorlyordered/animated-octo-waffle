# Implementation Plan: Decision Record Loop

**Branch**: `002-decision-record-loop` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-decision-record-loop/spec.md`

## Summary

Build the second Gryyk-47 command-system slice: a read/write decision record loop that lets the commander convert command brief recommendations into auditable decisions, preserve source provenance, update decision status, and keep player-impacting action boundaries explicit. The feature stores normalized decision records in MongoDB through short server-side APIs and does not execute game actions, external-service changes, or long-running automation.

## Technical Context

**Language/Version**: TypeScript on Node.js 22

**Primary Dependencies**: React for decision UI, Netlify serverless functions for short read/write endpoints, MongoDB driver for document persistence, Zod schemas for boundary validation

**Storage**: MongoDB Atlas operational database, extending the existing `strategic_decisions` collection with normalized decision-record fields linked to existing `research_briefs`

**Testing**: Contract tests for decision API response/request shapes, unit tests for normalization/state transitions/approval rules, component tests for create/list/detail/status flows

**Target Platform**: Web application deployed to Netlify-compatible static hosting plus serverless functions

**Project Type**: Web application with server-owned corporation scope and read/write backend adapters for decision records

**Performance Goals**: Commander can create or inspect a decision record within 10 seconds under normal network conditions; local seeded create flow completes within the spec target of 30 seconds

**Constraints**: MongoDB credentials and corporation scope remain server-side; no long-running AI/research processing in request/response functions; no player-impacting action or automation queue handoff without explicit approval; decision records must retain source provenance and missing-data context

**Scale/Scope**: Single commander view for one server-configured corporation in MVP, focused on command brief recommendations and designed for later EVE SSO, multi-corporation scope, and automation queue integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
  - Pass. Decision records retain the source brief's numbers/opportunity/people coverage and call out missing legs.
- Does it separate observations, recommendations, draft orders, and executed actions?
  - Pass. The feature records decisions and status, but does not execute actions or create automation jobs.
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
  - Pass. No AI/research processing is introduced; endpoints only read and write decision documents.
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
  - Pass. Decision records snapshot source brief provenance, including model/prompt, sources, confidence, createdAt, and coverage.
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?
  - Pass. MongoDB and corporation scope remain server-side; player-impacting progression requires explicit approval metadata and still does not execute actions.

## Project Structure

### Documentation (this feature)

```text
specs/002-decision-record-loop/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── decision-record-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── features/
│   │   ├── command-brief/
│   │   └── decision-records/
│   │       ├── components/
│   │       ├── services/
│   │       └── state/
│   └── routes/
└── tests/
    ├── component/
    ├── contract/
    └── unit/

netlify/functions/
├── command-brief.ts
├── decision-records.ts
└── _shared/

packages/contracts/
└── src/
    ├── command-brief.ts
    ├── command-brief.schema.ts
    ├── decision-record.ts
    └── decision-record.schema.ts
```

**Structure Decision**: Extend the existing monorepo-style layout. Decision records get a bounded feature module in `apps/web`, a shared contract package beside command brief contracts, and one Netlify function for short decision-list/create/update operations.

## Complexity Tracking

No constitution violations identified.

## Phase 0 Research

See [research.md](./research.md).

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/decision-record-api.md](./contracts/decision-record-api.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Operating legs remain explicit through source provenance snapshots and missing-data context.
- Decision records are separate from executed actions and automation queue entries.
- The feature does not introduce long-running request/response work.
- Source AI provenance is preserved from command brief data at decision creation time.
- Server secrets and corporation scope stay server-side; explicit approval metadata is required before player-impacting progression.
