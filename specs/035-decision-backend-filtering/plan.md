# Implementation Plan: M35 Decision Backend Filtering

**Branch**: `035-decision-backend-filtering` | **Date**: 2026-06-30 | **Spec**: `specs/035-decision-backend-filtering/spec.md`

## Summary

Move Decision Records status/source filtering into the API read path while preserving browser-local pagination and persisted page-size settings. This is a read-only organizational feature.

## Constitution Check

- Command simulation: improves decision archive review.
- Three-leg model: source filters preserve Opportunity, Numbers, and People domains.
- Automation auditability: no queue, worker, retry, ESI, or external execution behavior changes.
- Human authority: filtering is read-only and cannot approve or mutate decisions.
- Durable architecture: bounded contract values and tested query builder.

## Technical Context

- Contracts: add `DecisionRecordSourceFilter` and schema.
- API: parse bounded `status` and `source` query params in `netlify/functions/decision-records.ts`.
- Store: build Mongo query in `netlify/functions/_shared/decision-record-store.ts`.
- Browser: `DecisionRecordList` maps persisted filter settings to server filters and asks `DecisionRecordsRoute` to reload.
- Tests: unit tests for mapper/query builder and existing browser smoke with filtered fixtures.

## Validation

- `npm test -- decision-list-filters decision-record-store-filters`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

