# Implementation Plan: Numbers Approval Handoff

**Branch**: `017-numbers-approval-handoff` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-numbers-approval-handoff/spec.md`

## Summary

Add computed, browser-safe approval handoff metadata to Numbers follow-up decision and queue responses. Render that metadata in the Numbers surface so commanders can see whether a Numbers-created decision is approval-blocked, queue-ready, queued, or duplicate-safe without implying execution.

## Technical Context

**Language/Version**: TypeScript on Node-compatible Netlify Functions with React/TypeScript browser app

**Primary Dependencies**: Existing contracts package, Zod schemas, Netlify Functions, React state, Jest, Playwright

**Storage**: Existing MongoDB `numbers_snapshots`, `strategic_decisions`, and `automation_queue` collections

**Testing**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`

**Target Platform**: Browser command surface and Netlify API functions

**Project Type**: Web application with server-owned command APIs

**Performance Goals**: Metadata is computed from the records already loaded for decision/queue actions; no new broad scans.

**Constraints**: No decision approval mutation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset movement, contract mutation, role change, or external execution.

**Scale/Scope**: M17 covers Numbers follow-up decision and queue action responses only.

## Constitution Check

- Operating legs: Numbers is primary; Opportunity/People context may appear through existing coverage but is not mutated.
- Decision boundary: M17 distinguishes proposed decisions, approval readiness, and queued work.
- Long-running work: no long-running work is added; browser actions remain short command artifact writes.
- Metadata: source snapshot/candidate/decision/queue linkage is returned as safe metadata.
- Secret protection: no server secrets, tokens, or execution handles are returned.

## Project Structure

```text
packages/contracts/src/numbers.ts
packages/contracts/src/numbers.schema.ts
netlify/functions/numbers.ts
netlify/functions/_shared/numbers-followup-actions.ts
apps/web/src/features/numbers/components/NumbersPanel.tsx
apps/web/tests/contract/numbers-api.test.ts
apps/web/tests/fixtures/numbersFollowUpActions.ts
apps/web/e2e/numbers-followup-actions.spec.ts
```

**Structure Decision**: Extend the existing M11 Numbers follow-up action path rather than creating a new API surface or durable collection.

## Complexity Tracking

No constitution violations or extra complexity exceptions.
