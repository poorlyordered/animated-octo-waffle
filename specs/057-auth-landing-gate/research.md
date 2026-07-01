# Research: Auth Landing Gate

## Decision: Adapt legacy front page as a visual reference only

Rationale: `/mnt/f/Eve AI/project/src/pages/Home.tsx` and `Login.tsx` provide a useful Gryyk-47 identity, EVE SSO CTA, trust copy, and capability-card structure. The new app should keep those product cues but align the language to a corporation command operating system and the current numbers/opportunity/people model.

Alternatives considered: Directly port Chakra UI components and legacy pages. Rejected because the greenfield app uses plain React/CSS, and importing the old UI stack would add unnecessary dependencies and design drift.

## Decision: Use existing server-owned EVE SSO start endpoint

Rationale: The new app already owns EVE SSO state and session creation server-side through `/api/eve-sso-start`, `/api/eve-sso-callback`, and `/api/eve-session`. The landing gate should link to `/api/eve-sso-start` instead of generating OAuth URLs in browser code.

Alternatives considered: Reuse legacy `generateAuthUrl` and browser `sessionStorage` state. Rejected because it moves OAuth state generation back into the browser and conflicts with the newer server-side session boundary.

## Decision: Gate command UI before mounting command surfaces

Rationale: Current route components fetch data on mount. The app shell should fetch session state first, then render either the landing gate or the existing command shell. This avoids unauthenticated browser requests to command data APIs and keeps the visual state simple.

Alternatives considered: Render all components but hide them with CSS. Rejected because hidden components would still fetch command data and leak through network responses.

## Decision: Enforce production access at shared auth scope

Rationale: `getAuthScope` is the common helper used by command API handlers. Adding production session-required behavior there protects the API surface consistently while preserving local fallback for deterministic development and tests.

Alternatives considered: Add per-route checks in every command API handler. Rejected because it is repetitive, easy to miss, and inconsistent with the existing shared scope design.

## Decision: Keep local fallback explicit and non-production

Rationale: Existing tests and local fixture-style browsing rely on fallback scope. The security requirement is production command data protection, so fallback should remain available in non-production/test contexts while production requires a signed session.

Alternatives considered: Remove fallback entirely. Rejected because it would make local development and deterministic test fixtures harder without improving production protection beyond the session-required gate.
