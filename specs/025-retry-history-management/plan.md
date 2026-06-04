# Implementation Plan: Retry History Management

**Branch**: `025-retry-history-management` | **Date**: 2026-06-04 | **Spec**: `specs/025-retry-history-management/spec.md`

## Summary

Expose bounded, browser-safe retry history for worker handoffs and ESI sync requests while preserving the existing latest retry field and all explicit retry scheduling/cancellation boundaries.

## Technical Context

**Language/Version**: TypeScript, React, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`, MongoDB Netlify function adapters
**Storage**: Existing MongoDB `retry_requests`
**Testing**: Jest unit/contract tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Improves commander audit of automation and read-sync recovery.
- Three-Leg Data Stool: Covers Numbers ESI sync and automation handoff retry visibility.
- Automation With Auditability: Surfaces retry status, result, block, cancellation, and policy details.
- Human Authority: History is read-only; scheduling and cancellation remain explicit commander actions.
- Durable Architecture: Reuses existing retry contracts and store instead of adding a parallel model.

## Scope

- Add optional `retryHistory` arrays to worker handoff and ESI sync history contracts.
- Add a bounded retry store list helper scoped by corporation, target type, and target id.
- Attach retry history in automation queue detail, worker handoff detail, and ESI sync status responses.
- Render retry history in the existing automation queue and ESI sync browser surfaces.
- Add unit, contract, fixture, and browser smoke coverage.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- Retry rescheduling controls.
- Retry policy configuration.
- New durable collection.
- Queue creation, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- retry-request-store worker-handoff-api esi-sync-api`
- `npm test`
- `npm run test:e2e`
- `npm run build`
