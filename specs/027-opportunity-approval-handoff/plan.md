# Implementation Plan: Opportunity Approval Handoff

**Branch**: `027-opportunity-approval-handoff` | **Date**: 2026-06-04 | **Spec**: `specs/027-opportunity-approval-handoff/spec.md`

## Summary

Extend the dedicated Opportunity surface so commanders can approve or reject recorded Opportunity decisions and create queued planning work only after explicit approval.

## Technical Context

**Language/Version**: TypeScript, React, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`
**Storage**: Existing MongoDB `strategic_decisions` and `automation_queue` through current APIs
**Testing**: Jest unit tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Advances Opportunity recommendations into the commander decision loop.
- Three-Leg Data Stool: Keeps the Opportunity operating leg connected to decisions and queued work.
- Automation With Auditability: Queue creation remains explicit and auditable; no worker dispatch occurs.
- Human Authority: Approval/rejection and queue creation are commander actions.
- Durable Architecture: Reuses existing decision status and automation queue APIs.

## Scope

- Add Opportunity handoff state for approval and queue readiness.
- Add approve/reject controls after recording an Opportunity decision.
- Add queued work creation after approval only.
- Update Opportunity route wiring to use existing decision status and automation queue workflows.
- Add unit/browser fixture coverage.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- New Opportunity-specific backend route.
- Automatic queue creation during approval.
- Worker handoff preparation.
- Research scheduling, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- opportunity decision-record-api automation-queue-api`
- `npm test -- --maxWorkers=2`
- `npm run test:e2e`
- `npm run build`
