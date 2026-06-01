# Data Model: Decision Record Loop

## DecisionRecord

Represents a commander decision created from a command brief recommendation.

Fields:

- `id`: stable decision record identifier.
- `corporationId`: server-owned corporation scope.
- `sourceBriefId`: command brief identifier used to create the decision.
- `sourceRecommendation`: recommendation text selected from the source brief.
- `sourceProvenance`: immutable decision-time provenance snapshot.
- `status`: one of `proposed`, `approved`, `delegated`, `done`, or `rejected`.
- `rationale`: commander-entered reason for the decision.
- `expectedResult`: commander-entered expected outcome.
- `isPlayerImpacting`: whether the decision could affect players, assets, permissions, standings, wallets, contracts, or external services.
- `approval`: explicit approval record, present only when player-impacting progression has been approved.
- `statusHistory`: ordered status change history.
- `createdAt`: ISO timestamp when the decision was created.
- `updatedAt`: ISO timestamp when the decision was last changed.

Validation rules:

- `corporationId`, `sourceBriefId`, `sourceRecommendation`, `rationale`, `expectedResult`, `status`, `createdAt`, and `updatedAt` are required.
- New records start with status `proposed`.
- `status` must be one of the allowed decision statuses.
- `rationale` and `expectedResult` must not be empty.
- `approval` is required before a player-impacting decision can move toward any future action-like or queue handoff state.
- Browser-provided corporation identity is ignored; server-owned scope is authoritative.

## SourceProvenanceSnapshot

Captures source context from the command brief at decision creation time.

Fields:

- `briefId`: source command brief ID.
- `briefCreatedAt`: source command brief created timestamp.
- `focus`: source brief focus.
- `model`: AI model recorded on the source brief.
- `promptVersion`: prompt version recorded on the source brief.
- `confidence`: source brief confidence score.
- `sourceCount`: number of source references.
- `sourceReferences`: source reference titles, URLs, and source IDs available at creation time.
- `coverage`: numbers/opportunity/people coverage from the source brief.

Validation rules:

- `briefId`, `briefCreatedAt`, `focus`, `confidence`, `sourceCount`, and `coverage` are required.
- `confidence` must be between 0 and 1.
- `sourceCount` must be a non-negative integer.
- Missing operating legs remain visible through `coverage.missingReasons`.

## DecisionStatusHistoryEntry

Represents one status transition for a decision record.

Fields:

- `fromStatus`: prior decision status, omitted for initial creation.
- `toStatus`: next decision status.
- `changedAt`: ISO timestamp for the change.
- `changedBy`: actor identifier when available.
- `note`: optional commander note for the transition.

Validation rules:

- `toStatus` and `changedAt` are required.
- `toStatus` must be one of the allowed decision statuses.
- History is append-only.

## ApprovalRecord

Represents explicit commander approval for a player-impacting decision to move toward future action handling.

Fields:

- `approvedAt`: ISO timestamp when approval was recorded.
- `approvedBy`: actor identifier when available.
- `approvalText`: explicit approval statement.

Validation rules:

- `approvedAt` and `approvalText` are required.
- Approval does not mean execution and does not create an automation queue entry in this milestone.

## State Transitions

Allowed statuses:

- `proposed`
- `approved`
- `delegated`
- `done`
- `rejected`

Rules:

- New decision records start as `proposed`.
- A decision may move from `proposed` to `approved`, `delegated`, or `rejected`.
- A decision may move from `approved` to `delegated`, `done`, or `rejected`.
- A decision may move from `delegated` to `done` or `rejected`.
- `done` and `rejected` are terminal for the MVP.
- Invalid statuses are rejected.
