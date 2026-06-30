# Tasks: M36 Cross-Surface Retry Audit Filtering

**Input**: Design documents from `specs/036-cross-surface-retry-audit-filtering/`

## Phase 1: Setup

- [x] T001 Create M36 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M36.

## Phase 2: Implementation

- [x] T003 Add shared retry audit status filter helper.
- [x] T004 Add shared retry audit history component.
- [x] T005 Replace Automation Queue retry history rendering with shared component.
- [x] T006 Replace ESI sync retry history rendering with shared component.
- [x] T007 Replace Opportunity retry history rendering with shared component.
- [x] T008 Replace People retry history rendering with shared component.

## Phase 3: Tests

- [x] T009 Add unit coverage for retry audit filtering and summary preservation.
- [x] T010 Add worker handoff browser coverage for filtered retry history states.
- [x] T011 Add ESI sync browser coverage for filtered retry history states.

## Phase 4: Polish

- [x] T012 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M36 completion.
- [x] T013 Run local validation.
- [x] T014 Run code-review-and-quality gate and address required findings before commit.
