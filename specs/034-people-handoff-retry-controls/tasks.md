# Tasks: M34 People Handoff Retry Controls

**Input**: Design documents from `specs/034-people-handoff-retry-controls/`

## Phase 1: Setup

- [x] T001 Create M34 Spec Kit artifacts in `specs/034-people-handoff-retry-controls/`.
- [x] T002 Update active feature pointer and agent guide to `specs/034-people-handoff-retry-controls`.

## Phase 2: Implementation

- [x] T003 Add People handoff retry rendering, history, and policy controls in `apps/web/src/features/people/components/PeopleFollowUpList.tsx`.
- [x] T004 Wire existing worker handoff retry client functions through `apps/web/src/routes/PeopleRoute.tsx`.
- [x] T005 Update local People handoff state after schedule, reschedule, policy delay, and cancel actions.

## Phase 3: Tests

- [x] T006 Add unit coverage for People failed-handoff retry metadata in `apps/web/tests/unit/people-followup-handoff.test.ts`.
- [x] T007 Add browser smoke coverage for People handoff retry controls in `apps/web/e2e/command-surfaces.spec.ts`.

## Phase 4: Polish

- [x] T008 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M34 completion.
- [x] T009 Run local validation: `npm test -- people`, `npm run test:e2e -- command-surfaces.spec.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] T010 Run code-review-and-quality gate and address required findings before commit.

## Dependencies & Execution Order

- T003-T005 implement the browser retry controls.
- T006-T007 verify behavior.
- T008-T010 complete release readiness.
