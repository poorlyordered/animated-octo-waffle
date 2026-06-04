# Implementation Plan: Retry Rescheduling Controls

**Branch**: `026-retry-rescheduling-controls` | **Date**: 2026-06-04 | **Spec**: `specs/026-retry-rescheduling-controls/spec.md`

## Summary

Add commander-visible reschedule controls for already scheduled retry requests. The slice updates safe retry metadata only and keeps retry execution worker-owned.

## Technical Context

**Language/Version**: TypeScript, React, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`, MongoDB Netlify function adapters
**Storage**: Existing MongoDB `retry_requests`
**Testing**: Jest unit/contract tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Gives commanders timing control over pending recovery work.
- Three-Leg Data Stool: Applies to Numbers ESI sync retries and automation handoff retries.
- Automation With Auditability: Updates retry reason, not-before, status, policy, and history without executing work.
- Human Authority: Rescheduling is an explicit commander action.
- Durable Architecture: Reuses existing retry contracts, routes, and store collection.

## Scope

- Add reschedule retry contract/schema and policy eligibility.
- Add store helper for scheduled retry rescheduling.
- Add worker handoff and ESI sync reschedule API actions.
- Add browser controls for scheduled handoff and ESI sync retries.
- Update fixtures, unit tests, contract tests, and browser smoke tests.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- Policy editing.
- Rescheduling blocked, claimed, completed, or canceled retries.
- Worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- retry-request-store retry-worker-api worker-handoff-api esi-sync-api`
- `npm test -- --maxWorkers=2`
- `npm run test:e2e`
- `npm run build`
