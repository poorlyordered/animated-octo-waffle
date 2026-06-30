# Implementation Plan: M47 Operations Health Surface

**Branch**: `047-operations-health-surface` | **Date**: 2026-06-30 | **Spec**: `specs/047-operations-health-surface/spec.md`

## Summary

Add a read-only operations health endpoint and browser surface. The endpoint summarizes command API readiness, ingestion histories, retry posture, worker callback secret state, and warnings using browser-safe status data only. The UI renders those summaries without action controls or live-provider/browser-side checks.

## Constitution Check

- Command simulation: gives commanders an operational status surface for the corporation command loop.
- Three-leg model: includes Numbers, Opportunity, and People ingestion posture plus shared Decision/Automation status.
- Automation auditability: surfaces worker, retry, ingestion, and handoff readiness as auditable counts/statuses.
- Human authority: provides no execution controls and preserves explicit no-dispatch/no-mutation boundary language.
- Durable architecture: uses shared contracts, a Netlify function, typed client/hook/component, fixtures, contract/unit tests, and browser smoke coverage.

## Technical Context

- Contracts: `packages/contracts/src/operations-health.*`.
- API: `netlify/functions/operations-health.ts` plus `_shared/operations-health.ts`.
- Browser: `apps/web/src/features/operations-health/*` and `apps/web/src/routes/OperationsHealthRoute.tsx`.
- Tests: contract/unit tests plus Playwright smoke fixture coverage.
- Validation: full local command gate, code-review-and-quality gate, and diff hygiene.

## Design

- Define Zod schema and TypeScript types for operations health status, command API summaries, ingestion summaries, retry posture, worker readiness, warnings, and boundary text.
- Add a server-side summary builder that:
  - reads only environment variable presence and safe collection counts
  - never returns secret values, tokens, raw ESI payloads, or dispatch targets
  - catches per-section query errors into degraded summaries rather than failing the whole health surface
- Add `GET /api/operations-health` with existing auth-scope and safe-error patterns.
- Add a typed client, hook, panel, and route appended to the current command center.
- Add browser fixtures and smoke assertions for the new surface.

## Validation

- `npm test -- operations-health`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
