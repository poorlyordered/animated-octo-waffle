# Tasks: M41 Commander Authorization Policy

**Input**: Design documents from `specs/041-commander-authorization-policy/`

## Phase 1: Setup

- [x] T001 Create M41 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M41.

## Phase 2: Implementation

- [x] T003 Add unauthorized session response contract and schema.
- [x] T004 Add corporation-match authorization policy and auth error helpers.
- [x] T005 Return safe 403 auth policy responses from command APIs.
- [x] T006 Update browser session status for unauthorized signed sessions.

## Phase 3: Tests

- [x] T007 Add unit coverage for authorized session, unauthorized signed session, fallback, and missing state.
- [x] T008 Add contract coverage for unauthorized session state.
- [x] T009 Add command API contract coverage for 403 on mismatched signed-session corporation.

## Phase 4: Polish

- [x] T010 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M41 completion.
- [x] T011 Run local validation.
- [x] T012 Run code-review-and-quality gate and address required findings before commit.
