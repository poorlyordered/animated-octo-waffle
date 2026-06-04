# Implementation Plan: Opportunity Ingestion Provenance

**Branch**: `019-opportunity-ingestion-provenance` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-opportunity-ingestion-provenance/spec.md`

## Summary

Add browser-safe Opportunity ingestion provenance to the command brief response and command brief surface. Compute provenance from bounded recent `research_requests` records plus the latest processed command brief, then render source/brief counts, section status, recent history, focus, and explicit no-execution boundary language.

## Technical Context

**Language/Version**: TypeScript on Node-compatible Netlify Functions with React/TypeScript browser app

**Primary Dependencies**: Existing contracts package, Zod schemas, MongoDB driver, Netlify Functions, React state, Jest, Playwright

**Storage**: Existing MongoDB `research_briefs` and read-only `research_requests` records

**Testing**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`

**Target Platform**: Browser command surface and Netlify API functions

**Project Type**: Web application with server-owned command APIs

**Performance Goals**: Command brief response adds one bounded history read limited to five records and one count query scoped by corporation and focus.

**Constraints**: No research scheduling, worker dispatch, work claim, ESI fetch, EVE write, or external-service execution.

**Scale/Scope**: M19 covers command brief Opportunity provenance and browser visibility only.

## Constitution Check

- Operating legs: Opportunity is primary; Numbers and People are unchanged.
- Decision boundary: observation only; decision recording remains the existing explicit user action.
- Long-running work: no long-running work is added; research history is read-only.
- Metadata: source/brief counts, section status, history status, and failure reason/timestamp are captured as safe metadata.
- Secret protection: no server secrets, tokens, worker secrets, dispatch targets, or execution handles are returned.

## Project Structure

```text
packages/contracts/src/command-brief.ts
packages/contracts/src/command-brief.schema.ts
netlify/functions/command-brief.ts
netlify/functions/_shared/opportunity-ingestion-history.ts
apps/web/src/features/command-brief/state/useCommandBrief.ts
apps/web/src/features/command-brief/components/CommandBriefPanel.tsx
apps/web/src/features/command-brief/components/OpportunityIngestionProvenancePanel.tsx
apps/web/tests/fixtures/commandBrief.ts
apps/web/tests/contract/command-brief-api.test.ts
apps/web/tests/unit/opportunity-ingestion-history.test.ts
apps/web/e2e/fixtures/command-surfaces.ts
apps/web/e2e/command-surfaces.spec.ts
```

**Structure Decision**: Extend the existing command brief response because command briefs are the current Opportunity surface and already carry opportunity coverage.

## Complexity Tracking

No constitution violations or extra complexity exceptions.
