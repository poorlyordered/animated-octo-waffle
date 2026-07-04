# Quickstart: ESI Worker Adapter Hardening

## Prerequisites

- `.env.local` includes EVE SSO, ESI vault sealing, MongoDB, and worker secret values.
- An ESI token vault exists for the test corporation, or tests use mocked vault documents and mocked ESI responses.
- Network-free unit tests remain the default validation path.

## Validation Scenarios

1. Install/update dependencies:

   ```bash
   npm install
   ```

2. Run focused M62 tests:

   ```bash
   npm test -- esi-worker-adapter esi-numbers-ingestion eve-sso-live esi-token-vault-store
   ```

3. Run TypeScript and lint checks:

   ```bash
   npm run typecheck
   npm run lint
   ```

4. Run the production build:

   ```bash
   npm run build
   ```

5. Manual operator check after deployment:

   - Log in with EVE SSO.
   - Open ESI token vault.
   - Start read-sync consent if no active vault is present.
   - Prepare a Numbers read sync.
   - Run or allow the worker to process the queued Numbers request.
   - Confirm sync history and Numbers sections show either successful derived data or classified safe partial failures.

## Expected Evidence

- A near-expired token is refreshed before protected ESI reads.
- Paginated endpoints collect all pages up to the configured limit.
- Transient failures are retried and classified.
- Permanent authorization/scope failures are not retried.
- Browser-safe surfaces do not include token values, sealed token material, raw ESI payloads, or write handles.
