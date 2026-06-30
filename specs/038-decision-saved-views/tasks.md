# Tasks: M38 Decision Saved Views

**Input**: Design documents from `specs/038-decision-saved-views/`

## Phase 1: Setup

- [x] T001 Create M38 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M38.

## Phase 2: Implementation

- [x] T003 Add browser-local saved-view model and persistence helpers.
- [x] T004 Add saved-view select, save, and delete controls to the Decision Records filter bar.
- [x] T005 Apply saved views by restoring status, source, and page size and resetting page to 1.
- [x] T006 Keep saved views local-only with no backend route or server preference storage.

## Phase 3: Tests

- [x] T007 Add unit coverage for saved-view parsing, persistence, and duplicate-safe saves.
- [x] T008 Add browser smoke coverage for save, apply, and delete behavior.

## Phase 4: Polish

- [x] T009 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M38 completion.
- [x] T010 Run local validation.
- [x] T011 Run code-review-and-quality gate and address required findings before commit.
