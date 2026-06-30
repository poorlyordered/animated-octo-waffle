# Tasks: M44 Worker Policy Hardening

**Input**: Design documents from `specs/044-worker-policy-hardening/`

## Phase 1: Setup

- [x] T001 Create M44 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M44.

## Phase 2: Implementation

- [x] T003 Add worker class policy to callback authorization helper.
- [x] T004 Update worker endpoint call sites to pass explicit worker classes.
- [x] T005 Add worker policy runbook documentation and README environment notes.

## Phase 3: Tests

- [x] T006 Add unit coverage for class-specific worker secrets.
- [x] T007 Preserve unit coverage for shared fallback secret compatibility.

## Phase 4: Polish

- [x] T008 Update `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `.specify/feature.json` for M44 completion.
- [x] T009 Run local validation.
- [x] T010 Run code-review-and-quality gate and address required findings before commit.
