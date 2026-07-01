# Implementation Plan: Codex Review Followups

**Branch**: `055-codex-review-followups` | **Date**: 2026-07-01 | **Spec**: `specs/055-codex-review-followups/spec.md`

## Summary

Resolve actionable Codex review findings after the M32, M49, and M54 PRs. Tighten People follow-up queue readiness to People-origin decisions, reject credentialed production evidence URLs, and expose Opportunity ESI worker outcomes in read-only status history. No worker dispatch, ESI fetch, EVE write, external mutation, or browser-controlled execution is introduced.

## Constitution Check

- Command simulation: improves commander trust in People follow-up actions, production evidence, and ESI status inspection.
- Three-leg model: touches People, Opportunity, and existing Numbers visibility without changing the operating model.
- Automation auditability: keeps worker results and failures visible as safe status summaries only.
- Human authority: adds no player-impacting action, queue dispatch, EVE write, role/access mutation, wallet/asset/contract mutation, or external-service mutation.
- Durable architecture: changes existing rule/store/history helpers and regression tests rather than adding parallel mechanisms.

## Technical Context

- Contracts: existing `packages/contracts/src/people.*`, `packages/contracts/src/production-evidence.*`, and `packages/contracts/src/esi-sync.*`
- People rules/store/UI: `netlify/functions/_shared/people-rules.ts`, `netlify/functions/_shared/people-store.ts`, `apps/web/src/features/people/components/PeopleFollowUpList.tsx`
- Production evidence: `netlify/functions/_shared/production-evidence-store.ts`
- ESI status/history: `netlify/functions/esi-sync.ts`, `netlify/functions/_shared/esi-sync-request-store.ts`, `netlify/functions/_shared/esi-sync-history.ts`
- Tests: targeted unit and contract tests under `apps/web/tests`

## Design

- Reuse `assertPeopleDecisionOrigin` semantics to ensure People follow-up queue readiness and duplicate queue linkage are based on a People-origin decision for the same follow-up and member.
- Update browser fallback handoff derivation so stale linked decision metadata alone cannot expose queue creation for non-People decisions.
- Add queue duplicate validation so `sourceQueueItemId` is accepted only when its `sourceDecisionId` matches the approved People-origin decision; otherwise continue to find/create a matching queue item for the People decision.
- Extend production evidence unsafe value validation to reject URL userinfo and credential-bearing URL strings before insertion.
- Add a bounded multi-domain ESI history query or aggregation that includes Numbers and Opportunity records for commander-visible read-only status.
- Preserve existing schemas and browser-safe summary helpers; do not expose raw worker payloads, tokens, provider payloads, or execution handles.

## Data Model

- No new collection or persistent entity is introduced.
- Existing People follow-up handoff summaries gain stricter derived readiness semantics.
- Existing production evidence records keep the same fields with stricter validation.
- Existing ESI sync request records are queried across selected domains for status history.

## Contracts

- People handoff contract remains unchanged but queue-ready semantics are tightened.
- Production evidence create/list contract remains unchanged but rejects credentialed URL values.
- ESI status response contract remains unchanged; `history` may contain both Numbers and Opportunity sync history items.

## Validation

- `npm test -- people-followup`
- `npm test -- production-evidence`
- `npm test -- esi-sync`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate

## Project Structure

```text
apps/web/src/features/people/components/
└── PeopleFollowUpList.tsx

apps/web/tests/
├── contract/
└── unit/

netlify/functions/
├── esi-sync.ts
└── _shared/
    ├── esi-sync-history.ts
    ├── esi-sync-request-store.ts
    ├── people-rules.ts
    ├── people-store.ts
    └── production-evidence-store.ts

specs/055-codex-review-followups/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

**Structure Decision**: Keep the work inside existing domain modules and test suites; this is a quality follow-up slice, not a new subsystem.

## Complexity Tracking

No constitution violations or added complexity requiring justification.
