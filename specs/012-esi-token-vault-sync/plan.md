# Implementation Plan: ESI Token Vault Sync

**Branch**: `012-esi-token-vault-sync` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-esi-token-vault-sync/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add explicit-consent ESI token vaulting and scoped read-sync preparation. The implementation will reuse the existing EVE SSO live validation path, persist sealed token material server-side only, expose browser-safe vault status and revocation controls, and create queued ESI sync request records for future workers without fetching ESI data, dispatching workers, or executing player-impacting actions in request paths.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Node crypto, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: New MongoDB `esi_token_vaults`, `esi_sync_requests`, and `esi_vault_audit_events` collections

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Vault status, revocation, and sync preparation perform bounded scoped lookups and single-record writes. Consent callback performs bounded token exchange/JWT/identity validation plus token sealing. No long-running ESI fetch or AI processing occurs in request paths.

**Constraints**: Active corporation and character scope are server-resolved. Browser-controlled tokens, scopes, corporation IDs, execution flags, worker dispatch fields, retry scheduling, wallet actions, asset actions, contract actions, role changes, and external mutation fields are rejected or ignored. Server secrets and token material never appear in responses.

**Scale/Scope**: M12 covers read-sync consent callback handling, token vault status, revocation, sync request preparation, duplicate prevention, UI controls, and validation. Worker-side ESI ingestion, token refresh during ingestion, retry policy, EVE writes, wallet/asset/contract mutations, role changes, and external-service execution remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M12 primarily enables future Numbers ingestion, while leaving People and Opportunity extensible. Consent, revocation, and sync preparation are commander actions; sync requests are queued work, not executed actions. No long-running ESI fetch, AI processing, worker dispatch, or player-impacting mutation happens in request paths. Token material and secrets remain server-side and sealed before persistence.

Post-design gate status: PASS. The contracts require browser-safe response schemas, server-resolved scope, sealed vault storage, explicit revocation, missing-scope blocking, duplicate sync request checks, and no response fields for token material, secret material, worker credentials, execution handles, or external mutation targets.

## Project Structure

### Documentation (this feature)

```text
specs/012-esi-token-vault-sync/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── esi-sync.ts
├── esi-sync.schema.ts
└── index.ts

netlify/functions/
├── esi-sync.ts
├── eve-sso-callback.ts
└── _shared/
    ├── esi-token-vault.ts
    ├── esi-token-vault-store.ts
    ├── esi-sync-request-store.ts
    ├── eve-sso-live.ts
    └── env.ts

apps/web/src/features/
├── command-shell/
└── esi-sync/

apps/web/tests/
├── unit/
├── contract/
└── e2e/
```

**Structure Decision**: Add a dedicated `esi-sync` contract/function/UI surface and extend the existing `eve-sso-callback.ts` to optionally complete the read-sync consent flow. Keep token sealing and vault persistence in server-only shared helpers. Keep sync request records separate from player-impacting automation queue records.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
