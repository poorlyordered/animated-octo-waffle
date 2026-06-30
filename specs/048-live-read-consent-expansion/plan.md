# Implementation Plan: M48 Live Read Consent Expansion

**Branch**: `048-live-read-consent-expansion` | **Date**: 2026-06-30 | **Spec**: `specs/048-live-read-consent-expansion/spec.md`

## Summary

Expand the explicit ESI read-consent domain model from Numbers-only to Numbers, People, and Opportunity. The browser can prepare duplicate-safe queued sync records for the new domains when scopes are available, while worker execution remains restricted to Numbers.

## Constitution Check

- Command simulation: broadens read-consent planning across the Numbers, People, and Opportunity operating legs.
- Three-leg model: explicitly exposes all three read-sync domains in the vault surface.
- Automation auditability: prepared requests remain auditable queued records with status, scopes, timestamps, and boundaries.
- Human authority: no worker dispatch, ESI fetch, EVE write, role/access mutation, or external mutation is introduced.
- Durable architecture: updates shared contracts, server domain mapping, API validation, worker boundary tests, browser fixtures, and roadmap docs together.

## Technical Context

- Contracts: `packages/contracts/src/esi-sync.*`.
- Server: `netlify/functions/_shared/esi-token-vault.ts`, `netlify/functions/esi-sync-worker.ts`.
- Browser: existing ESI sync panel already renders `domains`.
- Tests: ESI sync contract/unit/browser smoke tests.

## Design

- Add `people` and `opportunity` to `EsiSyncDomain`.
- Add read-only required scope mappings for People and Opportunity domains.
- Reuse existing prepare sync flow for duplicate-safe queued requests.
- Keep ESI sync worker runnable domain restricted to `numbers`; non-Numbers run attempts return a safe conflict response.
- Update fixtures and browser smoke tests for multi-domain rendering and planning-only non-Numbers preparation.

## Validation

- `npm test -- esi-sync`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
