# Implementation Plan: M54 Opportunity ESI Worker Planning

**Branch**: `054-opportunity-esi-worker-planning` | **Date**: 2026-07-01 | **Spec**: `specs/054-opportunity-esi-worker-planning/spec.md`

## Summary

Expand the worker-owned ESI sync lifecycle so trusted `esi_sync` workers can list, claim, fail, and externally complete Opportunity sync requests. Keep the in-process `run` action restricted to Numbers ingestion and keep browser paths as read-only planning and visibility only.

## Constitution Check

- Command simulation: advances Opportunity operating data refresh through auditable worker lifecycle records.
- Three-leg model: completes worker planning coverage across Numbers, People, and Opportunity while preserving domain-specific boundaries.
- Automation auditability: worker records expose status, worker id, timestamps, safe result summaries, and failures.
- Human authority: no browser dispatch, ESI fetch, EVE write, role/access mutation, wallet/asset/contract mutation, or external mutation is introduced.
- Durable architecture: updates shared worker domain helpers, store tests, worker contract tests, and roadmap/spec artifacts together.

## Technical Context

- Contracts: `packages/contracts/src/esi-sync.*`
- Worker endpoint: `netlify/functions/esi-sync-worker.ts`
- Store: `netlify/functions/_shared/esi-sync-request-store.ts`
- Tests: ESI sync worker contract, worker boundary, and request store tests.

## Design

- Add `opportunity` to ESI sync worker claimable and externally completable domain helpers.
- Keep `/api/esi-sync-worker/:id/run` restricted to `numbers`.
- Reuse existing `/api/esi-sync-worker/:id/complete` with safe `EsiSyncWorkerResultSummary` for Opportunity sync requests.
- Allow fail callbacks for claimed Opportunity ESI sync requests.
- Keep unsafe worker result rejection before storing or echoing external completion payloads.
- Keep browser prepare/status paths as read-only planning and visibility only.

## Validation

- `npm test -- esi-sync`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
