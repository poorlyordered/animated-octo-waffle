# Tasks: Codex Review Followups

**Input**: Design documents from `specs/055-codex-review-followups/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/codex-review-followups.md`, `quickstart.md`

## Phase 1: Setup

- [X] T001 Update Spec Kit active references in `.specify/feature.json` and `AGENTS.md`
- [X] T002 [P] Document quality follow-up scope in `docs/roadmap.md`

## Phase 2: Foundational Regression Tests

- [X] T003 [P] Add People handoff origin regression coverage in `apps/web/tests/unit/people-followup-handoff.test.ts`
- [X] T004 [P] Add People queue duplicate mismatch regression coverage in `apps/web/tests/unit/people-followup-handoff.test.ts`
- [X] T005 [P] Add credentialed URL rejection coverage in `apps/web/tests/unit/production-evidence-store.test.ts`
- [X] T006 [P] Add multi-domain ESI history coverage in `apps/web/tests/unit/esi-sync-request-store.test.ts` and `apps/web/tests/unit/esi-sync-history.test.ts`

## Phase 3: User Story 1 - Keep People follow-up queues origin-safe (Priority: P1)

**Goal**: People follow-up queue readiness and duplicate queue detection only use matching People-origin decisions.

**Independent Test**: People tests prove non-People approved decisions are not queue-ready and unrelated queue links are not treated as duplicates.

- [X] T007 [US1] Tighten People handoff origin validation in `netlify/functions/_shared/people-rules.ts`
- [X] T008 [US1] Update People queue duplicate handling in `netlify/functions/_shared/people-store.ts`
- [X] T009 [US1] Update browser fallback handoff derivation in `apps/web/src/features/people/components/PeopleFollowUpList.tsx`

## Phase 4: User Story 2 - Keep production evidence value-free (Priority: P2)

**Goal**: Credentialed URLs and token-bearing URL values are rejected before evidence persistence.

**Independent Test**: Production evidence tests reject URL userinfo while accepting normal PR URLs.

- [X] T010 [US2] Extend unsafe production evidence value validation in `netlify/functions/_shared/production-evidence-store.ts`

## Phase 5: User Story 3 - Show Opportunity ESI worker outcomes (Priority: P3)

**Goal**: Commander-visible ESI status history includes Opportunity worker completion/failure summaries without execution behavior.

**Independent Test**: ESI sync tests prove status history includes Numbers and Opportunity records with safe summaries.

- [X] T011 [US3] Add bounded multi-domain recent sync request listing in `netlify/functions/_shared/esi-sync-request-store.ts`
- [X] T012 [US3] Use Numbers and Opportunity history in read-only ESI status in `netlify/functions/esi-sync.ts`
- [X] T013 [US3] Preserve browser-safe history summaries in `netlify/functions/_shared/esi-sync-history.ts`

## Phase 6: Polish & Quality Gate

- [X] T014 Run targeted tests from `specs/055-codex-review-followups/quickstart.md`
- [X] T015 Run full validation gate from `specs/055-codex-review-followups/quickstart.md`
- [X] T016 Perform code-review-and-quality review and address required findings
- [X] T017 Commit, push, and open PR for `055-codex-review-followups`

## Dependencies

- Phase 1 before all implementation.
- Phase 2 tests before implementation tasks.
- US1, US2, and US3 are independently implementable after tests are in place.
- Full quality gate after all stories are complete.

## Parallel Opportunities

- T003-T006 can be authored in parallel.
- T007-T010 can be implemented in parallel after tests when files do not overlap.
- T011-T013 are sequential because the endpoint consumes the store helper.

## Implementation Strategy

1. Land regression tests first.
2. Fix People origin and queue linkage.
3. Fix production evidence URL validation.
4. Add Opportunity ESI history visibility.
5. Run targeted and full quality gates before PR.
