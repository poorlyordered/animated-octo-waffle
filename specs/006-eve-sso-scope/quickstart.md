# Quickstart: EVE SSO Session Scope

## Prerequisites

- Local dependencies are installed.
- `EVEONLINE_CORPORATION_ID` is configured for local fallback validation.
- `EVE_SESSION_SECRET` is configured in production; local tests may use deterministic test secrets.
- Live EVE SSO start requires server-side `EVE_SSO_CLIENT_ID` and `EVE_SSO_REDIRECT_URI`.
- Local callback tests use `EVE_SSO_TEST_IDENTITY_JSON` deterministic fixtures and do not require live EVE credentials.

## Validation Flow

1. Run fast contract/unit validation:

   ```bash
   npm test
   ```

2. Run browser smoke validation:

   ```bash
   npm run test:e2e
   ```

3. Run production build:

   ```bash
   npm run build
   ```

4. Confirm fallback state:
   - Start local functions.
   - Request `/api/eve-session` without a session cookie.
   - Confirm response reports fallback scope and no token details.

5. Confirm signed-in fixture state:
   - Use deterministic callback/unit fixtures.
   - Confirm session state reports signed-in display metadata.
   - Confirm command APIs resolve session corporation scope before fallback.

6. Confirm sign-out:
   - Call sign-out.
   - Confirm session cookie is cleared.
   - Confirm session endpoint returns fallback or missing scope without token details.

## Expected Result

Gryyk-47 can resolve command API scope from an authenticated EVE SSO session when present, falls back to `EVEONLINE_CORPORATION_ID` for local development, ignores browser-controlled corporation IDs, and exposes only display-safe session metadata to the browser.

## Validation Results

- `npm run lint`: PASS on 2026-06-01.
- `npm run typecheck`: PASS on 2026-06-01.
- `npm test`: PASS on 2026-06-01, 20 suites and 70 tests.
- `npm run test:e2e`: PASS on 2026-06-01 with elevated local server permissions, 9 browser tests.
- `npm run build`: PASS on 2026-06-01.
