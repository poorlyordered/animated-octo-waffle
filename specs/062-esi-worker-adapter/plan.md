# Implementation Plan: ESI Worker Adapter Hardening

**Branch**: `062-esi-worker-adapter` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-esi-worker-adapter/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Harden read-only corporation Numbers ingestion by moving ESI access behind a reusable server-side adapter. The adapter will refresh vaulted access tokens before worker reads, classify ESI failures, apply bounded retries, collect paginated corporation endpoints, and feed normalized endpoint results back into the existing Numbers snapshot path. M62 intentionally avoids persistent raw ESI/ETag caching; only derived snapshots and safe operational metadata are persisted.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node-compatible Netlify functions

**Primary Dependencies**: Existing MongoDB driver, Zod contracts, EVE SSO helpers, ESI token vault helpers, ESI.ts dependency where useful

**Storage**: MongoDB `esi_token_vaults`, `esi_sync_requests`, and derived `numbers_snapshots`

**Testing**: Jest unit/contract tests, TypeScript build, ESLint, production build

**Target Platform**: Netlify serverless functions and browser-safe React command UI

**Project Type**: Web app with serverless API and worker endpoints

**Performance Goals**: Keep retries and pagination bounded per worker invocation; do not introduce unbounded sleeps or browser request-path ESI calls

**Constraints**: Server secrets stay server-side; worker reads only after explicit consent; no EVE writes; no persistent raw ESI cache in M62; partial endpoint failures must remain inspectable

**Scale/Scope**: One reusable adapter for Numbers worker endpoints in M62, with future People/Opportunity reuse left as a contract-compatible extension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
  - Pass. Numbers is primary; Opportunity and People are future consumers only.
- Does it separate observations, recommendations, draft orders, and executed actions?
  - Pass. The feature produces observations and sync status only.
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
  - Pass. Protected ESI reads stay in worker ingestion paths.
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
  - Pass. This feature stores derived Numbers snapshots and safe endpoint failure metadata; no AI output is introduced.
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?
  - Pass. Token refresh and ESI reads remain server-side after explicit read-only consent.

## Project Structure

### Documentation (this feature)

```text
specs/062-esi-worker-adapter/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
netlify/functions/_shared/
├── esi-worker-adapter.ts        # New reusable server-side ESI adapter
├── esi-numbers-ingestion.ts     # Refactor to consume adapter endpoint results
├── esi-token-vault-store.ts     # Add refreshed token update helper
├── esi-token-vault.ts           # Reuse sealing/unsealing and token payload types
└── eve-sso-live.ts              # Add refresh-token grant helper

apps/web/tests/unit/
├── esi-worker-adapter.test.ts
├── esi-numbers-ingestion.test.ts
├── esi-token-vault-store.test.ts
└── eve-sso-live.test.ts

specs/062-esi-worker-adapter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

**Structure Decision**: Extend the existing Netlify shared server module boundary and Jest unit test layout. No new frontend surface is needed for M62 because browser-safe sync history already displays worker results.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
