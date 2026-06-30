# Tasks: M35 Decision Backend Filtering

**Input**: Design documents from `specs/035-decision-backend-filtering/`

## Phase 1: Setup

- [x] T001 Create M35 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M35.

## Phase 2: Implementation

- [x] T003 Add bounded decision source filter contract and schema.
- [x] T004 Add server-side decision status/source query construction.
- [x] T005 Parse decision API query filters in the Netlify function.
- [x] T006 Add decision client query parameter support.
- [x] T007 Reload decision records from the route when filters change.
- [x] T008 Keep local pagination and persisted page-size behavior unchanged.

## Phase 3: Tests

- [x] T009 Add unit coverage for browser-to-server filter mapping.
- [x] T010 Add unit coverage for Mongo query construction.
- [x] T011 Update browser fixtures so Decision Records smoke uses filtered API responses.

## Phase 4: Polish

- [x] T012 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M35 completion.
- [x] T013 Run local validation.
- [x] T014 Run code-review-and-quality gate and address required findings before commit.
