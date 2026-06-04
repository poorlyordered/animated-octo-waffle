# Implementation Plan: Decision List Pagination and Persisted Filters

**Branch**: `028-decision-list-pagination-persistence` | **Date**: 2026-06-04 | **Spec**: `specs/028-decision-list-pagination-persistence/spec.md`

## Summary

Add browser-local pagination and persisted status/source/page-size filters to the decision list so growing Numbers and Opportunity decision records remain scannable without adding backend persistence.

## Technical Context

**Language/Version**: TypeScript, React, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`
**Storage**: Browser `localStorage` only
**Testing**: Jest unit tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Improves commander review of decision workload.
- Three-Leg Data Stool: Supports mixed Numbers and Opportunity decision review.
- Automation With Auditability: Organization only; no action execution.
- Human Authority: Does not mutate decisions or queued work.
- Durable Architecture: Keeps persisted browser state typed, bounded, and local.

## Scope

- Add typed filter persistence helper.
- Add pagination helper and bounded page size options.
- Update decision list UI with page size, range, and previous/next controls.
- Expand decision fixtures for pagination coverage.
- Add unit and browser smoke coverage.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- Backend filtering/pagination.
- Durable user preference storage.
- Approval mutation, queue creation, worker dispatch, retry, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- decision-list-filters decision-record-api`
- `npm test -- --maxWorkers=2`
- `npm run test:e2e`
- `npm run build`
