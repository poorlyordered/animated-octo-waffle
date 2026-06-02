# Research: ESI Token Vault Sync

## Decision: Use Existing EVE SSO Live Validation For Consent Callback

**Rationale**: M9 already added server-side authorization-code exchange, JWT validation, and ESI identity lookup. M12 should extend that boundary with a consent-purpose callback rather than create a second OAuth validation path.

**Alternatives considered**:

- Separate callback endpoint for vault consent: rejected because it would duplicate token exchange and identity validation logic.
- Browser-provided token handoff: rejected because token material must never be accepted from or exposed to the browser.

## Decision: Persist Sealed Token Material In A Dedicated Vault Collection

**Rationale**: Token material is a different risk class from browser-safe session identity. A dedicated `esi_token_vaults` collection keeps consent metadata, sealed tokens, revocation, and sync eligibility separate from command session cookies and automation queue records.

**Alternatives considered**:

- Store refresh tokens in the command session cookie: rejected because token material would become browser-adjacent and cookie lifecycle would be wrong for future workers.
- Store tokens directly on sync requests: rejected because duplicate requests and revocation would be harder to audit.

## Decision: Use Server-Side Envelope Sealing With Test-Only Deterministic Fallback

**Rationale**: Production token material must be sealed with a server-side secret before persistence. Tests still need deterministic behavior without real secrets, so the sealing helper will expose a test-mode deterministic path only when explicitly configured by the test environment.

**Alternatives considered**:

- Plaintext token persistence: rejected by the constitution and server-secret boundary.
- Hash-only storage: rejected because future read-sync workers need refresh-token access after explicit consent.

## Decision: Create ESI Sync Requests Instead Of Running ESI Fetch In Request Paths

**Rationale**: Live ESI sync can be slow, rate-limited, and multi-page. M12 should create auditable queued sync request records for future workers and keep Netlify functions bounded to validation and metadata writes.

**Alternatives considered**:

- Fetch ESI data immediately after consent: rejected because it risks request timeouts and mixes consent with ingestion.
- Dispatch external workers immediately: rejected because M12 is a preparation slice and retry/dispatch policy is not selected yet.

## Decision: Initial Sync Domain Is Numbers, With Extensible Domain Contracts

**Rationale**: The roadmap chose ESI vaulting to unlock live data ingestion. Numbers is the immediate operating leg with the clearest read-data demand; People and Opportunity should be represented as supported future domain values without requiring a vault-model rewrite.

**Alternatives considered**:

- Implement all domain syncs now: rejected as too broad for one slice.
- Hard-code only wallet/assets concepts: rejected because the command operating model needs a stable domain-level contract.
