# Implementation Plan: Opportunity Decision Handoff

**Branch**: `023-opportunity-decision-handoff` | **Date**: 2026-06-04 | **Spec**: `specs/023-opportunity-decision-handoff/spec.md`

## Summary

Add decision recording from the dedicated Opportunity surface. Reuse the existing decision-record API and derive browser-safe Opportunity handoff metadata from the created decision plus Opportunity provenance.

## Technical Context

**Language/Version**: TypeScript, React, Netlify Functions, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`, existing decision-record client/hook
**Storage**: Existing MongoDB `strategic_decisions` through current API
**Testing**: Jest unit/contract tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Converts Opportunity recommendations into auditable decisions.
- Three-Leg Data Stool: Opportunity is primary; Numbers and People unchanged.
- Automation With Auditability: Handoff is inspectable and stops at proposed decision state.
- Human Authority: Approval and queueing remain separate explicit workflows.
- Durable Architecture: Reuses typed decision contracts and existing persistence.

## Implementation Scope

- Add Opportunity decision handoff view-model helper.
- Add decision-create control and summary to Opportunity panel.
- Wire Opportunity route to existing `useDecisionRecords().createDecision`.
- Add unit and browser smoke coverage.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- New backend route.
- Approval/rejection for Opportunity decisions.
- Queue creation from Opportunity decisions.
- Research scheduling, worker dispatch, retry, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- opportunity-surface command-brief-api decision-record-api`
- `npm test`
- `npm run test:e2e`
- `npm run build`
