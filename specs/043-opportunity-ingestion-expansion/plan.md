# Implementation Plan: M43 Opportunity Ingestion Expansion

**Branch**: `043-opportunity-ingestion-expansion` | **Date**: 2026-06-30 | **Spec**: `specs/043-opportunity-ingestion-expansion/spec.md`

## Summary

Add worker-backed Opportunity ingestion request lifecycle support. The commander can prepare a durable Opportunity ingestion request from the browser, worker callbacks can list/claim/complete/fail queued requests, and Opportunity provenance shows current ingestion state without browser-side research scheduling, worker dispatch, ESI fetching, EVE writes, or external-service execution.

## Constitution Check

- Command simulation: improves the Opportunity operating leg with explicit ingestion readiness and auditable job state.
- Three-leg model: strengthens Opportunity while preserving existing Numbers and People boundaries.
- Automation auditability: every request has status, timestamps, worker owner, result, and failure metadata.
- Human authority: browser prepare is reversible/auditable queued work only; research execution remains a worker concern.
- Durable architecture: extends shared contracts, schemas, store helpers, and worker callback auth patterns.

## Technical Context

- Contracts: `packages/contracts/src/command-brief.ts` and `command-brief.schema.ts`.
- Commander API: `netlify/functions/command-brief.ts`.
- Worker API: new `netlify/functions/opportunity-ingestion-worker.ts`.
- Store: `netlify/functions/_shared/opportunity-ingestion-history.ts`.
- Browser: command brief client/hook, Opportunity surface hook, and Opportunity panel provenance section.
- Validation: targeted Opportunity contract/unit/browser tests plus full local gate.

## Design

- Add prepare/worker Opportunity ingestion request and response contracts.
- Extend the existing `research_requests` provenance store with create-or-find-active, list queued, find, claim, complete, and fail helpers.
- Add `POST /api/command-brief/opportunity/prepare` for commander-scoped preparation.
- Add worker-only endpoints under `/api/opportunity-ingestion-worker` for list, claim, complete, and fail.
- Update Opportunity browser state to call prepare and replace provenance with the server-returned provenance.
- Keep all response boundaries explicit that no research scheduling, worker dispatch, ESI fetch, EVE write, or external execution happens in browser request paths.

## Validation

- `npm test -- command-brief-api opportunity-ingestion-history opportunity-surface`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
