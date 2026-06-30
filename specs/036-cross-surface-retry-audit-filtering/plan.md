# Implementation Plan: M36 Cross-Surface Retry Audit Filtering

**Branch**: `036-cross-surface-retry-audit-filtering` | **Date**: 2026-06-30 | **Spec**: `specs/036-cross-surface-retry-audit-filtering/spec.md`

## Summary

Add a shared retry audit history component and status filter helper, then reuse it across worker handoff, ESI sync, Opportunity, and People retry histories. This keeps retry audit review consistent while remaining read-only.

## Constitution Check

- Command simulation: improves commander audit review of recovery attempts.
- Three-leg model: applies to Opportunity and People handoff retry histories and Numbers ESI sync retry histories.
- Automation auditability: exposes retry status, reasons, outcomes, and policy boundaries without changing execution.
- Human authority: no retry actions are performed by filtering.
- Durable architecture: shared helper/component replaces duplicated retry history formatting.

## Technical Context

- Retry contracts already define statuses and summary fields in `packages/contracts/src/retry.ts`.
- New helper: `apps/web/src/features/retry-audit/services/retryAuditFilters.ts`.
- New component: `apps/web/src/features/retry-audit/components/RetryAuditHistory.tsx`.
- Consumers: Automation Queue detail, ESI sync panel, Opportunity queued-work detail, People queued-work detail.
- Tests: unit helper coverage plus worker handoff and ESI browser smoke status-filter coverage.

## Validation

- `npm test -- retry-audit-filters`
- `npm run test:e2e -- worker-handoff.spec.ts esi-token-vault-sync.spec.ts command-surfaces.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

