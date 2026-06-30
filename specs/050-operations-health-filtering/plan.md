# Implementation Plan: M50 Operations Health Filtering

**Branch**: `050-operations-health-filtering` | **Date**: 2026-06-30 | **Spec**: `specs/050-operations-health-filtering/spec.md`

## Summary

Add browser-local filters to the Operations Health surface for warning severity, worker readiness status, and worker secret state. The filters organize already returned health summaries only and do not modify server contracts, store preferences, or call live providers.

## Constitution Check

- Command simulation: improves operations triage for the corporation command system.
- Three-leg model: preserves existing Numbers, Opportunity, and People ingestion visibility without hiding the global health boundary.
- Automation auditability: filters expose counts against total visible summaries and do not alter source records.
- Human authority: no dispatch, retry execution, ESI fetch, EVE write, deploy, rollback, or external mutation is introduced.
- Durable architecture: adds a small typed browser-local filter service, panel controls, tests, and synced roadmap/spec artifacts.

## Technical Context

- Existing surface: `apps/web/src/features/operations-health/components/OperationsHealthPanel.tsx`
- Existing contract: `packages/contracts/src/operations-health.*`
- New browser helper: `apps/web/src/features/operations-health/services/operationsHealthFilters.ts`
- Tests: `apps/web/tests/unit/operations-health-filters.test.ts`, `apps/web/e2e/command-surfaces.spec.ts`

## Design

- Keep `/api/operations-health` unchanged.
- Add warning severity and worker readiness filters as local React state.
- Derive visible warnings and visible worker readiness from the existing response.
- Show visible/total counts and explicit empty states.
- Keep the Operations Health surface free of buttons/execution controls.

## Validation

- `npm test -- operations-health`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
