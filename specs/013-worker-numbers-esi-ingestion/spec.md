# Feature Specification: Worker Numbers ESI Ingestion

**Feature Branch**: `013-worker-numbers-esi-ingestion`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M13: Worker-side Numbers ESI ingestion from prepared sync requests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Worker Claims A Prepared Numbers Sync (Priority: P1)

As a trusted worker, I want to claim a queued Numbers ESI sync request so that only one worker processes the prepared read-sync job.

**Why this priority**: M12 creates queued sync requests. M13 needs a worker-owned claim boundary before any live ESI ingestion can begin.

**Independent Test**: Seed a queued Numbers sync request and active token vault, call the worker claim path with the worker secret, and verify the request transitions to claimed with worker identity and no browser-visible token material.

**Acceptance Scenarios**:

1. **Given** a queued Numbers sync request exists, **When** an authorized worker claims it, **Then** the request becomes claimed with worker identity and claimed timestamp.
2. **Given** a sync request is already claimed or completed, **When** another worker attempts to claim it, **Then** the system refuses without changing ownership.
3. **Given** a request lacks the worker callback secret, **When** claim is attempted, **Then** the system rejects the request and exposes no token or vault material.

---

### User Story 2 - Worker Writes A Processed Numbers Snapshot (Priority: P2)

As a trusted worker, I want to use the active vault to fetch read-only ESI Numbers data and write a processed Numbers snapshot so that the command surface can show live corporation health.

**Why this priority**: The roadmap needs live Numbers ingestion, but the browser must keep reading processed snapshots rather than doing ESI work in request paths.

**Independent Test**: Run the worker ingestion helper with deterministic ESI responses and verify a `numbers_snapshots` record is written with wallet, assets, industry/logistics, market, and activity sections plus source references and sync provenance.

**Acceptance Scenarios**:

1. **Given** a claimed Numbers sync request has an active vault with required scopes, **When** the worker runs ingestion, **Then** read-only ESI responses are summarized into a processed Numbers snapshot.
2. **Given** ESI data is partial or an endpoint fails, **When** ingestion completes, **Then** the snapshot marks affected sections stale or missing and records safe failure summaries.
3. **Given** the worker writes a snapshot, **When** the commander loads Numbers, **Then** the existing Numbers read surface can consume the snapshot without seeing ESI tokens.

---

### User Story 3 - Worker Completes Or Fails Sync With Audit Metadata (Priority: P3)

As a commander, I want sync requests to show completion or failure metadata so that live ingestion status remains inspectable.

**Why this priority**: Worker automation must expose status, timestamps, outputs, and failures. The commander needs to know whether prepared sync actually produced a usable Numbers snapshot.

**Independent Test**: Complete and fail claimed sync requests through worker-authenticated paths and verify request status, result summary, failure summary, and browser-safe vault status metadata update correctly.

**Acceptance Scenarios**:

1. **Given** a claimed sync request produces a snapshot, **When** the worker completes it, **Then** the request status becomes completed and references the snapshot.
2. **Given** ingestion fails, **When** the worker reports failure, **Then** the request status becomes failed with a safe error summary and no token material.
3. **Given** a completed or failed sync request is visible in vault status, **When** the commander inspects the ESI vault, **Then** last-sync metadata is browser-safe and does not imply player-impacting execution.

---

### Operating Model Alignment

- **Numbers**: Primary domain. M13 writes processed Numbers snapshots from read-only wallet, asset, industry, market, and activity ESI data.
- **Opportunity**: Market and industry summaries may later feed opportunity analysis, but M13 creates no recommendations beyond basic Numbers observations.
- **People**: Character/corporation identity anchors the vault, but M13 does not update people records.
- **Decision Boundary**: Worker output is observation/status only. No decisions, approvals, or orders are created.
- **Automation Boundary**: A trusted worker may claim, process, complete, or fail sync requests. It MUST NOT write to EVE, move wallets/assets/contracts, change roles, dispatch other workers, schedule retries, or mutate external services.

### Edge Cases

- Sync request is missing, already claimed, completed, failed, or not a Numbers domain request.
- Vault is missing, revoked, unavailable, or scope-incomplete.
- Sealed token material cannot be unsealed.
- ESI endpoints return partial data, rate limits, authorization errors, empty arrays, or malformed payloads.
- Worker request lacks the callback secret or includes browser/action-like fields.
- Snapshot write succeeds but sync completion update fails.
- Sync request belongs to a different corporation scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow only worker-authorized requests to claim, run, complete, or fail ESI sync requests.
- **FR-002**: System MUST atomically claim queued Numbers sync requests and prevent duplicate worker claims.
- **FR-003**: System MUST load only active, same-corporation vault records for worker ingestion.
- **FR-004**: System MUST unseal token material only inside server-side worker helpers and never serialize it in responses.
- **FR-005**: System MUST fetch only configured read-only ESI Numbers endpoints for wallet, assets, industry/logistics, market, and activity summaries.
- **FR-006**: System MUST write processed `numbers_snapshots` records with sections, observations, risks, opportunities, follow-ups, provenance, and timestamps.
- **FR-007**: System MUST mark partial or failed ESI sections as stale or missing with safe reasons rather than fabricating healthy data.
- **FR-008**: System MUST complete sync requests with snapshot linkage and safe result summary when ingestion succeeds.
- **FR-009**: System MUST fail sync requests with safe failure metadata when ingestion cannot complete.
- **FR-010**: System MUST update vault last-sync metadata using browser-safe status, request id, domain, and timestamp.
- **FR-011**: System MUST reject browser-controlled token material, scope overrides, corporation overrides, EVE write flags, dispatch fields, retry schedules, wallet actions, asset actions, contract actions, role changes, and external execution flags.
- **FR-012**: System MUST NOT perform EVE writes, wallet movement, asset movement, contract mutation, role mutation, worker dispatch, retry scheduling, or external-service execution.
- **FR-013**: System MUST cover worker authorization, claim rules, ingestion normalization, snapshot writes, completion/failure transitions, partial-data handling, and secret-free responses with unit/contract tests.

### Key Entities *(include if feature involves data)*

- **EsiSyncRequest**: Prepared sync work record created by M12 and processed by M13 workers.
- **EsiTokenVault**: Active server-side token vault that supplies read-only ESI token material to trusted worker helpers.
- **EsiNumbersIngestionResult**: Safe worker output summary containing snapshot id, section statuses, source count, and failure summaries.
- **NumbersSnapshot**: Existing processed corporation health record consumed by the Numbers command surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authorized workers can claim queued Numbers sync requests and unauthorized requests are rejected.
- **SC-002**: Deterministic ESI fixture data produces a processed Numbers snapshot with wallet, assets, logistics, market, and activity sections.
- **SC-003**: Partial ESI failures produce stale or missing section states with safe reasons.
- **SC-004**: Completed sync requests reference the created Numbers snapshot and failed requests store safe failure summaries.
- **SC-005**: Worker and browser-safe responses contain no access tokens, refresh tokens, sealed token material, OAuth secrets, MongoDB credentials, worker secrets, dispatch targets, retry schedules, or external execution handles.
- **SC-006**: Existing command brief, decision, automation queue, people, session, live SSO, ESI vault, Numbers, handoff, worker callback, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M13 is stacked on M12 until M12 merges because it depends on `esi_token_vaults` and `esi_sync_requests`.
- M13 uses the existing `WORKER_CALLBACK_SECRET` as the trusted worker authorization boundary.
- M13 supports the Numbers sync domain first.
- M13 writes processed snapshot summaries and does not persist raw ESI payloads.
- Rate-limit/backoff policy and commander-approved retry scheduling remain future slices.
