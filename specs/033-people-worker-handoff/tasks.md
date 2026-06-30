# Tasks: M33 People Worker Handoff

**Input**: Design documents from `specs/033-people-worker-handoff/`

## Phase 1: Setup

- [x] T001 Create M33 Spec Kit artifacts in `specs/033-people-worker-handoff/`.
- [x] T002 Update active feature pointer and agent guide to `specs/033-people-worker-handoff`.

## Phase 2: Implementation

- [x] T003 Add People queued-work handoff detail view model and rendering in `apps/web/src/features/people/components/PeopleFollowUpList.tsx`.
- [x] T004 Wire existing automation queue `prepareHandoff` action into `apps/web/src/routes/PeopleRoute.tsx`.
- [x] T005 Add People worker handoff local state updates after preparation in `apps/web/src/features/people/components/PeopleFollowUpList.tsx`.

## Phase 3: Tests

- [x] T006 Add unit coverage for People queued-work handoff detail in `apps/web/tests/unit/people-followup-handoff.test.ts`.
- [x] T007 Add browser smoke coverage for People worker handoff preparation in `apps/web/e2e/command-surfaces.spec.ts`.

## Phase 4: Polish

- [x] T008 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M33 completion.
- [x] T009 Run local validation: `npm test -- people`, `npm run test:e2e -- command-surfaces.spec.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] T010 Run code-review-and-quality gate and address required findings before commit.

## Dependencies & Execution Order

- T003-T005 are the implementation path.
- T006-T007 verify the new handoff behavior.
- T008-T010 complete release readiness.
