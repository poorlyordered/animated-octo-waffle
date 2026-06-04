# Tasks: Opportunity Ingestion Provenance

**Input**: Design documents from `specs/019-opportunity-ingestion-provenance/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/opportunity-ingestion-provenance-api.md`, `quickstart.md`

## Phase 1: Setup

- [x] T001 Verify active Spec Kit pointer and AGENTS plan reference for `specs/019-opportunity-ingestion-provenance`
- [x] T002 [P] Add Opportunity ingestion provenance contract types and schemas in `packages/contracts/src/command-brief.ts` and `packages/contracts/src/command-brief.schema.ts`

## Phase 2: Foundational

- [x] T003 Add Opportunity research history normalization and provenance helper in `netlify/functions/_shared/opportunity-ingestion-history.ts`
- [x] T004 Return Opportunity provenance from command brief responses in `netlify/functions/command-brief.ts`

## Phase 3: User Story 1 - Inspect Opportunity Research Provenance

- [x] T005 [P] [US1] Update command brief fixtures in `apps/web/tests/fixtures/commandBrief.ts`
- [x] T006 [US1] Add contract coverage for provenance response parsing in `apps/web/tests/contract/command-brief-api.test.ts`
- [x] T007 [US1] Render provenance mode, focus, source count, brief count, and history in `apps/web/src/features/command-brief/components/OpportunityIngestionProvenancePanel.tsx`

## Phase 4: User Story 2 - See Opportunity Section Coverage

- [x] T008 [US2] Compute sources, impacts, recommendations, and watchlist status from command brief content
- [x] T009 [US2] Add unit coverage for section status fallback in `apps/web/tests/unit/opportunity-ingestion-history.test.ts`

## Phase 5: User Story 3 - Preserve Browser-Safe Boundaries

- [x] T010 [US3] Render no-execution provenance language in the command brief browser surface
- [x] T011 [US3] Update browser smoke fixtures and assertions in `apps/web/e2e/fixtures/command-surfaces.ts` and `apps/web/e2e/command-surfaces.spec.ts`

## Phase 6: Polish & Cross-Cutting

- [x] T012 Update `docs/roadmap.md`, `README.md`, `.specify/feature.json`, and `AGENTS.md`
- [x] T013 Run validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`
- [x] T014 Update `quickstart.md` with validation results

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before browser rendering.
- US1 is the MVP slice.
- US2 depends on contract and helper availability.
- US3 depends on final response shape and browser copy.
