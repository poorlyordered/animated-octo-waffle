# Implementation Plan: People Operating Layer

**Branch**: `004-people-operating-layer` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-people-operating-layer/spec.md`

## Summary

Build the fourth Gryyk-47 command-system slice: a people operating layer that surfaces member profiles, role/activity context, missing or stale people data, and leadership follow-ups without performing EVE role/access changes or long-running sync work. The implementation extends the existing TypeScript/React/Netlify/MongoDB architecture with people contracts, short server-side people APIs, a bounded web feature module, and isolated write-target validation for follow-up creation.

## Technical Context

**Language/Version**: TypeScript on Node.js 22

**Primary Dependencies**: React for people UI, Netlify serverless functions for short people endpoints, MongoDB driver for document persistence, Zod schemas for boundary validation

**Storage**: MongoDB Atlas operational database. Read member profile context from a dedicated `member_profiles` collection when present, with compatibility normalization for existing broader corporation context documents where practical. Store leadership follow-ups in a dedicated `leadership_followups` collection.

**Testing**: Contract tests for people API shapes and approval boundaries, unit tests for member/follow-up normalization and stale/missing-data coverage, component tests for member list/detail/follow-up flows, isolated MongoDB write-flow validation before real people sync or access-change integration

**Target Platform**: Web application deployed to Netlify-compatible static hosting plus serverless functions

**Project Type**: Web application with server-owned corporation scope and read/write backend adapters for people records and leadership follow-ups

**Performance Goals**: Commander can load the people screen or create a follow-up within 10 seconds under normal network conditions; local seeded create flow completes within 30 seconds

**Constraints**: MongoDB credentials and corporation scope remain server-side; no long-running ESI sync, enrichment, role/access mutations, permission changes, standings changes, wallet actions, contract actions, or external-service mutations in request/response functions; player-impacting follow-ups require explicit approval metadata before future action handling

**Scale/Scope**: Single commander view for one server-configured corporation in MVP, focused on member visibility and leadership follow-up records, designed for later EVE SSO, member sync workers, multi-user assignment, and Aegis-hosted background processing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
  - Pass. M4 is centered on the people leg and exposes measurable activity/follow-up data plus opportunity signals such as delegation, recruiting, onboarding, and retention gaps.
- Does it separate observations, recommendations, draft orders, and executed actions?
  - Pass. Member profiles are observations; leadership follow-ups are draft work. M4 does not execute role, access, permission, standing, wallet, contract, or external-service changes.
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
  - Pass. Endpoints only read/write people records and follow-ups. ESI/member sync or enrichment workers are out of scope.
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
  - Pass. M4 does not create AI output. People records expose source timestamps, stale flags, and missing-data reasons.
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?
  - Pass. MongoDB credentials and corporation scope stay server-side; player-impacting people follow-ups are recorded as follow-ups only and cannot execute actions.

## Project Structure

### Documentation (this feature)

```text
specs/004-people-operating-layer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── people-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── features/
│   │   └── people/
│   │       ├── components/
│   │       ├── services/
│   │       └── state/
│   └── routes/
└── tests/
    ├── component/
    ├── contract/
    └── unit/

netlify/functions/
├── people.ts
└── _shared/

packages/contracts/
└── src/
    ├── people.ts
    └── people.schema.ts
```

**Structure Decision**: Extend the existing monorepo-style layout. People gets a bounded feature module in `apps/web`, shared contract schemas beside command/decision/queue contracts, and one Netlify function for short people-list/detail/follow-up operations. EVE sync and access changes remain outside this repository slice.

## Complexity Tracking

No constitution violations identified.

## Phase 0 Research

See [research.md](./research.md).

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/people-api.md](./contracts/people-api.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- People data is presented as observed context with missing/stale source indicators.
- Leadership follow-ups are draft work records, not executed actions.
- The feature does not introduce long-running request/response work.
- No new AI output is created; source timestamps and stale/missing flags are preserved.
- Server secrets and corporation scope stay server-side; player-impacting role/access work remains approval-gated and non-executing.
