# Implementation Plan: M37 Decision Backend Pagination

**Branch**: `037-decision-backend-pagination` | **Date**: 2026-06-30 | **Spec**: `specs/037-decision-backend-pagination/spec.md`

## Summary

Extend the Decision Records API from backend filtering to backend pagination. The browser keeps the existing filter/page-size controls, but page and page-size changes now request bounded pages from the API and render the returned metadata.

## Constitution Check

- Command simulation: improves decision archive review.
- Three-leg model: preserves source filters across Opportunity, Numbers, and People decisions.
- Automation auditability: no queue, worker, retry, ESI, or external execution behavior changes.
- Human authority: pagination is read-only.
- Durable architecture: shared contract metadata and store helper keep pagination semantics testable.

## Technical Context

- Contracts: add bounded page-size constants and pagination metadata to `DecisionRecordListResponse`.
- API: parse `page` and `pageSize` query parameters in `netlify/functions/decision-records.ts`.
- Store: count filtered records, clamp requested page, and apply `skip`/`limit`.
- Browser: request page/page-size through `useDecisionRecords` and render server pagination metadata.
- Tests: contract schema, store pagination helper, browser fixture pagination, and Decision Records browser smoke.

## Validation

- `npm test -- decision-record-api decision-list-filters decision-record-store-filters`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

