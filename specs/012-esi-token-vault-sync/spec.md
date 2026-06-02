# Feature Specification: ESI Token Vault Sync

**Feature Branch**: `012-esi-token-vault-sync`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M12: Explicit-consent ESI token vaulting and scoped read sync for future live data ingestion."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grant Read Sync Consent (Priority: P1)

As a commander, I want to explicitly consent to read-only ESI data scopes before Gryyk-47 stores any durable token material so that live data ingestion is intentional, inspectable, and revocable.

**Why this priority**: M12 introduces long-lived ESI access risk. Consent capture and vault metadata must exist before any scoped sync can be prepared.

**Independent Test**: Start an authenticated command session, request the read-sync consent flow, complete the callback with consent metadata, and verify that only server-side token material is vaulted while browser responses show consent status, granted scopes, character identity, corporation identity, and revocation availability.

**Acceptance Scenarios**:

1. **Given** a signed-in commander has no vaulted ESI consent, **When** they start read-sync consent, **Then** the system shows the requested read-only scope set and a consent-required status without storing tokens.
2. **Given** EVE SSO returns a valid authorization callback for read-sync consent, **When** the server validates identity and scopes, **Then** the system stores token material server-side and returns only browser-safe vault status.
3. **Given** a browser request attempts to provide tokens, override scopes, or choose corporation scope, **When** the request is handled, **Then** the server ignores or rejects those inputs and no token vault record is created from browser-provided secrets.

---

### User Story 2 - Inspect And Revoke Vaulted Consent (Priority: P2)

As a commander, I want to inspect and revoke vaulted ESI consent so that I can control whether Gryyk-47 may prepare future read sync jobs.

**Why this priority**: Durable token storage is acceptable only if the commander can see what exists and revoke it before additional sync work is prepared.

**Independent Test**: Seed a vaulted consent record, open the command shell, verify the status and scope display are browser-safe, revoke the consent, and verify future sync preparation is blocked.

**Acceptance Scenarios**:

1. **Given** a vaulted consent exists, **When** the commander views ESI sync settings, **Then** the system shows character identity, corporation identity, granted scopes, consent time, last sync status, and revocation controls without exposing tokens or secrets.
2. **Given** vaulted consent exists, **When** the commander revokes it, **Then** the vault record is marked revoked, token material is no longer usable, and browser state clearly says sync preparation is blocked.
3. **Given** a revoked or missing vault, **When** the commander requests sync preparation, **Then** the system refuses and explains that explicit consent is required.

---

### User Story 3 - Prepare Scoped Read Sync Work (Priority: P3)

As a commander, I want to prepare read-only ESI sync work from a valid vault so that future workers can ingest live corporation data without running long syncs inside browser request paths.

**Why this priority**: Live Numbers, People, and Opportunity data needs a durable handoff point, but M12 should only prepare auditable sync requests and must not perform long-running ingestion in Netlify functions.

**Independent Test**: Start from an active vault with required read scopes, request sync preparation for supported domains, and verify a queued sync request is created with scope, domain, status, provenance, and no immediate ESI fetch or worker dispatch.

**Acceptance Scenarios**:

1. **Given** an active vault has the required scopes, **When** the commander prepares a Numbers read sync, **Then** the system creates a scoped sync request with queued status and no fetched ESI data.
2. **Given** a requested domain requires a missing scope, **When** the commander prepares sync, **Then** the system refuses and lists the missing read-only scope.
3. **Given** an active or queued sync request already exists for the same corporation, domain, and vault, **When** the commander prepares sync again, **Then** the existing request is surfaced instead of creating a duplicate.

---

### Operating Model Alignment

- **Numbers**: Primary future consumer. Sync preparation targets wallet, assets, industry, logistics, market, and activity read domains through explicit read-only scopes.
- **Opportunity**: Live market, industry, and event-relevant read data can later inform opportunity surfaces, but M12 does not create strategic recommendations.
- **People**: Character and corporation identity plus member/activity read domains support future people surfaces, but M12 does not mutate people records.
- **Decision Boundary**: Consent and revocation are explicit commander actions; sync requests are prepared work, not executed actions.
- **Automation Boundary**: M12 may create queued read-sync requests for future workers. It MUST NOT fetch long-running ESI data, dispatch workers, mutate EVE, change roles, move assets, move wallets, create contracts, or execute external-service actions in request paths.

### Edge Cases

- The commander is not signed in or the command session lacks a corporation scope.
- The EVE authorization callback succeeds but does not include all requested read-only scopes.
- The EVE callback identity does not match the active command session identity.
- A vault exists for a different character or corporation scope.
- A vault is expired, revoked, missing refresh capability, or fails safe metadata validation.
- A browser request includes token material, scope overrides, corporation overrides, execution flags, worker dispatch fields, retry schedules, wallet actions, asset actions, contract actions, role changes, or external-service mutation fields.
- A sync request already exists for the same corporation, domain, and active vault.
- Token encryption or secret configuration is unavailable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show browser-safe ESI vault status for the active command scope, including whether consent is missing, active, revoked, or unavailable.
- **FR-002**: System MUST allow a signed-in commander to start an explicit ESI read-sync consent flow that requests only configured read-only scopes.
- **FR-003**: System MUST validate EVE SSO callback identity and granted scopes server-side before creating or updating a vault record.
- **FR-004**: System MUST store ESI access token, refresh token, token expiry, granted scopes, character identity, corporation identity, consent timestamp, and revocation state server-side only.
- **FR-005**: System MUST encrypt or seal durable token material using server-side configuration before persistence.
- **FR-006**: System MUST NOT expose access tokens, refresh tokens, token hashes, encryption keys, OAuth client secrets, cookie signatures, MongoDB credentials, or worker secrets in browser responses, logs intended for users, or contracts.
- **FR-007**: System MUST reject or ignore browser-provided token material, granted-scope overrides, corporation-scope overrides, approval forgery, EVE write flags, worker dispatch fields, retry schedules, wallet actions, asset actions, contract actions, role-change flags, and external-service execution flags.
- **FR-008**: System MUST let the commander revoke an active vault, mark token material unusable, and block future sync preparation from the revoked vault.
- **FR-009**: System MUST prepare read-sync requests only from an active vault with the read-only scopes required by the requested sync domain.
- **FR-010**: System MUST create sync requests with corporation scope, requested domain, required scopes, originating vault reference, queued status, requested timestamp, and no fetched ESI payload.
- **FR-011**: System MUST prevent duplicate active or queued sync requests for the same corporation scope, sync domain, and active vault.
- **FR-012**: System MUST provide browser-visible boundary language for missing consent, active consent, revoked consent, missing scopes, prepared sync, duplicate sync, and no-execution behavior.
- **FR-013**: System MUST keep long-running ESI fetching, token refresh during worker execution, worker dispatch, retry policy, EVE writes, wallet movement, asset movement, contract mutation, role mutation, and external-service execution outside this feature.
- **FR-014**: System MUST cover vault status, consent callback validation, revocation, sync preparation, duplicate prevention, unsafe field rejection, missing-scope blocking, scoped access, and secret-free responses with contract/unit tests and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **EsiTokenVault**: Server-side durable consent and token record for one commander character and corporation scope.
- **EsiConsentScopeSet**: Configured read-only scopes that Gryyk-47 may request for future read sync domains.
- **EsiSyncRequest**: Auditable queued request for future workers to perform scoped read-only ESI ingestion.
- **EsiSyncDomain**: Supported read-sync domain such as numbers, people, opportunity, assets, wallet, industry, market, or activity.
- **EsiVaultAuditEvent**: Inspectable event for consent creation, revocation, sync preparation, duplicate sync surfacing, and blocked unsafe attempts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in commander can complete the consent flow in contract tests and receive active vault status without any token material in the response.
- **SC-002**: A commander can revoke vaulted consent, and subsequent sync preparation attempts are blocked until consent is re-established.
- **SC-003**: A commander can prepare a read-sync request from an active vault, and the request remains queued with no ESI payload, no worker dispatch, and no execution metadata.
- **SC-004**: Missing or insufficient scopes produce a clear blocked status listing the missing read-only scopes.
- **SC-005**: Duplicate sync preparation returns or surfaces the existing request instead of creating duplicate queued work.
- **SC-006**: Contract/unit tests prove browser-provided tokens, scope overrides, corporation overrides, execution flags, dispatch fields, retry fields, wallet actions, asset actions, contract actions, role changes, and external-service mutations cannot bypass server-side rules.
- **SC-007**: API and browser responses contain no access tokens, refresh tokens, token hashes, encryption keys, OAuth client secrets, cookie signatures, MongoDB credentials, worker secrets, or external execution handles.
- **SC-008**: Existing command brief, decision, automation queue, people, session, live SSO, Numbers, handoff, worker callback, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M12 reuses the existing live EVE SSO callback validation adapter and command session scope from M9.
- M12 introduces durable token vault records but does not implement worker-side ESI ingestion or token refresh execution.
- The initial supported sync domain is Numbers, with contracts structured so People and Opportunity domains can be added without changing the vault model.
- Token sealing uses a server-side secret configured outside browser-accessible code; local tests use deterministic test-only sealing.
- Sync requests are queued records for future workers and are separate from automation queue player-impacting work.
