# Implementation Plan: EVE SSO Session Scope

**Branch**: `006-eve-sso-scope` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-eve-sso-scope/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add server-owned EVE SSO session scope so command APIs can resolve corporation ID from an authenticated commander session before falling back to `EVEONLINE_CORPORATION_ID`. The implementation adds short auth endpoints for sign-in start, callback, session state, and sign-out; a signed HTTP-only session-scope cookie; shared auth scope resolution for existing Netlify functions; display-safe web session state; and tests proving browser-controlled corporation identity is ignored.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Web Crypto/Node crypto for signed cookies

**Storage**: Signed HTTP-only cookies for short-lived session scope; no token persistence in this slice

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Session-state endpoint returns quickly from signed cookie parsing; no request path performs long-running ESI sync

**Constraints**: EVE client secret, session secret, MongoDB credentials, and OAuth tokens remain server-side; browser-controlled corporation identity is ignored; env fallback remains available for local/test operation

**Scale/Scope**: One authenticated commander session per browser; no multi-user authorization policy, token refresh storage, corp membership enforcement, or ESI data sync in M6

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M6 affects numbers/opportunity/people as an access/scope prerequisite, not a direct data-producing feature. It resolves command scope without executing EVE actions, stores no AI output, runs no long ESI sync in request paths, and keeps secrets/tokens server-side.

## Project Structure

### Documentation (this feature)

```text
specs/006-eve-sso-scope/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/contracts/src/
├── auth-session.ts
└── auth-session.schema.ts

netlify/functions/
├── eve-session.ts
├── eve-sso-start.ts
├── eve-sso-callback.ts
└── _shared/
    ├── auth-scope.ts
    ├── eve-sso.ts
    └── session-cookie.ts

apps/web/src/features/session/
├── components/
├── services/
└── state/

apps/web/tests/unit/
apps/web/tests/contract/
apps/web/e2e/
```

**Structure Decision**: Extend the existing contracts/functions/web-feature layout. Shared session and SSO helpers live beside existing Netlify helpers, browser-safe session contracts live in `packages/contracts`, and the web session indicator is a bounded feature module in `apps/web/src/features/session`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
