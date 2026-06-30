# Tasks: M40 Production Readiness Audit

**Input**: Design documents from `specs/040-production-readiness-audit/`

## Phase 1: Setup

- [x] T001 Create M40 Spec Kit artifacts.
- [x] T002 Update active feature pointer and agent guide to M40.

## Phase 2: Audit

- [x] T003 Audit build/deploy shape from `package.json`, `netlify.toml`, and `playwright.config.ts`.
- [x] T004 Audit server environment requirements from `README.md` and Netlify function helpers.
- [x] T005 Add production readiness audit in `docs/production-readiness.md`.
- [x] T006 Update `README.md` with the production readiness restart surface.
- [x] T007 Update `docs/roadmap.md` with M40 completion and M41 recommendation.

## Phase 3: Validation

- [x] T008 Run full local validation.
- [x] T009 Run `git diff --check`.
- [x] T010 Run code-review-and-quality gate and address required findings before commit.
