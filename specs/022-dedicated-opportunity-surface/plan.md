# Implementation Plan: Dedicated Opportunity Surface

**Branch**: `022-dedicated-opportunity-surface` | **Date**: 2026-06-04 | **Spec**: `specs/022-dedicated-opportunity-surface/spec.md`

## Summary

Add a first-class Opportunity browser surface that reuses existing command brief and Opportunity ingestion provenance data. The surface focuses on opportunity summary, strategic impacts, recommendations, watchlist, sources, section coverage, research history, and explicit read-only boundaries.

## Technical Context

**Language/Version**: TypeScript, React, Netlify Functions, Jest, Playwright
**Primary Dependencies**: `@gryyk/contracts`, existing command brief client/hook
**Storage**: Existing MongoDB `research_briefs` and `research_requests` through current APIs
**Testing**: Jest unit/contract tests, Playwright browser smoke tests, lint, typecheck, build
**Project Type**: Web app plus Netlify API functions

## Constitution Check

- Command Simulation: Promotes Opportunity to a command-domain surface.
- Three-Leg Data Stool: Opportunity becomes visible alongside Numbers and People.
- Automation With Auditability: Shows research/provenance state without execution controls.
- Human Authority: Recommendations remain observations; no irreversible actions occur.
- Durable Architecture: Reuses typed contracts and existing API boundaries.

## Implementation Scope

- Add Opportunity view-model derivation from `CommandBriefViewModel`.
- Add `OpportunityPanel` and `OpportunityRoute`.
- Add browser fixture and smoke coverage.
- Add unit coverage for processed and unavailable Opportunity view models.
- Update README, roadmap, AGENTS, and active Spec Kit pointer.

## Out Of Scope

- New Opportunity backend route.
- Research scheduling or worker dispatch.
- Decision creation from the new Opportunity surface.
- EVE writes, ESI fetches, wallet/asset/contract/role mutation, or external service execution.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test -- opportunity-surface command-brief-api opportunity-ingestion-history`
- `npm test`
- `npm run test:e2e`
- `npm run build`
