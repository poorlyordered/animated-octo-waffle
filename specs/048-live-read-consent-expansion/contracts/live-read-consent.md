# Contract: Live Read Consent Expansion

## Domain Contract

`EsiSyncDomain` supports:

- `numbers`
- `people`
- `opportunity`

The vault status response must list all domains and expose only labels, required scope names, availability, and missing scope names.

## Prepare Contract

`POST /api/esi-sync/prepare` accepts any supported domain and returns:

- queued sync request id
- domain
- required scope names
- requested timestamp
- duplicate flag
- planning-only boundary text

The response must not include access tokens, refresh tokens, token hashes, sealing keys, OAuth secrets, worker secrets, MongoDB credentials, raw ESI payloads, dispatch targets, or execution handles.

## Worker Boundary

The ESI sync worker may continue to list/run Numbers sync requests. It must not run People or Opportunity sync requests in M48.
