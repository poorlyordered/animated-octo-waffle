# Implementation Plan: M52 Production Evidence Filtering

**Branch**: `052-production-evidence-filtering` | **Date**: 2026-07-01 | **Spec**: `specs/052-production-evidence-filtering/spec.md`

## Summary

Add browser-local filters to the Production Evidence surface for environment, decision, and check status. The filters organize already returned evidence records only and do not modify the API contract, persist preferences, or export production data.

## Constitution Check

- Command simulation: improves production release review by making evidence records easier to inspect.
- Three-leg model: preserves Numbers, Opportunity, and People boundaries by filtering value-free production posture records only.
- Automation auditability: exposes visible/total counts without changing source records.
- Human authority: no export, deploy, rollback, provider call, worker dispatch, ESI fetch, EVE write, or external mutation is introduced.
- Durable architecture: adds a small typed browser-local filter service, panel controls, unit/browser tests, and synced roadmap/spec artifacts.

## Technical Context

- Existing surface: `apps/web/src/features/production-evidence/components/ProductionEvidencePanel.tsx`
- Existing contract: `packages/contracts/src/production-evidence.*`
- New browser helper: `apps/web/src/features/production-evidence/services/productionEvidenceFilters.ts`
- Tests: `apps/web/tests/unit/production-evidence-filters.test.ts`, `apps/web/e2e/command-surfaces.spec.ts`

## Design

- Keep `/api/production-evidence` unchanged.
- Add local React state for environment, decision, and check-status filters.
- Match check status when any fixed check on a record has the selected status.
- Show visible/total counts and explicit empty states.
- Keep the Production Evidence surface free of export/deploy/rollback controls.

## Validation

- `npm test -- production-evidence`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
