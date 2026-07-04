# Feature Specification: ESI Worker Adapter Hardening

**Feature Branch**: `062-esi-worker-adapter`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "Implement the improvements from the EVE ESI TypeScript client review into the project. Make corporation ESI reads durable, use the recommended no-persistent-cache approach for this milestone, and make this M62."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Numbers Pulls (Priority: P1)

A commander with active read-only ESI consent can trigger or prepare a Numbers refresh and expect the worker to retrieve corporation wallet, asset, industry, and market-order data without failing solely because one endpoint needs token refresh, pagination, or a transient retry.

**Why this priority**: Numbers data is the active ESI vault use case. If the worker cannot reliably pull corporation data, the consent flow appears broken even after vault activation.

**Independent Test**: With a valid vaulted read-sync consent and mocked ESI responses, run a Numbers sync request that includes a near-expired access token, paginated assets, and one transient endpoint failure; verify the worker refreshes the token, completes paginated reads, retries the transient failure, and records a durable sync result.

**Acceptance Scenarios**:

1. **Given** a corporation has an active vault with required read-only scopes and an access token near expiration, **When** a Numbers sync request runs, **Then** the worker refreshes the token before protected reads and records the refreshed token server-side only.
2. **Given** a corporation endpoint returns multiple pages, **When** the worker ingests that endpoint, **Then** all pages within the configured safe bound are collected or a clear partial failure is recorded.
3. **Given** an ESI endpoint fails transiently, **When** the worker reads the endpoint, **Then** it retries within bounded worker limits and records the final outcome without blocking unrelated endpoint results.

---

### User Story 2 - Inspectable ESI Failures (Priority: P2)

A commander inspecting sync history can distinguish authorization failures, missing scopes, rate limits, ESI service errors, malformed responses, and partial endpoint failures without seeing secrets or raw token material.

**Why this priority**: Better feedback prevents "processing" or "missing vault" confusion and lets operators know whether they need to re-consent, retry later, or investigate configuration.

**Independent Test**: Run mocked sync attempts that produce forbidden, rate-limited, server-error, and invalid-response failures; verify each attempt records a classified status, retryability, timestamp, and safe message.

**Acceptance Scenarios**:

1. **Given** a vaulted token lacks an endpoint scope, **When** the worker attempts a protected read, **Then** the sync result identifies a permission/scope failure and does not expose token contents.
2. **Given** ESI rate-limits or temporarily fails, **When** the worker exhausts bounded retries, **Then** the result marks the endpoint as retryable and keeps other successful endpoint snapshots.
3. **Given** ESI returns malformed data, **When** the worker validates the response, **Then** the result records an invalid-response failure and does not store untrusted malformed data as a successful snapshot.

---

### User Story 3 - Durable Adapter Boundary (Priority: P3)

Future worker features can reuse a single server-side ESI adapter for corporation read paths instead of adding one-off fetch logic in each ingestion module.

**Why this priority**: A reusable adapter keeps ESI token refresh, retry, error classification, and pagination behavior consistent as Numbers expands and People/Opportunity ESI reads are added.

**Independent Test**: Add a mocked adapter consumer that performs one public or protected ESI read through the shared adapter and verify it receives normalized success or failure objects without direct token handling in the caller.

**Acceptance Scenarios**:

1. **Given** a worker module needs corporation ESI data, **When** it uses the shared adapter, **Then** token handling, retry policy, pagination, and error classification are owned by the adapter layer.
2. **Given** an adapter call succeeds, **When** the caller stores derived results, **Then** only normalized business data and safe metadata are persisted.

---

### Operating Model Alignment

- **Numbers**: Primary milestone; improves wallet, assets, industry jobs, and corporation market-order retrieval.
- **Opportunity**: Indirectly supported by the reusable adapter boundary for future market and opportunity pulls; no opportunity recommendation is produced in this milestone.
- **People**: Indirectly supported by reusable consent and adapter behavior for later membership/activity reads; no people recommendation is produced in this milestone.
- **Decision Boundary**: Observation. The system reads and reports operational data and failure state only.
- **Automation Boundary**: Safe automatic worker action after explicit read-only consent. The feature must not write to EVE, move assets, alter wallets, change roles, or execute player-impacting actions.

### Edge Cases

- Active vault exists but the refresh token is missing, revoked, expired, or rejected by EVE.
- Vault has some but not all required Numbers scopes.
- ESI returns rate-limit, service-unavailable, not-found, forbidden, unauthorized, network timeout, or malformed response.
- Paginated endpoints return more pages than the worker is allowed to collect in one run.
- One endpoint fails while other Numbers endpoints succeed.
- Token refresh succeeds but a later endpoint still fails authorization.
- Retry behavior must stay bounded so a worker invocation does not become an unbounded long-running request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST keep all ESI access tokens, refresh tokens, token refresh operations, and protected corporation reads on the server side.
- **FR-002**: System MUST refresh a vaulted ESI access token before protected worker reads when the token is expired or close enough to expiration to risk mid-run failure.
- **FR-003**: System MUST persist refreshed vaulted token material in the existing token vault without exposing token values to browser responses, sync history, logs, or documentation.
- **FR-004**: System MUST route Numbers worker ESI reads through a reusable server-side adapter instead of direct one-off endpoint fetches in the ingestion module.
- **FR-005**: System MUST use a type-safe ESI access boundary where it improves reliable ESI interaction, while preserving project boundaries for token vaulting, sync history, and derived snapshot storage.
- **FR-006**: System MUST support paginated corporation ESI reads for endpoints used by Numbers ingestion and must enforce a safe maximum page bound per endpoint.
- **FR-007**: System MUST classify ESI read failures into safe operational categories that distinguish authentication, authorization/scope, rate limit, missing resource, ESI service, network, timeout, and invalid-response cases.
- **FR-008**: System MUST retry transient ESI read failures within bounded worker limits and must not retry permanent authorization or validation failures.
- **FR-009**: System MUST allow partial Numbers ingestion results when some endpoints succeed and others fail, preserving successful endpoint outputs and recording safe failure metadata for failed endpoints.
- **FR-010**: System MUST avoid persistent raw ESI response caching for this milestone; only derived snapshots and safe operational metadata may be persisted.
- **FR-011**: System MUST keep the browser UI and public APIs limited to safe vault status, sync request state, and classified failure summaries.
- **FR-012**: System MUST provide automated tests for token refresh, pagination, retry classification, partial endpoint success, and no-secret response boundaries.

### Key Entities *(include if feature involves data)*

- **ESI Worker Adapter**: Server-side boundary for ESI reads; owns token freshness checks, ESI client construction, retries, pagination, and error classification.
- **Vault Token Refresh Result**: Safe outcome of attempting to refresh a vaulted token, including status, expiration metadata, and failure category without token disclosure.
- **ESI Endpoint Result**: Normalized success or failure for a single endpoint, including endpoint label, retrieved data, page metadata, retryability, safe error category, and timestamps.
- **Numbers Sync Result**: Existing sync output extended to consume normalized endpoint results and store successful derived snapshots plus safe partial-failure metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Numbers sync with a near-expired vaulted access token refreshes the token and completes protected reads in automated tests.
- **SC-002**: A paginated asset or order endpoint with at least three pages is fully collected in automated tests without caller-side pagination logic.
- **SC-003**: At least six distinct ESI failure categories are covered by automated tests and produce safe, user-inspectable failure messages.
- **SC-004**: Partial endpoint failure tests preserve successful endpoint snapshots while recording failed endpoint metadata.
- **SC-005**: No automated test, API response, or documented sync history fixture exposes raw access tokens, refresh tokens, or sealed token ciphertext.

## Assumptions

- The existing EVE SSO sign-in and ESI vault consent flows remain in place; this milestone hardens worker reads after consent is active.
- A reviewed ESI TypeScript client package is acceptable for project use despite its license constraints, with the exact dependency decision captured in the implementation plan.
- Persistent raw ESI response or ETag caching is intentionally out of scope for M62; future milestones may revisit durable cache design after data-retention rules are specified.
- The first consumer is Numbers ingestion. People and Opportunity reads may reuse the adapter later but are not required for M62 completion.
- ESI read workers may perform safe automatic data collection after explicit consent, but they must not perform EVE write operations or player-impacting actions.
