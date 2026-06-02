# Implementation Plan: Live EVE SSO

**Branch**: `009-live-eve-sso` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-live-eve-sso/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the deterministic-only EVE SSO callback with a server-side live validation adapter. The callback exchanges authorization codes with EVE SSO, validates the returned JWT access token through official metadata/JWKS rules, resolves character corporation identity through read-only ESI lookup, and writes only browser-safe command session scope to the existing signed HTTP-only cookie. Deterministic identity fixtures remain available for local validation.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, Node built-in WebCrypto/crypto support, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: N/A for this slice. EVE tokens are not persisted; command session scope remains in the existing signed HTTP-only cookie.

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Callback completes bounded token exchange, JWKS validation, and two read-only identity lookups without long-running work or AI processing in request paths.

**Constraints**: EVE client secrets and token material stay server-side; browser-visible session state exposes only command identity; refresh-token persistence and long-lived ESI sync are out of scope; no player-impacting EVE actions are executed.

**Scale/Scope**: One authenticated commander session per browser callback. This slice validates live identity only; future slices can add explicit-consent token vaulting or ESI sync if needed.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M9 strengthens people/session identity and prepares trusted scope for numbers/opportunity reads. It performs only authentication and read-only identity resolution, creates no recommendations or executed actions, adds no AI output, performs no long-running processing, and keeps EVE secrets and token material server-side.

## Project Structure

### Documentation (this feature)

```text
specs/009-live-eve-sso/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
netlify/functions/
├── eve-sso-callback.ts
└── _shared/
    ├── eve-sso.ts
    └── eve-sso-live.ts

apps/web/tests/
├── unit/
├── contract/
└── e2e/
```

**Structure Decision**: Extend the existing EVE SSO shared-function boundary. The start/callback endpoints remain Netlify functions, deterministic local fixture handling remains in `eve-sso.ts`, and live token exchange plus JWT/ESI identity resolution lives in a dedicated server-only shared adapter.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
