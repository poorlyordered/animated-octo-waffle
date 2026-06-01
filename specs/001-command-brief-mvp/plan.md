# Implementation Plan: Command Brief MVP

**Branch**: `001-command-brief-mvp` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-command-brief-mvp/spec.md`

## Summary

Build the first Gryyk-47 operating-system surface: a read-only command brief that loads the latest processed corporation research brief and latest request status, then presents summary, recommendations, watchlist, metadata, and missing numbers/opportunity/people coverage. The MVP must not run AI research processing in the web request path.

## Technical Context

**Language/Version**: TypeScript on Node.js 22

**Primary Dependencies**: React for the command center UI, serverless HTTP functions for short read endpoints, MongoDB driver for document reads, Zod or equivalent schema validation for boundary data

**Storage**: MongoDB Atlas shared operational database, reading `research_briefs` and `research_requests`

**Testing**: Unit tests for data normalization and coverage derivation, component tests for UI states, contract tests for read endpoint response shapes

**Target Platform**: Web application deployed to Netlify-compatible static hosting plus serverless functions

**Project Type**: Web application with read-only backend adapters for this slice

**Performance Goals**: Commander sees useful status or brief content within 10 seconds of opening the screen under normal network conditions

**Constraints**: No long-running AI processing in request/response functions; MongoDB credentials remain server-side; all data scoped to the authenticated corporation; UI must show missing data instead of hiding it

**Scale/Scope**: Single authenticated commander view for one corporation in MVP, designed so additional focuses and corporations can be added later without changing the core contract

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
  - Pass. Spec defines all three legs and explicitly reports missing numbers/people when only opportunity data exists.
- Does it separate observations, recommendations, draft orders, and executed actions?
  - Pass. MVP is observation and recommendation only.
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
  - Pass. Processed briefs are produced externally; the app only reads stored outputs.
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
  - Pass. Contracts require createdAt, model, prompt version, source count, source references, confidence, and request status/error metadata.
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?
  - Pass. MongoDB is server-side only; no player-impacting action is in scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-command-brief-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── command-brief-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── features/command-brief/
│   │   ├── components/
│   │   ├── services/
│   │   ├── state/
│   │   └── types.ts
│   └── routes/
└── tests/
    ├── component/
    └── unit/

netlify/functions/
├── command-brief.ts
└── research-status.ts

packages/contracts/
└── command-brief.ts
```

**Structure Decision**: Use a small monorepo-style layout from the start: `apps/web` for the user interface, `netlify/functions` for short server-side read endpoints, and `packages/contracts` for shared TypeScript data contracts. This keeps the greenfield architecture clean without overbuilding worker infrastructure in the first slice.

## Complexity Tracking

No constitution violations identified.

## Phase 0 Research

See [research.md](./research.md).

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/command-brief-api.md](./contracts/command-brief-api.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Operating legs remain explicit through `OperatingLegCoverage`.
- Decision boundary remains read-only observation and recommendation.
- AI work remains outside Netlify functions.
- AI output metadata is included in command brief contracts, including prompt version and source references.
- Secrets stay server-side; client only receives sanitized response shapes.
