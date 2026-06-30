# Implementation Plan: M38 Decision Saved Views

**Branch**: `038-decision-saved-views` | **Date**: 2026-06-30 | **Spec**: `specs/038-decision-saved-views/spec.md`

## Summary

Add browser-local saved views to the Decision Records filter bar. Saved views capture status, source, and page size, then reapply those settings to the existing server-filtered and server-paginated Decision Records list.

## Constitution Check

- Command simulation: improves repeated decision review workflows.
- Three-leg model: saved source filters preserve Opportunity, Numbers, and People domains.
- Automation auditability: no queue, worker, retry, ESI, or external execution behavior changes.
- Human authority: saved views are read-only presentation preferences.
- Durable architecture: saved-view parsing/persistence uses typed helpers beside existing decision list settings.

## Technical Context

- Storage: browser `localStorage` only.
- Browser component: `DecisionRecordList` gains saved-view select/save/delete controls.
- Helper functions: parse/read/write/save saved views in `decisionListFilters.ts`.
- Tests: unit saved-view coverage and Decision Records browser smoke.

## Validation

- `npm test -- decision-list-filters`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

