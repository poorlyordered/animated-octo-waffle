# Implementation Plan: Auth Landing Gate

**Branch**: `057-auth-landing-gate` | **Date**: 2026-07-01 | **Spec**: `specs/057-auth-landing-gate/spec.md`

**Input**: Feature specification from `specs/057-auth-landing-gate/spec.md`

**Reference**: Legacy visual/content reference from `/mnt/f/Eve AI/project/src/pages/Home.tsx` and `/mnt/f/Eve AI/project/src/pages/Login.tsx`.

## Summary

Add an auth-gated Gryyk-47 front page that adapts the original EVE AI front-page identity and EVE SSO CTA while preserving the greenfield app's server-owned session model. The implementation gates React command surfaces behind browser-safe signed-session state and changes production command API scope resolution so no-session fallback cannot expose command data in production.

## Technical Context

**Language/Version**: TypeScript on Node `22.x`

**Primary Dependencies**: React `19.x`, Vite, Netlify Functions, Zod, MongoDB driver, existing `@gryyk/contracts`

**Storage**: Existing signed HTTP-only EVE session cookie and MongoDB-backed command collections; no new storage

**Testing**: Jest unit/contract tests and Playwright browser smoke tests

**Target Platform**: Netlify web app with serverless functions

**Project Type**: Web application with React frontend, shared contracts, and Netlify function backend

**Performance Goals**: Unauthenticated app load performs only session-state fetch; authenticated command shell keeps current data-fetch behavior

**Constraints**: EVE SSO/session secrets stay server-side; no command data fetches before authorized session; production no-session fallback cannot expose command data; no legacy localStorage auth token storage

**Scale/Scope**: One app shell gate and shared command API authorization policy across existing command API handlers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Operating legs: Protects all three command data legs from unauthenticated production access.
- Decision separation: Auth gate does not create observations, recommendations, draft orders, or executed actions.
- Long-running boundary: No AI, research, sync, ingestion, worker dispatch, retry, ESI fetch, or enrichment work is added.
- AI provenance: No new AI output is stored.
- Secret and approval boundaries: Reuses server-owned session cookies and EVE SSO endpoints; keeps secrets and token material server-side; no player-impacting action is introduced.

## Project Structure

### Documentation (this feature)

```text
specs/057-auth-landing-gate/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/web/src/
├── App.tsx
├── features/session/
│   ├── components/
│   │   ├── LoginGate.tsx
│   │   └── SessionStatus.tsx
│   ├── services/sessionClient.ts
│   └── state/useSessionState.ts
└── styles/app.css

netlify/functions/
├── _shared/auth-scope.ts
└── command API handlers that already call getAuthScope()

apps/web/tests/
├── unit/auth-scope.test.ts
├── contract/eve-session-api.test.ts
├── contract/* command API tests that exercise auth scope
└── e2e/command-surfaces.spec.ts
```

**Structure Decision**: Keep the feature inside the existing single React app shell and shared Netlify auth-scope helper. Do not add React Router for this slice; `/` remains the only command entry and conditionally renders the unauthenticated gate or authenticated command shell.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/auth-landing-gate.md`, and `quickstart.md`.

## Post-Design Constitution Check

- Numbers, opportunity, and people data remain available only after authorized session state in production.
- The landing gate is display-only and does not blur command authority or automation boundaries.
- Server-side session and command API checks are the enforcement boundary; React conditional rendering is a UX layer only.
- Existing command API handlers keep their bounded modules and reuse shared auth-scope policy instead of duplicate route-specific checks.
