# Implementation Plan: Decision List Filters

**Branch**: `024-decision-list-filters` | **Date**: 2026-06-04 | **Spec**: `specs/024-decision-list-filters/spec.md`

## Summary

Add browser-local filtering and workload counts to the decision loop. The slice labels decisions by source domain, filters by status/source, and keeps all mutation workflows unchanged.

## Technical Context

**Language/Version**: TypeScript, React, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`
**Storage**: Existing MongoDB `strategic_decisions` through current API
**Testing**: Jest unit tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Improves commander review of decision workload.
- Three-Leg Data Stool: Distinguishes Opportunity/brief and Numbers-origin decision records.
- Automation With Auditability: Organization only; no action execution.
- Human Authority: Status mutation remains explicit in detail workflow.
- Durable Architecture: Uses existing contracts and client-side derivation.

## Scope

- Add decision filter helper.
- Add status/source filters and count summary in decision list UI.
- Add unit and browser smoke coverage.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- Backend filtering.
- New durable collection.
- New approval workflow.
- Queue creation, worker dispatch, retry, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- decision-list-filters decision-record-api`
- `npm test`
- `npm run test:e2e`
- `npm run build`
