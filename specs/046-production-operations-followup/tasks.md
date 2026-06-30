# Tasks: M46 Production Operations Follow-up

**Input**: Design documents from `specs/046-production-operations-followup/`

## Phase 1: Setup

- [x] T001 Create M46 branch and Spec Kit artifacts.
- [x] T002 Audit production-readiness, worker-policy, Netlify config, env helper, and roadmap evidence.
- [x] T003 Update active feature pointer and agent guide to M46.

## Phase 2: Operations Runbook

- [x] T004 Add `docs/production-operations.md` with pre-deploy evidence requirements.
- [x] T005 Document Netlify environment verification and no-secret evidence rules.
- [x] T006 Document live EVE SSO provider verification and safe session checks.
- [x] T007 Document MongoDB backup, index, retention, restore, and least-privilege checks.
- [x] T008 Document monitoring/alerting ownership for command surfaces, providers, and workers.
- [x] T009 Document worker secret rotation posture.
- [x] T010 Document deploy smoke verification, rollback procedure, and go/no-go record.

## Phase 3: Repo Restart Surfaces

- [x] T011 Link `docs/production-readiness.md` to the M46 operations runbook.
- [x] T012 Update `README.md` current phase and start-here docs.
- [x] T013 Update `docs/roadmap.md` with M46 completion and M47 recommendation.

## Phase 4: Validation

- [x] T014 Verify M46 requirements against docs and Spec Kit artifacts.
- [x] T015 Run full local validation.
- [x] T016 Run `git diff --check`.
- [x] T017 Run code-review-and-quality gate and address required findings before commit.
