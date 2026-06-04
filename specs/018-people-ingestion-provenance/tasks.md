# Tasks: People Ingestion Provenance

**Input**: Design documents from `specs/018-people-ingestion-provenance/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/people-ingestion-provenance-api.md`, `quickstart.md`

## Phase 1: Setup

- [x] T001 Verify active Spec Kit pointer and AGENTS plan reference for `specs/018-people-ingestion-provenance`
- [x] T002 [P] Add People ingestion provenance contract types and schemas in `packages/contracts/src/people.ts` and `packages/contracts/src/people.schema.ts`

## Phase 2: Foundational

- [x] T003 Add People ingestion history normalization and provenance helper in `netlify/functions/_shared/people-ingestion-history.ts`
- [x] T004 Return People ingestion provenance from member list responses in `netlify/functions/people.ts`

## Phase 3: User Story 1 - Inspect People Ingestion Provenance

- [x] T005 [P] [US1] Update People fixtures in `apps/web/tests/fixtures/people.ts`
- [x] T006 [US1] Add contract coverage for provenance response parsing in `apps/web/tests/contract/people-api.test.ts`
- [x] T007 [US1] Render provenance mode, source count, profile count, and history in `apps/web/src/features/people/components/PeopleIngestionProvenancePanel.tsx`

## Phase 4: User Story 2 - See Section-Level Coverage

- [x] T008 [US2] Aggregate identity, roles, activity, and delegation status from member profile coverage
- [x] T009 [US2] Add unit coverage for aggregate coverage fallback in `apps/web/tests/unit/people-ingestion-history.test.ts`

## Phase 5: User Story 3 - Preserve Browser-Safe Boundaries

- [x] T010 [US3] Render no-execution provenance language in the People browser surface
- [x] T011 [US3] Update browser smoke fixtures and assertions in `apps/web/e2e/fixtures/command-surfaces.ts`, `apps/web/e2e/fixtures/api-fixtures.ts`, and `apps/web/e2e/command-surfaces.spec.ts`

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
