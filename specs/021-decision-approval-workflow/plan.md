# Implementation Plan: Decision Approval Workflow Improvements

**Branch**: `021-decision-approval-workflow` | **Date**: 2026-06-04 | **Spec**: `specs/021-decision-approval-workflow/spec.md`

## Summary

Add a Numbers-scoped approve/reject action for existing Numbers follow-up decisions. The action updates decision status through existing decision-record rules, verifies the decision origin matches the snapshot/candidate route, returns updated approval handoff metadata, and keeps queue creation as a separate explicit browser action.

## Technical Context

**Language/Version**: TypeScript, React, Netlify Functions, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`, MongoDB driver, Zod
**Storage**: Existing `strategic_decisions`, `numbers_snapshots`, and automation queue collections
**Testing**: Jest contract/unit tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Improves the commander's decision gateway from Numbers findings to approved or rejected orders.
- Three-Leg Data Stool: Primary Numbers slice; Opportunity and People remain unaffected.
- Automation With Auditability: Approval mutates only decision status/history and returns auditable metadata.
- Human Authority: Approval/rejection is explicit commander action; player-impacting approval requires approval text.
- Durable Architecture: Reuses typed contracts, existing decision store rules, and server-owned origin checks.

## Implementation Scope

- Add Numbers follow-up decision status request/response contracts and schemas.
- Add a Numbers-specific unsafe-field guard that permits bounded status fields while rejecting execution-like inputs.
- Extend `netlify/functions/numbers.ts` with `PATCH /api/numbers/follow-ups/:candidateId/decision/status`.
- Verify snapshot/candidate selection and decision source context before mutation.
- Add approve/reject controls to the Numbers panel after a decision is recorded.
- Update API fixtures, contract tests, unit tests, and browser smoke tests.
- Update roadmap, README, AGENTS, and active Spec Kit pointer for M21.

## Out Of Scope

- Creating queued work during approval.
- Dispatching workers, claiming handoffs, scheduling retries, fetching ESI, writing to EVE, moving assets/wallets/contracts, changing roles, or executing external services.
- New durable collections or background workers.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- numbers-api numbers-followup-actions`
- `npm test`
- `npm run test:e2e`
- `npm run build`
