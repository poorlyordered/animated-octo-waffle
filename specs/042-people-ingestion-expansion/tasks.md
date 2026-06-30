# Tasks: M42 People Ingestion Expansion

**Input**: Design documents from `specs/042-people-ingestion-expansion/`

## Phase 1: Setup

- [x] T001 Create M42 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M42.

## Phase 2: Implementation

- [x] T003 Add People ingestion prepare and worker contracts/schemas.
- [x] T004 Extend People ingestion history store with prepare and worker lifecycle helpers.
- [x] T005 Add commander prepare route and worker callback function.
- [x] T006 Add browser prepare control and provenance state updates.

## Phase 3: Tests

- [x] T007 Add contract coverage for prepare and worker payloads.
- [x] T008 Add unit coverage for duplicate active request and worker state transitions.
- [x] T009 Add browser smoke coverage for prepare provenance and no-execution boundary.

## Phase 4: Polish

- [x] T010 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M42 completion.
- [x] T011 Run local validation.
- [x] T012 Run code-review-and-quality gate and address required findings before commit.
