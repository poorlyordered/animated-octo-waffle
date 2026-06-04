# Implementation Plan: People Ingestion Provenance

**Branch**: `018-people-ingestion-provenance` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-people-ingestion-provenance/spec.md`

## Summary

Add browser-safe People ingestion provenance to the member list response and People surface. Compute provenance from bounded recent `people_ingestion_requests` records plus existing `member_profiles` coverage, then render source/profile counts, section status, recent history, and explicit no-execution boundary language.

## Technical Context

**Language/Version**: TypeScript on Node-compatible Netlify Functions with React/TypeScript browser app

**Primary Dependencies**: Existing contracts package, Zod schemas, MongoDB driver, Netlify Functions, React state, Jest, Playwright

**Storage**: Existing MongoDB `member_profiles` and read-only `people_ingestion_requests` records

**Testing**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`

**Target Platform**: Browser command surface and Netlify API functions

**Project Type**: Web application with server-owned command APIs

**Performance Goals**: Member list adds one bounded history read sorted by request/create timestamp and limited to five records.

**Constraints**: No retry scheduling, worker dispatch, work claim, ESI fetch, EVE write, role mutation, access mutation, or external-service execution.

**Scale/Scope**: M18 covers People member list provenance and browser visibility only.

## Constitution Check

- Operating legs: People is primary; Numbers contributes only the proven sync visibility pattern; Opportunity remains future work.
- Decision boundary: observation only; no decision approval or action execution is added.
- Long-running work: no long-running work is added; ingestion history is read-only.
- Metadata: source/profile counts, section status, history status, and failure reason/timestamp are captured as safe metadata.
- Secret protection: no server secrets, tokens, worker secrets, role mutation handles, or execution handles are returned.

## Project Structure

```text
packages/contracts/src/people.ts
packages/contracts/src/people.schema.ts
netlify/functions/people.ts
netlify/functions/_shared/people-store.ts
netlify/functions/_shared/people-ingestion-history.ts
apps/web/src/features/people/state/usePeople.ts
apps/web/src/features/people/components/PeopleIngestionProvenancePanel.tsx
apps/web/src/routes/PeopleRoute.tsx
apps/web/tests/fixtures/people.ts
apps/web/tests/contract/people-api.test.ts
apps/web/tests/unit/people-ingestion-history.test.ts
apps/web/e2e/fixtures/api-fixtures.ts
apps/web/e2e/fixtures/command-surfaces.ts
apps/web/e2e/command-surfaces.spec.ts
```

**Structure Decision**: Extend the existing People member list path instead of adding a separate endpoint because provenance belongs beside the member list it explains.

## Complexity Tracking

No constitution violations or extra complexity exceptions.
