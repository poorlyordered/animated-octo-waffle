# Research: ESI Worker Adapter Hardening

## Decision: Keep EVE SSO Login And Vault Consent Custom

**Rationale**: The existing SSO flow already validates state, exchanges authorization codes, validates JWKS-backed EVE JWTs, binds identity to corporation scope, and stores sealed token material only after explicit consent. Replacing this with an ESI data client would blur responsibilities and risk regressing a recently fixed login/consent path.

**Alternatives considered**: Rebuild SSO around a third-party library. Rejected because ESI.ts is an ESI data client, not the source of truth for this project's OAuth state cookie, session scope, token sealing, or corporation authorization rules.

## Decision: Add A Reusable Server-Side ESI Worker Adapter

**Rationale**: Current Numbers ingestion directly fetches four corporation endpoints and owns no shared retry, pagination, token-refresh, or typed failure behavior. A dedicated adapter lets future Numbers, People, and Opportunity workers reuse one tested boundary while keeping callers focused on derived business snapshots.

**Alternatives considered**: Patch each endpoint fetch in `esi-numbers-ingestion.ts`. Rejected because it would duplicate hardening logic as soon as another worker needs protected ESI reads.

## Decision: Use ESI.ts Selectively, Not As The Token Vault Owner

**Rationale**: The user approved ESI.ts despite GPL-3.0 constraints. The adapter may use the package for type-safe ESI interaction where its exported client methods match the needed corporation endpoints. The project will still own token refresh, storage, secret handling, response sanitization, and snapshot persistence because those are constitution and product boundaries.

**Alternatives considered**: Avoid the dependency completely. Rejected because the milestone explicitly asks to incorporate the ESI.ts improvement. Use the full client everywhere. Rejected because this slice needs a narrow worker adapter and must inspect the installed package API before adopting method names.

**Installed package inspection**: `@lgriffin/esi.ts@6.0.0` exports `ApiClientBuilder`, corporation-capable `WalletClient`, `AssetsClient`, `IndustryClient`, `MarketClient`, pagination helpers, and ESI error predicates. M62 uses `ApiClientBuilder` for the authenticated worker ESI access boundary and the exported error predicates for classification, while keeping HTTP fetch injection inside the adapter so worker tests remain deterministic and network-free.

## Decision: No Persistent Raw ESI Cache In M62

**Rationale**: Persistent ETag or raw-response caching would create new retention, privacy, invalidation, and payload-safety obligations. M62 should first make live reads correct and inspectable. Derived Numbers snapshots and safe endpoint metadata are already the durable product records.

**Alternatives considered**: Persist raw ESI response cache in MongoDB. Rejected because it expands data storage risk before retention rules exist. Enable persistent localStorage cache. Rejected because worker ESI reads must not move protected corporation payloads into browser storage.

## Decision: Refresh Tokens Before Worker Reads When Expired Or Near Expiration

**Rationale**: Vaulted access tokens are short-lived. Worker reads should use the sealed refresh token to obtain a fresh access token when the stored expiry is within a conservative safety window, then update the vault with newly sealed token material.

**Alternatives considered**: Attempt ESI reads and refresh only after a 401. Rejected because it creates avoidable endpoint failures and complicates partial result semantics. Refresh on every run. Rejected because it adds unnecessary token endpoint load.

## Decision: Bounded Retry And Pagination

**Rationale**: Serverless workers must not sleep or paginate without a ceiling. The adapter will retry only transient categories, avoid retrying permanent auth/scope/validation failures, and enforce a maximum page count per endpoint.

**Alternatives considered**: Unbounded pagination until ESI stops returning pages. Rejected because a misbehaving or huge result set could overrun a worker invocation. No retry. Rejected because transient ESI failures are common enough to create avoidable partial syncs.
