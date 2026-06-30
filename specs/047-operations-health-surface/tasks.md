# Tasks: M47 Operations Health Surface

**Input**: Design documents from `specs/047-operations-health-surface/`

## Phase 1: Setup

- [x] T001 Create M47 branch and Spec Kit artifacts.
- [x] T002 Audit existing shared-contract, Netlify function, React route, fixture, and test patterns.
- [x] T003 Update active feature pointer and agent guide to M47.

## Phase 2: Contract And API

- [x] T004 Add operations health contract schema and exported types.
- [x] T005 Add server-side operations health summary builder with safe collection counts and secret-state summaries.
- [x] T006 Add `GET /api/operations-health` Netlify function.
- [x] T007 Add contract/unit tests for schema and safe secret-state output.

## Phase 3: Browser Surface

- [x] T008 Add operations health client and hook.
- [x] T009 Add Operations Health panel and route.
- [x] T010 Add deterministic browser fixtures for `/api/operations-health`.
- [x] T011 Add browser smoke coverage for command API, ingestion, retry, worker readiness, warnings, and boundary language.

## Phase 4: Restart Surfaces

- [x] T012 Update `README.md`, `.specify/feature.json`, and `AGENTS.md` for M47.
- [x] T013 Update `docs/roadmap.md` with M47 completion and M48 recommendation.

## Phase 5: Validation

- [x] T014 Run targeted operations health tests.
- [x] T015 Run full local validation.
- [x] T016 Run `git diff --check`.
- [x] T017 Run code-review-and-quality gate and address required findings before commit.
