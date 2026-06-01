# Feature Specification: Command Brief MVP

**Feature Branch**: `001-command-brief-mvp`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Follow the roadmap and start with a Command Brief MVP that shows the commander the latest structured state across numbers, opportunity, and people by reading processed research/status data, surfacing recommendations, watchlist, confidence, source count, model, createdAt, and missing data without running long AI processing in the web app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Command Brief (Priority: P1)

As the corporation commander, I want the first operational screen to show the latest processed command brief so I can quickly understand what changed, what matters, and what I should consider next.

**Why this priority**: This is the first useful vertical slice of the greenfield product. It proves Gryyk-47 is an operating system view, not just a chatbot, while avoiding the old timeout-prone research workflow.

**Independent Test**: Seed one processed brief with summary, impacts, actions, watchlist, memory, confidence, source count, source references, model, prompt version, and createdAt; load the command brief screen; verify the commander can read the complete brief and metadata without initiating research processing.

**Acceptance Scenarios**:

1. **Given** a processed brief exists for the commander's corporation, **When** the commander opens Gryyk-47, **Then** the latest brief is shown with executive summary, strategic impacts, recommended actions, watchlist, confidence, source count, source references, model, prompt version, and createdAt.
2. **Given** multiple processed briefs exist for the same corporation, **When** the commander opens the command brief, **Then** only the newest processed brief is presented as current while older briefs remain out of the primary view.
3. **Given** the brief includes memory items, **When** the commander reviews the command brief, **Then** the memory items are visible as reusable context for future decisions.

---

### User Story 2 - Understand Research Status (Priority: P2)

As the corporation commander, I want to see whether the latest research request is queued, processing, processed, or failed so I know whether the command brief is fresh, delayed, or blocked.

**Why this priority**: The old app told the user research had been queued but hid the background failure path. Status visibility is required for trust and operational control.

**Independent Test**: Seed request records for each status value; load the command brief screen; verify the displayed state, timestamp, and error handling match the request state.

**Acceptance Scenarios**:

1. **Given** the latest request status is queued, raw_captured, or processing, **When** the commander opens the command brief, **Then** the screen clearly says research is still processing and does not imply a new brief is ready.
2. **Given** the latest request status is processed, **When** the commander opens the command brief, **Then** the processed brief is shown as the current result.
3. **Given** the latest request status is failed with an error message, **When** the commander opens the command brief, **Then** the failure state and error message are visible without exposing secrets.

---

### User Story 3 - See Missing Operating Data (Priority: P3)

As the corporation commander, I want Gryyk-47 to show which parts of the numbers, opportunity, and people model are present or missing so I can tell whether recommendations are grounded or incomplete.

**Why this priority**: The constitution requires recommendations to be data-grounded. This story prevents confident-looking summaries when the data stool is missing a leg.

**Independent Test**: Seed briefs with complete and incomplete operating-leg coverage; load the command brief; verify missing data is called out separately from recommendations.

**Acceptance Scenarios**:

1. **Given** a brief has opportunity data but lacks numbers and people data, **When** the commander reviews recommendations, **Then** the screen labels opportunity as present and numbers/people as missing.
2. **Given** all three operating legs have usable data, **When** the commander reviews the command brief, **Then** the screen indicates complete operating coverage.
3. **Given** a recommendation depends on unavailable data, **When** it is displayed, **Then** Gryyk-47 identifies the missing data instead of treating the recommendation as fully grounded.

### Operating Model Alignment

- **Numbers**: Shows whether financial, asset, market, activity, or other measurable corporation data is present in the brief; first MVP may report missing numbers if only research data exists.
- **Opportunity**: Primary MVP data source is processed official EVE news and patch-change research, including strategic impacts, recommended actions, and watchlist items.
- **People**: Shows whether member, role, delegation, onboarding, or retention data is present in the brief; first MVP may report missing people data if not yet integrated.
- **Decision Boundary**: Observation and recommendation only. The MVP does not execute actions or issue player-facing orders.
- **Automation Boundary**: Read-only presentation of processed worker output. The web app does not run long AI research processing.

### Edge Cases

- No processed brief exists for the corporation.
- A research request exists but no matching processed brief has been saved yet.
- The latest request is failed and the latest processed brief is older than the failed request.
- Brief data is partially malformed, such as missing confidence, source count, model, or createdAt.
- Confidence is low or source count is zero.
- The commander is authenticated but corporation identity is unavailable.
- The system receives data for a different corporation and must not show it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show the latest processed command brief for the authenticated commander's corporation.
- **FR-002**: System MUST show the latest research request status for the authenticated commander's corporation.
- **FR-003**: System MUST support request statuses `queued`, `raw_captured`, `processing`, `processed`, and `failed`.
- **FR-004**: System MUST show a processing state when status is `queued`, `raw_captured`, or `processing`.
- **FR-005**: System MUST show a failure state when status is `failed`, including a safe error message when one exists.
- **FR-006**: System MUST show processed brief metadata, including createdAt, model, prompt version, source count, source references, and confidence.
- **FR-007**: System MUST show executive summary, strategic impacts, recommended actions, watchlist, and memory when those fields are present.
- **FR-008**: System MUST distinguish missing numbers, opportunity, and people data from present data.
- **FR-009**: System MUST avoid starting long-running research or AI processing from the command brief view.
- **FR-010**: System MUST only show data scoped to the authenticated commander's corporation.
- **FR-011**: System MUST show an empty state when no brief or request exists.
- **FR-012**: System MUST show a stale-data indication when the newest failed or processing request is newer than the displayed processed brief.
- **FR-013**: System MUST keep observations and recommendations visually distinct from any future action controls.

### Key Entities *(include if feature involves data)*

- **Command Brief**: Latest processed intelligence artifact for a corporation. Includes executive summary, markdown brief, strategic impacts, recommended actions, watchlist, memory, confidence, model, prompt version, source count, source references, createdAt, corporationId, and focus.
- **Research Request**: Latest background research status record for a corporation. Includes corporationId, focus, status, createdAt, updatedAt, requestedBy, and optional errorMessage.
- **Operating Leg Coverage**: Derived indicator for whether numbers, opportunity, and people data are present, missing, or stale in the brief.
- **Commander**: Authenticated user reviewing corporation state and recommendations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can determine the latest research state within 10 seconds of opening the command brief screen.
- **SC-002**: 100% of displayed recommendations include visible context indicating whether numbers, opportunity, and people data are present or missing.
- **SC-003**: The MVP never initiates long-running AI research processing from the web view during command brief loading.
- **SC-004**: When a failed request exists, the commander can see the failure state and safe error message without opening developer tools.
- **SC-005**: In seeded validation data, the screen always chooses the newest processed brief for the commander's corporation and never shows another corporation's brief.

## Assumptions

- Processed command briefs are produced by an external worker such as OvernightDesk.
- The first MVP reads from existing command brief and request records rather than creating new research jobs.
- MongoDB remains acceptable as the shared operational document store for this slice.
- The authenticated user's corporation ID is available after EVE SSO.
- Official EVE news research uses the focus value `grykk-47-eve-official-news` until a later spec generalizes focus selection.
