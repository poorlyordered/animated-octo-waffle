# Tasks: M48 Live Read Consent Expansion

**Input**: Design documents from `specs/048-live-read-consent-expansion/`

## Phase 1: Setup

- [x] T001 Create M48 branch and Spec Kit artifacts.
- [x] T002 Audit existing ESI vault, sync request, worker, fixture, and browser smoke patterns.
- [x] T003 Update active feature pointer and agent guide to M48.

## Phase 2: Consent Domain Expansion

- [x] T004 Add People and Opportunity to the shared ESI sync domain contract.
- [x] T005 Add read-only scope mappings for People and Opportunity.
- [x] T006 Reuse prepare sync flow for duplicate-safe People and Opportunity queued requests.
- [x] T007 Restrict ESI sync worker execution to Numbers in this slice.

## Phase 3: Tests And Browser Fixtures

- [x] T008 Update ESI sync fixtures for multi-domain consent.
- [x] T009 Add/adjust targeted contract and unit tests.
- [x] T010 Update browser smoke coverage for multi-domain read-sync preparation.

## Phase 4: Restart Surfaces

- [x] T011 Update `README.md`, `.specify/feature.json`, and `AGENTS.md` for M48.
- [x] T012 Update `docs/roadmap.md` with M48 completion and M49 recommendation.

## Phase 5: Validation

- [x] T013 Run targeted ESI sync tests.
- [x] T014 Run full local validation.
- [x] T015 Run `git diff --check`.
- [x] T016 Run code-review-and-quality gate and address required findings before commit.
