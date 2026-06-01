# Tasks: People Operating Layer

**Input**: Design documents from `/specs/004-people-operating-layer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/people-api.md, quickstart.md

**Tests**: Include contract and unit tests in Jest's Node environment. UI workflow coverage is deferred to future browser-level smoke tests so the default validation path does not depend on jsdom.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add people module structure and shared contract files without changing behavior.

- [x] T001 Create people feature directories in apps/web/src/features/people/components, apps/web/src/features/people/services, and apps/web/src/features/people/state
- [x] T002 Create people test support files in apps/web/tests/contract and apps/web/tests/unit
- [x] T003 [P] Create shared people contract files in packages/contracts/src/people.ts and packages/contracts/src/people.schema.ts
- [x] T004 Export people contracts from packages/contracts/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, validation, persistence helpers, normalization, and follow-up boundary rules required before any user story can work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Define MemberProfile, MemberRoleContext, MemberActivitySummary, PeopleDataCoverage, LeadershipFollowUp, FollowUpSourceContext, FollowUpStatus, FollowUpPriority, and API request/response types in packages/contracts/src/people.ts
- [x] T006 Define Zod schemas for member profiles, follow-ups, create requests, list/detail responses, status filters, and priority filters in packages/contracts/src/people.schema.ts
- [x] T007 [P] Add people fixture data for complete, stale, missing-data, no-follow-up, open-follow-up, blocked-follow-up, completed-follow-up, linked-decision, linked-queue, and player-impacting states in apps/web/tests/fixtures/people.ts
- [x] T008 Implement people coverage, stale-data, duplicate-follow-up, and approval-boundary helpers in netlify/functions/_shared/people-rules.ts
- [x] T009 Implement member profile and follow-up document normalizers with broad-context compatibility in netlify/functions/_shared/people-normalizer.ts
- [x] T010 Implement member_profiles and leadership_followups MongoDB adapter helpers for scoped list, find, and insert operations in netlify/functions/_shared/people-store.ts
- [x] T011 Create Netlify people function skeleton with members and follow-ups routing in netlify/functions/people.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Inspect Member Command Profiles (Priority: P1) MVP

**Goal**: Commander can list member profiles and inspect identity, role context, activity recency, delegation notes, source timestamps, and missing/stale data reasons.

**Independent Test**: Load seeded member profiles; select one member; verify identity, role context, activity summary, delegation notes, coverage, stale flags, and missing-data reasons are visible without running external sync.

### Tests for User Story 1

- [x] T012 [P] [US1] Add contract tests for GET /api/people/members and GET /api/people/members/:id in apps/web/tests/contract/people-api.test.ts
- [x] T013 [P] [US1] Add unit tests for member profile normalization, stale activity handling, missing role data, and people coverage in apps/web/tests/unit/people-normalizer.test.ts
- [x] T014 [P] [US1] Cover member list/detail data contracts and normalization in Jest without jsdom

### Implementation for User Story 1

- [x] T015 [P] [US1] Implement GET member list handling with optional activity and needsFollowUp filters in netlify/functions/people.ts
- [x] T016 [US1] Implement GET member detail handling with scoped follow-up lookup in netlify/functions/people.ts
- [x] T017 [US1] Implement people client list/detail service in apps/web/src/features/people/services/peopleClient.ts
- [x] T018 [US1] Implement people state hook with member loading, detail loading, and selection behavior in apps/web/src/features/people/state/usePeople.ts
- [x] T019 [US1] Implement PeopleMemberList component with activity and follow-up signals in apps/web/src/features/people/components/PeopleMemberList.tsx
- [x] T020 [US1] Implement PeopleMemberDetail component with role context, activity summary, coverage, stale flags, and missing-data reasons in apps/web/src/features/people/components/PeopleMemberDetail.tsx
- [x] T021 [US1] Add people route integration in apps/web/src/routes/PeopleRoute.tsx and apps/web/src/App.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Track Leadership Follow-Ups (Priority: P2)

**Goal**: Commander can create, list, and inspect leadership follow-ups for onboarding, retention, delegation, and role-review work without mutating roles or access.

**Independent Test**: Create a follow-up from a member profile; verify reason, priority, owner, due date, status `open`, source context, and no execution language or role/access mutation.

### Tests for User Story 2

- [x] T022 [P] [US2] Add contract tests for GET /api/people/follow-ups and POST /api/people/follow-ups in apps/web/tests/contract/people-api.test.ts
- [x] T023 [P] [US2] Add unit tests for follow-up source context mapping, duplicate detection, open/blocked/completed normalization, and no-execution defaults in apps/web/tests/unit/people-followup-normalizer.test.ts
- [x] T024 [P] [US2] Cover follow-up creation/list/detail contracts and boundary rules in Jest without jsdom

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement GET follow-up list handling with optional status, memberProfileId, and priority filters in netlify/functions/people.ts
- [x] T026 [US2] Implement POST follow-up creation handling in netlify/functions/people.ts
- [x] T027 [US2] Extend people client service with listFollowUps and createFollowUp calls in apps/web/src/features/people/services/peopleClient.ts
- [x] T028 [US2] Extend people state hook with follow-up loading, follow-up creation, and status filter behavior in apps/web/src/features/people/state/usePeople.ts
- [x] T029 [US2] Implement PeopleFollowUpCreate component with reason, priority, owner, due date, links, player-impacting, and approval inputs in apps/web/src/features/people/components/PeopleFollowUpCreate.tsx
- [x] T030 [US2] Implement PeopleFollowUpList component with status, priority, owner, and member grouping or filtering in apps/web/src/features/people/components/PeopleFollowUpList.tsx
- [x] T031 [US2] Render member-linked follow-ups inside PeopleMemberDetail without role/access mutation language in apps/web/src/features/people/components/PeopleMemberDetail.tsx

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Connect People Work To Decisions And Queue Items (Priority: P3)

**Goal**: Commander can link people follow-ups to decisions and automation queue items while keeping source records unchanged and unavailable links visible.

**Independent Test**: Create or inspect follow-ups linked to decision and queue fixtures; verify links are visible, missing links are marked, and neither decision nor queue status changes.

### Tests for User Story 3

- [x] T032 [P] [US3] Add contract tests for linked decision and linked queue follow-up payloads in apps/web/tests/contract/people-api.test.ts
- [x] T033 [P] [US3] Add unit tests for decision/queue link normalization and missing-link display metadata in apps/web/tests/unit/people-followup-normalizer.test.ts
- [x] T034 [P] [US3] Cover decision links, queue links, missing links, and player-impacting approval boundaries in Jest without jsdom

### Implementation for User Story 3

- [x] T035 [US3] Validate optional sourceDecisionId and sourceQueueItemId references without mutating source records in netlify/functions/_shared/people-store.ts
- [x] T036 [US3] Persist decision and queue link snapshots in follow-up source context in netlify/functions/_shared/people-normalizer.ts
- [x] T037 [US3] Surface decision, queue, and missing-link metadata in apps/web/src/features/people/components/PeopleFollowUpList.tsx
- [x] T038 [US3] Surface player-impacting approval-boundary messages in apps/web/src/features/people/components/PeopleFollowUpCreate.tsx
- [x] T039 [US3] Verify people mutation responses never emit role/access execution, EVE action, queue dispatch, or external-service success language in netlify/functions/people.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and implementation hardening across all stories.

- [x] T040 [P] Update README.md with people operating layer environment and local validation notes
- [x] T041 [P] Add validation results for People Operating Layer in specs/004-people-operating-layer/validation.md
- [x] T042 Run npm run lint and record result in specs/004-people-operating-layer/validation.md
- [x] T043 Run npm run typecheck and record result in specs/004-people-operating-layer/validation.md
- [x] T044 Run npm test and record result in specs/004-people-operating-layer/validation.md
- [x] T045 Run npm run build and record result in specs/004-people-operating-layer/validation.md
- [ ] T046 Validate quickstart flow from specs/004-people-operating-layer/quickstart.md against isolated MongoDB write target when available
- [x] T047 Review implementation against constitution gates in specs/004-people-operating-layer/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story 1 (Phase 3): depends on Foundational completion.
- User Story 2 (Phase 4): depends on Foundational completion; can be implemented after US1 or independently with fixtures.
- User Story 3 (Phase 5): depends on Foundational completion and integrates with US2 follow-up creation behavior.
- Polish (Phase 6): depends on selected user stories being complete.

### User Story Dependencies

- US1 Inspect Member Command Profiles: MVP and first delivery target.
- US2 Track Leadership Follow-Ups: independently testable after foundational services exist; composes with US1 member profiles.
- US3 Connect People Work To Decisions And Queue Items: depends on follow-up source context and link fields from US2.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001.
- T007, T008, T009, and T010 can run in parallel after T005 and T006.
- T012, T013, and T014 can run in parallel.
- T022, T023, and T024 can run in parallel.
- T032, T033, and T034 can run in parallel.
- T040 and T041 can run in parallel with final validation commands.

## Parallel Example: User Story 1

```bash
# Contract and unit tests can be written together:
Task: "T012 Add contract tests for GET people members"
Task: "T013 Add unit tests for people normalization"
Task: "T014 Cover member profile rendering data without jsdom"

# Then implementation can proceed through endpoint, client service, state, and UI.
```

## Parallel Example: User Story 2

```bash
# Follow-up tests can be written in parallel:
Task: "T022 Add contract tests for leadership follow-ups"
Task: "T023 Add unit tests for follow-up source context"
Task: "T024 Cover follow-up creation/list/detail contracts and rules"
```

## Parallel Example: User Story 3

```bash
# Link and approval-boundary tests can be written in parallel:
Task: "T032 Add contract tests for linked follow-ups"
Task: "T033 Add unit tests for missing-link metadata"
Task: "T034 Cover linked follow-up metadata and approval boundaries"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate that a commander can inspect member profiles with grounded people data and missing/stale indicators.
4. Stop for review before expanding follow-up creation and decision/queue linking if needed.

### Incremental Delivery

1. US1 delivers people visibility through member profiles.
2. US2 adds durable leadership follow-up tracking.
3. US3 links people work to decisions and queue items while preserving non-execution boundaries.
4. Polish records validation and quickstart evidence.
