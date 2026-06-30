# Implementation Plan: M42 People Ingestion Expansion

**Branch**: `042-people-ingestion-expansion` | **Date**: 2026-06-30 | **Spec**: `specs/042-people-ingestion-expansion/spec.md`

## Summary

Add worker-backed People ingestion request lifecycle support. The commander can prepare a durable People ingestion request from the browser, worker callbacks can list/claim/complete/fail queued requests, and People provenance shows current ingestion state without browser-side ESI fetching, worker dispatch, or role/access mutation.

## Constitution Check

- Command simulation: improves the People operating leg with explicit ingestion readiness and auditable job state.
- Three-leg model: strengthens People while preserving existing Numbers and Opportunity boundaries.
- Automation auditability: every request has status, timestamps, worker owner, result, and failure metadata.
- Human authority: browser prepare is reversible/auditable queued work only; role/access changes remain outside this slice.
- Durable architecture: extends shared contracts, schemas, store helpers, and worker callback auth patterns.

## Technical Context

- Contracts: `packages/contracts/src/people.ts` and `people.schema.ts`.
- Commander API: `netlify/functions/people.ts`.
- Worker API: new `netlify/functions/people-ingestion-worker.ts`.
- Store: `netlify/functions/_shared/people-ingestion-history.ts`.
- Browser: People route, client, state hook, and provenance panel.
- Validation: targeted People contract/unit/browser tests plus full local gate.

## Design

- Add prepare/worker People ingestion request and response contracts.
- Extend the existing `people_ingestion_requests` store with create-or-find-active, list queued, find, claim, complete, and fail helpers.
- Add `POST /api/people/ingestion/prepare` for commander-scoped preparation.
- Add worker-only endpoints under `/api/people-ingestion-worker` for list, claim, complete, and fail.
- Update People browser state to call prepare and replace provenance with the server-returned provenance.
- Keep all response boundaries explicit that no ESI fetch, retry, dispatch, role/access change, or external execution happens in browser request paths.

## Validation

- `npm test -- people-api people-ingestion-history`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
