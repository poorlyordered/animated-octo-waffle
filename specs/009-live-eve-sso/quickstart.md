# Quickstart: Live EVE SSO

## Local deterministic validation

1. Configure local deterministic identity values in `.env.local`:

   ```text
   EVE_SESSION_SECRET=...
   EVE_SSO_CLIENT_ID=...
   EVE_SSO_REDIRECT_URI=http://localhost:8888/api/eve-sso-callback
   EVE_SSO_TEST_IDENTITY_JSON={"characterId":"2110000001","characterName":"Ari Voss","corporationId":"123456789","corporationName":"Session Corp"}
   ```

2. Run the app locally through Netlify dev:

   ```bash
   npm run dev:netlify
   ```

3. Open `/api/eve-sso-start?returnTo=/` and complete the deterministic callback path through contract tests or local callback fixture.

Expected result: Gryyk-47 creates a signed command session scope with character and corporation identity and no token material in browser-visible state.

## Live validation setup

1. Configure server-side EVE SSO values:

   ```text
   EVE_SESSION_SECRET=...
   EVE_SSO_CLIENT_ID=...
   EVE_SSO_CLIENT_SECRET=...
   EVE_SSO_REDIRECT_URI=http://localhost:8888/api/eve-sso-callback
   EVE_SSO_SCOPES=publicData
   ```

2. Ensure `EVE_SSO_TEST_IDENTITY_JSON` is unset so the callback uses the live adapter.

3. Start Netlify dev:

   ```bash
   npm run dev:netlify
   ```

4. Open `/api/eve-sso-start?returnTo=/` and complete EVE SSO.

Expected result: the callback exchanges the code server-side, validates the EVE access-token JWT, resolves corporation identity, sets the Gryyk-47 command session cookie, and redirects to `/`.

## Validation

Run these before merging:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Results

- `npm run lint`: passed on 2026-06-02
- `npm run typecheck`: passed on 2026-06-02
- `npm test`: passed on 2026-06-02; 26 suites, 106 tests
- `npm run test:e2e`: passed on 2026-06-02; 16 Chromium browser smoke tests
- `npm run build`: passed on 2026-06-02
