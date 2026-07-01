# Quickstart: Auth Landing Gate

## Local Validation

1. Run targeted unit and contract tests:

   ```sh
   npm test -- auth-scope eve-session command-brief-api numbers-api people-api
   ```

2. Run browser smoke coverage:

   ```sh
   npm run test:e2e
   ```

3. Run full local quality gate before merge:

   ```sh
   npm test
   npm run typecheck
   npm run lint
   npm run test:e2e
   npm run build
   git diff --check
   ```

## Manual Browser Checks

1. Start local Netlify-backed app:

   ```sh
   npm run dev:netlify
   ```

2. Open `/` with no session.

   Expected: landing/login gate only. No command brief, Numbers, Opportunity, People, decision, queue, ESI, operations, or production evidence surfaces.

3. Load with a deterministic signed-session fixture or complete EVE SSO.

   Expected: existing command shell renders and session status shows signed-in character and corporation.

4. Sign out.

   Expected: command shell is removed and the landing/login gate returns.

## Production Readiness Checks

1. Confirm Netlify production has:

   - `EVEONLINE_CORPORATION_ID`
   - `EVE_SESSION_SECRET`
   - `EVE_SSO_CLIENT_ID`
   - `EVE_SSO_CLIENT_SECRET`
   - `EVE_SSO_REDIRECT_URI`

2. With no browser session, request a command API directly.

   Expected: `401` safe unauthorized response.

3. Complete EVE SSO with a character in the configured corporation.

   Expected: command shell renders and command APIs return scoped data.

4. Complete EVE SSO with a character outside the configured corporation.

   Expected: unauthorized state and no command data.
