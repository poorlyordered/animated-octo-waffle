# Data Model: Automation Queue

## AutomationQueueItem

Represents a durable work-order record created from an approved decision.

Persistence:

- Stored in the MongoDB `automation_queue` collection.
- Source decisions remain in `strategic_decisions`; queue records reference them rather than embedding mutable decision state.
- Worker execution fields are read-only from the M3 web app perspective and may be written by future worker integrations.

Fields:

- `id`: stable queue item identifier.
- `corporationId`: server-owned corporation scope.
- `sourceDecisionId`: decision record identifier used to create the queue item.
- `taskIntent`: commander-entered description of the requested work.
- `inputSummary`: bounded summary of the input context workers or humans should use.
- `expectedOutput`: commander-entered description of the desired output or result.
- `status`: one of `queued`, `blocked`, `running`, `failed`, `completed`, or `canceled`.
- `requestedBy`: actor identifier when available.
- `owner`: optional human owner or worker target.
- `isPlayerImpacting`: whether the queued work could affect players, assets, permissions, standings, wallets, contracts, or external services.
- `approval`: approval snapshot copied from the source decision when relevant.
- `provenance`: immutable queue-time source context.
- `attempts`: number of worker attempts recorded by future worker integrations.
- `lastAttemptedAt`: timestamp of the latest worker attempt when present.
- `failure`: failure metadata when status is `failed`.
- `output`: output metadata when status is `completed` or when a worker has partial output.
- `retry`: retry metadata when a future worker marks retry eligibility.
- `createdAt`: ISO timestamp when the queue item was created.
- `updatedAt`: ISO timestamp when the queue item was last changed.

Validation rules:

- `corporationId`, `sourceDecisionId`, `taskIntent`, `inputSummary`, `expectedOutput`, `status`, `provenance`, `createdAt`, and `updatedAt` are required.
- New records created by the web app start with status `queued`.
- New records created by the web app must not include `lastAttemptedAt`, `failure`, completed `output`, or worker execution metadata.
- `taskIntent`, `inputSummary`, and `expectedOutput` must not be empty.
- `sourceDecisionId` must reference an approved source decision in the same corporation scope.
- If `isPlayerImpacting` is true, `approval` must be present.
- Browser-provided corporation identity is ignored; server-owned scope is authoritative.

## QueueStatus

Represents the lifecycle state of queued work.

Allowed statuses:

- `queued`: waiting for future worker or human handling.
- `blocked`: blocked by missing data, missing authorization, or dependency.
- `running`: claimed by a future worker.
- `failed`: attempted by a future worker and failed.
- `completed`: future worker or human marked the work complete.
- `canceled`: commander or system canceled the work item.

Rules:

- M3 creates only `queued` records.
- M3 displays all allowed statuses when present.
- M3 does not transition statuses, retry failed work, claim running work, or mark work complete.

## QueueProvenance

Captures source context at queue creation time.

Fields:

- `decisionId`: source decision identifier.
- `decisionStatus`: source decision status at queue creation time.
- `decisionApprovedAt`: source decision approval timestamp when present.
- `sourceBriefId`: command brief identifier when available through the decision.
- `sourceRecommendation`: source recommendation text when available.
- `confidence`: source confidence score when available.
- `sourceCount`: number of source references when available.
- `sourceReferences`: source reference titles, URLs, and source IDs available at queue creation time.
- `coverage`: numbers/opportunity/people coverage from the source decision when available.
- `createdAt`: ISO timestamp for the provenance snapshot.

Validation rules:

- `decisionId`, `decisionStatus`, and `createdAt` are required.
- `decisionStatus` must be `approved` for queue items created through M3.
- `confidence`, when present, must be between 0 and 1.
- `sourceCount`, when present, must be a non-negative integer.
- Optional source reference fields with null values are omitted during normalization.

## ApprovalSnapshot

Represents approval copied from the source decision.

Fields:

- `approvedAt`: ISO timestamp when approval was recorded.
- `approvedBy`: actor identifier when available.
- `approvalText`: explicit approval statement when present.

Validation rules:

- `approvedAt` is required when an approval snapshot is present.
- Player-impacting queue records must include an approval snapshot.
- Approval does not mean execution and does not create worker dispatch in M3.

## QueueFailure

Represents failure metadata written by future worker integrations.

Fields:

- `message`: safe failure summary.
- `code`: optional failure code.
- `failedAt`: ISO timestamp when the failure was recorded.

Validation rules:

- `message` and `failedAt` are required when failure metadata is present.
- Failure metadata is display-only in M3.

## QueueOutput

Represents output metadata written by future worker integrations or imported records.

Fields:

- `summary`: safe output summary.
- `completedAt`: ISO timestamp when the output was completed.
- `artifactRefs`: optional references to durable output artifacts.

Validation rules:

- `summary` is required when output metadata is present.
- Output metadata is display-only in M3.
