# Tasks: M37 Decision Backend Pagination

**Input**: Design documents from `specs/037-decision-backend-pagination/`

## Phase 1: Setup

- [x] T001 Create M37 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M37.

## Phase 2: Implementation

- [x] T003 Add decision pagination metadata contract and schema.
- [x] T004 Add backend pagination metadata helper and paged Mongo reads.
- [x] T005 Parse bounded page/page-size query params in the Decision Records function.
- [x] T006 Add decision client page/page-size query support.
- [x] T007 Store pagination metadata in decision-record state.
- [x] T008 Render server pagination metadata and request page changes from the Decision Records list.
- [x] T009 Update browser fixtures to return paginated decision responses.

## Phase 3: Tests

- [x] T010 Update contract coverage for paginated decision list responses.
- [x] T011 Add unit coverage for pagination metadata clamping.
- [x] T012 Verify browser smoke for Decision Records pagination and filters.

## Phase 4: Polish

- [x] T013 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M37 completion.
- [x] T014 Run local validation.
- [x] T015 Run code-review-and-quality gate and address required findings before commit.
