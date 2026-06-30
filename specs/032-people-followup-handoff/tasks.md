# Tasks: M32 People Follow-Up Handoff

**Input**: Design documents from `specs/032-people-followup-handoff/`

**Tests**: Required by FR-012 and the user-requested quality gate.

## Phase 1: Setup

- [x] T001 Create M32 Spec Kit artifacts in `specs/032-people-followup-handoff/`.
- [x] T002 Update active feature pointer and agent guide to `specs/032-people-followup-handoff`.

## Phase 2: Foundational

- [x] T003 Add People follow-up handoff contracts and schemas in `packages/contracts/src/people.ts` and `packages/contracts/src/people.schema.ts`.
- [x] T004 Add People follow-up handoff derivation and unsafe-field guards in `netlify/functions/_shared/people-rules.ts`.
- [x] T005 Add People store helpers for decision recording, status updates, queue creation, and follow-up linkage in `netlify/functions/_shared/people-store.ts`.

## Phase 3: User Story 1 - Record A People Follow-Up Decision (P1)

**Independent Test**: Record a decision from an open People follow-up and verify proposed handoff state without queued work.

- [x] T006 [P] [US1] Add contract and unit coverage for decision recording and duplicate decision handling in `apps/web/tests/contract/people-api.test.ts` and `apps/web/tests/unit/people-followup-handoff.test.ts`.
- [x] T007 [US1] Add `POST /api/people/follow-ups/:followUpId/decision` handling in `netlify/functions/people.ts`.
- [x] T008 [US1] Add People client state and UI controls for record-decision handoff in `apps/web/src/features/people/`.

## Phase 4: User Story 2 - Approve Or Reject A People Follow-Up Decision (P2)

**Independent Test**: Approve one People decision, reject another, and verify queue-ready vs queue-blocked states.

- [x] T009 [P] [US2] Add contract and unit coverage for approve/reject, approval text, origin validation, and unsafe-field rejection in `apps/web/tests/contract/people-api.test.ts` and `apps/web/tests/unit/people-followup-handoff.test.ts`.
- [x] T010 [US2] Add `PATCH /api/people/follow-ups/:followUpId/decision/status` handling in `netlify/functions/people.ts`.
- [x] T011 [US2] Add People UI approval and rejection controls in `apps/web/src/features/people/`.

## Phase 5: User Story 3 - Create Queued Work From Approved People Decisions (P3)

**Independent Test**: Create queued work from an approved People decision and verify linked queue state without worker dispatch.

- [x] T012 [P] [US3] Add contract and unit coverage for queue creation, queue blocking, duplicate queue linkage, and no-execution boundaries in `apps/web/tests/contract/people-api.test.ts` and `apps/web/tests/unit/people-followup-handoff.test.ts`.
- [x] T013 [US3] Add `POST /api/people/follow-ups/:followUpId/queue` handling in `netlify/functions/people.ts`.
- [x] T014 [US3] Add People UI queue creation controls and handoff display in `apps/web/src/features/people/`.
- [x] T015 [US3] Add browser smoke coverage for the People follow-up decision approval and queued-work path in `apps/web/e2e/command-surfaces.spec.ts`.

## Phase 6: Polish & Cross-Cutting

- [x] T016 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M32 completion.
- [x] T017 Run Spec Kit analysis and address any critical/high findings.
- [x] T018 Run local validation: `npm test -- people`, `npm run test:e2e -- command-surfaces.spec.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] T019 Run `code-review-and-quality` gate and address required findings before commit.

## Dependencies & Execution Order

- Setup and Foundational tasks block all stories.
- US1 must land before US2 because approval requires a linked decision.
- US2 must land before US3 because queued work requires approval.
- Polish follows all stories.

## Parallel Opportunities

- T006, T009, and T012 can be drafted independently against contracts and fixtures.
- UI and backend work can proceed in parallel after handoff contracts are stable.

## Implementation Strategy

Deliver the full M32 vertical slice in one PR because each story builds on the previous handoff state and the total change should remain reviewable.
