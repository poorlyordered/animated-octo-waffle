# Feature Specification: Numbers Operating Layer

**Feature Branch**: `008-numbers-layer`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Add a Numbers operating layer for corporation wallet, assets, logistics, market, and activity visibility from scoped processed data. Show measurable operational health, missing/stale data, source/provenance metadata, and suggested follow-up decisions without performing EVE writes, wallet/asset actions, long-running ESI sync, or external mutations in request paths."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Corporation Numbers Snapshot (Priority: P1)

As a commander, I want a concise numbers snapshot so I can see wallet, asset, logistics, market, and activity health before making operational decisions.

**Why this priority**: Numbers is one of Gryyk-47's three operating legs and is currently the least visible. A read-only snapshot gives immediate command value without adding live EVE mutations or sync jobs.

**Independent Test**: Seed a processed numbers snapshot for the active corporation scope, open the Numbers surface, and verify health metrics, trend indicators, source metadata, and risk/opportunity summaries are visible.

**Acceptance Scenarios**:

1. **Given** a processed numbers snapshot exists for the active corporation, **When** the commander opens the Numbers surface, **Then** the latest snapshot is shown with wallet, assets, logistics, market, and activity sections.
2. **Given** the snapshot includes provenance, **When** the commander inspects the surface, **Then** source count, source references, confidence, model/prompt metadata when present, and created timestamp are visible.
3. **Given** the snapshot includes risks and opportunities, **When** the commander reviews it, **Then** the system distinguishes observations and recommendations from executed actions.

---

### User Story 2 - See Missing And Stale Numbers Data (Priority: P2)

As a commander, I want missing and stale numbers data called out clearly so I know when a metric cannot support decisions yet.

**Why this priority**: The constitution requires missing data to be explicit instead of inferred. Numbers can be misleading if stale wallet, asset, logistics, market, or activity data appears current.

**Independent Test**: Seed a snapshot with stale and missing sections, open the Numbers surface, and verify the UI shows stale/missing indicators and safe reasons rather than fabricated values.

**Acceptance Scenarios**:

1. **Given** no processed numbers snapshot exists, **When** the commander opens the Numbers surface, **Then** the app shows a no-data state explaining what is missing.
2. **Given** some metrics are stale or missing, **When** the snapshot is shown, **Then** each affected section displays a safe stale/missing reason.
3. **Given** a metric lacks enough evidence, **When** the surface renders, **Then** it does not invent a value or recommendation.

---

### User Story 3 - Turn Numbers Findings Into Follow-Up Work (Priority: P3)

As a commander, I want numbers recommendations to connect to decision records or queued work so I can move from observation to auditable action planning.

**Why this priority**: Numbers should feed the command loop rather than remain a passive dashboard. The follow-up path must preserve human authority and avoid wallet/asset execution.

**Independent Test**: Seed numbers recommendations, verify the UI presents follow-up candidates, and confirm the copy makes clear that any decision or queued work is still draft/planning only.

**Acceptance Scenarios**:

1. **Given** a numbers recommendation exists, **When** the commander reviews it, **Then** the surface shows a follow-up candidate with expected decision or queue context.
2. **Given** a recommendation could affect wallets, assets, contracts, or logistics, **When** it is shown, **Then** the UI requires explicit commander approval before any later player-impacting workflow can progress.
3. **Given** a caller attempts to request a wallet/asset action through the Numbers API, **When** the request is handled, **Then** the system rejects or ignores action-like inputs and returns read-only data only.

---

### Operating Model Alignment

- **Numbers**: Primary feature. It exposes measurable corporation health across wallet, assets, logistics, market, and activity.
- **Opportunity**: Market gaps, logistics bottlenecks, and activity trends can become opportunity recommendations.
- **People**: Activity and logistics data may identify leadership workload or member follow-up needs, but no people records are mutated in M8.
- **Decision Boundary**: Numbers findings are observations and recommendations only. Follow-ups remain draft decision/queue candidates.
- **Automation Boundary**: Read-only scoped data retrieval and display only. No EVE writes, wallet/asset movement, contract changes, worker dispatch, ESI sync, retry loop, or external mutation in this feature.

### Edge Cases

- No numbers snapshot exists for the active corporation scope.
- Snapshot exists for another corporation scope.
- Snapshot has missing sections, stale timestamps, invalid confidence, or partial provenance.
- Snapshot contains action-like text that could be mistaken for executed wallet/asset/logistics work.
- Browser attempts to provide corporation ID, wallet action, asset action, dispatch target, or execution flags.
- Snapshot includes source references but no model/prompt metadata.
- Data is current for one section but stale for another section.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a scoped read-only Numbers API that returns the latest processed numbers snapshot for the active corporation scope.
- **FR-002**: System MUST display wallet, assets, logistics, market, and activity sections when those sections are present in processed data.
- **FR-003**: System MUST show missing or stale state for any absent or outdated numbers section instead of fabricating values.
- **FR-004**: System MUST expose provenance including created timestamp, source count, source references, confidence, and model/prompt metadata when available.
- **FR-005**: System MUST distinguish observations, risks, opportunities, and recommendations from executed actions.
- **FR-006**: System MUST expose follow-up candidates from numbers recommendations without creating decision records, queue items, handoff records, or external actions automatically.
- **FR-007**: System MUST ignore browser-controlled corporation scope, wallet action, asset action, dispatch target, execution flags, and raw metric overrides.
- **FR-008**: System MUST NOT expose MongoDB credentials, EVE OAuth tokens, cookie signatures, worker credentials, or server secrets in responses.
- **FR-009**: System MUST NOT perform EVE writes, wallet transfers, asset movement, contract actions, worker dispatch, long-running ESI sync, retry loops, or external service mutations in request/response handlers.
- **FR-010**: Numbers contracts, normalization, scoped reads, stale/missing behavior, provenance display, and browser-visible read-only boundaries MUST be covered by contract/unit tests and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **NumbersSnapshot**: Latest processed corporation numbers state for one corporation scope, including section summaries, provenance, observations, risks, opportunities, recommendations, and freshness metadata.
- **NumbersSection**: Wallet, assets, logistics, market, or activity section containing status, metrics, summary, stale/missing reasons, and section-specific timestamp.
- **NumbersMetric**: Display-safe measured value with label, value, unit, trend, and optional severity.
- **NumbersFollowUpCandidate**: Recommendation-derived planning candidate that may later become a decision record or queued work, without executing action.
- **NumbersProvenance**: Source and processing metadata for the snapshot.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A processed numbers snapshot renders wallet, assets, logistics, market, and activity sections in the browser smoke suite.
- **SC-002**: Missing or stale section tests prove no fabricated values are returned or displayed.
- **SC-003**: Contract/unit tests prove scoped reads ignore browser-provided corporation IDs and action-like inputs.
- **SC-004**: Browser smoke validation shows provenance metadata and read-only/no-execution boundary copy.
- **SC-005**: No Numbers API response contains secrets, tokens, credentials, cookie signatures, or external dispatch targets.
- **SC-006**: Existing command brief, decision, automation queue, people, session, and handoff validations continue to pass.

## Assumptions

- M8 reads processed numbers snapshots from MongoDB rather than live EVE APIs.
- The initial MongoDB collection for processed numbers snapshots is `numbers_snapshots`.
- Data shape may be partial; normalizers must preserve useful sections and mark missing/stale sections explicitly.
- Follow-up candidates are display-only in M8. Creating decisions or queued work from them can be a later slice.
- Active corporation scope continues to come from the M6 session-first auth boundary with `EVEONLINE_CORPORATION_ID` fallback for local tests.
