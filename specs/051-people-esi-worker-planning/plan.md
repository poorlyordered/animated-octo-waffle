# Implementation Plan: M51 People ESI Worker Planning

**Branch**: `051-people-esi-worker-planning` | **Date**: 2026-06-30 | **Spec**: `specs/051-people-esi-worker-planning/spec.md`

## Summary

Expand the worker-owned ESI sync lifecycle so trusted `esi_sync` workers can list, claim, fail, and externally complete People sync requests. Keep the in-process `run` action restricted to Numbers ingestion and keep browser paths as read-only planning and visibility only.

## Constitution Check

- Command simulation: advances People operating data refresh through auditable worker lifecycle records.
- Three-leg model: moves People toward live read ingestion while leaving Opportunity outside this worker slice.
- Automation auditability: worker records expose status, worker id, timestamps, safe result summaries, and failures.
- Human authority: no browser dispatch, ESI fetch, EVE write, role/access mutation, or external mutation is introduced.
- Durable architecture: updates shared contracts, worker endpoint boundaries, store tests, worker contract tests, and roadmap/spec artifacts together.

## Technical Context

- Contracts: `packages/contracts/src/esi-sync.*`
- Worker endpoint: `netlify/functions/esi-sync-worker.ts`
- Store: `netlify/functions/_shared/esi-sync-request-store.ts`
- Tests: ESI sync worker contract, worker boundary, and request store tests.

## Design

- Add `EsiSyncWorkerCompleteRequest` using the existing safe `EsiSyncWorkerResultSummary`.
- Add `/api/esi-sync-worker/:id/complete` for externally completed People sync requests.
- Let worker list and claim `numbers` and `people` queued sync requests.
- Keep `/run` restricted to `numbers`, using existing Numbers ingestion.
- Allow fail callbacks only for currently supported worker domains.
- Reject unsafe worker result material before storing or echoing external People completion payloads.
- Keep `opportunity` queued sync requests planning-only for this slice.

## Validation

- `npm test -- esi-sync`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
