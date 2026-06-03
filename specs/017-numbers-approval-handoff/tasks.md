# Tasks: Numbers Approval Handoff

**Input**: Design documents from `specs/017-numbers-approval-handoff/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/numbers-approval-handoff-api.md`, `quickstart.md`

## Phase 1: Setup

- [x] T001 Verify active Spec Kit pointer and AGENTS plan reference for `specs/017-numbers-approval-handoff`
- [x] T002 [P] Add Numbers approval handoff contract types and schemas in `packages/contracts/src/numbers.ts` and `packages/contracts/src/numbers.schema.ts`

## Phase 2: Foundational

- [x] T003 Add approval handoff helper and unsafe field coverage in `netlify/functions/_shared/numbers-followup-actions.ts`
- [x] T004 Return approval handoff metadata from decision and queue actions in `netlify/functions/numbers.ts`

## Phase 3: User Story 1 - Inspect Follow-Up Approval State

- [x] T005 [P] [US1] Update decision response fixtures in `apps/web/tests/fixtures/numbersFollowUpActions.ts`
- [x] T006 [US1] Add contract coverage for proposed and approved handoff states in `apps/web/tests/contract/numbers-api.test.ts`
- [x] T007 [US1] Render approval handoff state in `apps/web/src/features/numbers/components/NumbersPanel.tsx`

## Phase 4: User Story 2 - Show Queue Linkage After Approved Handoff

- [x] T008 [P] [US2] Update queue response fixtures in `apps/web/tests/fixtures/numbersFollowUpActions.ts`
- [x] T009 [US2] Add contract coverage for queue linkage and duplicate handoff metadata in `apps/web/tests/contract/numbers-api.test.ts`
- [x] T010 [US2] Render queued handoff linkage in `apps/web/src/features/numbers/components/NumbersPanel.tsx`

## Phase 5: User Story 3 - Block Unsafe Approval Handoff Inputs

- [x] T011 [US3] Extend unsafe field rejection tests in `apps/web/tests/unit/numbers-followup-actions.test.ts`
- [x] T012 [US3] Update browser smoke coverage in `apps/web/e2e/numbers-followup-actions.spec.ts` and fixtures in `apps/web/e2e/fixtures/command-surfaces.ts`

## Phase 6: Polish & Cross-Cutting

- [x] T013 Update `docs/roadmap.md` and `README.md` with M17 delivered capabilities
- [x] T014 Run validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`
- [x] T015 Update `specs/017-numbers-approval-handoff/quickstart.md` with validation results

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before browser rendering.
- US1 and US2 can be implemented independently after contracts are available.
- US3 depends on the final response shape and unsafe field list.
