# Implementation Plan: M49 Production Evidence Recorder

**Branch**: `049-production-evidence-recorder` | **Date**: 2026-06-30 | **Spec**: `specs/049-production-evidence-recorder/spec.md`

## Summary

Add a structured, value-free production evidence recorder for command operators. The feature stores deployment posture metadata and validation statuses in MongoDB, scoped by the server-owned command corporation, and renders recent records in the browser without executing provider checks or deployment actions.

## Constitution Check

- Command simulation: records operational readiness decisions for the corporation command system.
- Three-leg model: preserves Numbers, Opportunity, and People boundaries by avoiding raw data capture from any operating leg.
- Automation auditability: creates durable evidence records with timestamp, operator attribution, and fixed check statuses.
- Human authority: records go/no-go posture only and performs no deploy, rollback, worker dispatch, retry execution, ESI fetch, EVE write, or external mutation.
- Durable architecture: updates shared contracts, API/storage, browser surface, fixtures/tests, roadmap docs, and active Spec Kit pointer together.

## Technical Context

- Contracts: `packages/contracts/src/production-evidence.*`.
- Server: `netlify/functions/production-evidence.ts`, `netlify/functions/_shared/production-evidence-store.ts`.
- Browser: `apps/web/src/features/production-evidence/*`, `apps/web/src/routes/ProductionEvidenceRoute.tsx`.
- Tests: production evidence contract and store boundary tests.

## Design

- Create fixed production evidence enums for environment, decision, check key, and check status.
- Persist records in `production_evidence_records` with server-resolved `corporationId`.
- Derive `recordedBy` from signed command session identity when available, otherwise mark configured command scope.
- Reject unsafe key names and value patterns before insertion.
- Render recent records and a bounded form using fixed check rows.

## Validation

- `npm test -- production-evidence`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
