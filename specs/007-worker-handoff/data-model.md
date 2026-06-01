# Data Model: Worker Handoff For Automation Queue

## WorkerHandoff

Durable record that prepares an automation queue item for future external worker processing.

Fields:

- `id`: Stable handoff identifier.
- `corporationId`: Server-owned corporation scope.
- `queueItemId`: Source automation queue item identifier.
- `sourceDecisionId`: Source decision linked through the queue item.
- `status`: `ready`, `claimed`, `completed`, `blocked`, `failed`, or `cancelled`.
- `payloadSummary`: Browser-safe worker package summary.
- `createdBy`: Commander/session display context when available, otherwise `commander`.
- `createdAt`: ISO timestamp for handoff creation.
- `updatedAt`: ISO timestamp for last status update.
- `claimedAt`: Optional ISO timestamp for future worker claim.
- `completedAt`: Optional ISO timestamp for future completion.
- `failure`: Optional failure detail.

Validation rules:

- `corporationId`, `queueItemId`, `sourceDecisionId`, `status`, `payloadSummary`, `createdAt`, and `updatedAt` are required.
- Active statuses are `ready`, `claimed`, and `blocked`.
- Duplicate active handoffs for the same `corporationId` and `queueItemId` are not allowed.
- Browser input cannot set `corporationId`, `status`, `createdBy`, worker owner, or dispatch target.
- Browser-visible records must not include secrets, OAuth tokens, cookie signatures, MongoDB credentials, or worker credentials.

## HandoffPayloadSummary

Browser-safe summary of the work package prepared for future worker processing.

Fields:

- `taskIntent`: Work intent copied from the source queue item.
- `inputSummary`: Grounded input summary copied from the source queue item.
- `expectedOutput`: Expected output copied from the source queue item.
- `sourceDecisionId`: Linked decision identifier.
- `sourceBriefId`: Optional linked research brief identifier.
- `sourceReferences`: Source references copied from queue provenance.
- `coverage`: Optional numbers/opportunity/people operating leg coverage.

Validation rules:

- Summary fields are derived from existing queue records.
- Summary does not include executable browser-provided payloads or external dispatch targets.

## HandoffFailure

Safe failure detail for blocked or failed handoffs.

Fields:

- `message`: Commander-visible failure reason.
- `code`: Optional safe failure code.
- `failedAt`: ISO timestamp.

Validation rules:

- Failure message must not expose secrets or credentials.
- Failure is informational in M7; retry and worker execution remain out of scope.

## QueueEligibilityResult

Internal validation result for preparing handoff.

Fields:

- `eligible`: Boolean.
- `reason`: Optional safe commander-visible reason when ineligible.

Validation rules:

- Missing, cross-scope, archived, already completed/cancelled, or unapproved player-impacting queue items are ineligible.
- Existing active handoff makes the operation idempotent rather than ineligible.
