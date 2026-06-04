# Tasks: Decision Approval Workflow Improvements

**Input**: Design documents from `specs/021-decision-approval-workflow/`

## Phase 1: Setup

- [x] T001 Create M21 branch and Spec Kit artifacts.
- [x] T002 Update active Spec Kit pointers to `specs/021-decision-approval-workflow`.

## Phase 2: Contracts And Server

- [x] T003 Add Numbers follow-up decision status contracts and schemas.
- [x] T004 Add bounded unsafe-field guard for Numbers decision status actions.
- [x] T005 Add Numbers-scoped decision status route and origin validation.

## Phase 3: Browser Workflow

- [x] T006 Add Numbers client/state status action.
- [x] T007 Add approve/reject controls and status rendering in Numbers panel.
- [x] T008 Preserve queue creation as a separate post-approval action.

## Phase 4: Tests

- [x] T009 Add contract fixtures and tests for approve/reject responses.
- [x] T010 Add unit tests for safe status fields and unsafe execution fields.
- [x] T011 Add browser smoke coverage for approve/reject and queue separation.

## Phase 5: Documentation And Validation

- [x] T012 Update README, roadmap, AGENTS, and quickstart validation results.
- [x] T013 Run lint, typecheck, targeted tests, full Jest, Playwright, and build.
