# Data Model: Numbers Follow-Up Actions

## NumbersFollowUpCandidate

Existing processed recommendation inside a Numbers snapshot.

Fields used by M11:

- `id`: Stable candidate identifier within the snapshot.
- `title`: Commander-facing recommendation summary.
- `rationale`: Why the follow-up matters.
- `suggestedPath`: `decision` or `queue`.
- `isPlayerImpacting`: Whether later progress can affect players, assets, wallets, contracts, roles, EVE state, or external services.
- `relatedSection`: Optional Numbers section such as wallet, assets, logistics, market, or activity.

Validation rules:

- Candidate must exist in the server-resolved corporation's latest or addressed snapshot.
- Candidate must include enough title/rationale context to create an auditable decision.
- Candidate details submitted by the browser are ignored except for stable identifiers.

## NumbersFollowUpOrigin

Inspectable link from a created artifact back to a Numbers candidate.

Fields:

- `sourceType`: `numbers_follow_up`.
- `snapshotId`: Originating Numbers snapshot ID.
- `candidateId`: Originating follow-up candidate ID.
- `relatedSection`: Optional section copied from the candidate.
- `suggestedPath`: Candidate path at creation time.

Relationships:

- Stored in or derivable from decision provenance metadata.
- Used to find existing decisions for duplicate prevention.

## DecisionRecord

Existing commander decision entity extended by M11 usage.

M11 requirements:

- Created decision starts as `proposed`.
- `sourceRecommendation` comes from candidate title.
- `rationale` comes from candidate rationale or generated safe summary from stored data.
- `expectedResult` states the planning outcome expected from the follow-up, using optional commander input or a safe default derived from stored candidate context.
- `isPlayerImpacting` follows the candidate flag.
- `sourceProvenance` is derived from the Numbers snapshot, including source references, source count, confidence, created timestamp, model, prompt version, and operating-leg coverage.
- Origin link identifies the Numbers snapshot and candidate.

State transitions:

```text
Numbers candidate -> proposed decision
proposed decision -> approved/rejected/delegated/done through existing decision status workflow
```

## AutomationQueueItem

Existing queued work entity used after decision approval.

M11 requirements:

- Created only from an approved decision.
- `sourceDecisionId` links to the approved Numbers follow-up decision.
- `taskIntent`, `inputSummary`, and `expectedOutput` are derived from the approved decision and optional commander input.
- Initial status is `queued`.
- Attempts remain `0`.
- No handoff, claim, dispatch, retry, output, external execution, wallet, asset, or EVE mutation metadata is written at creation time.

State transitions:

```text
approved decision -> queued item
queued item -> later handoff/retry/worker states outside M11
```

## Duplicate Rules

- One corporation scope may have at most one decision for the same `snapshotId` and `candidateId`.
- One source decision may have at most one queue item for the same task intent.
- Duplicate decision attempts return or surface the existing decision.
- Duplicate queue attempts return or surface the existing queue item or a clear duplicate boundary response.

## Security And Boundary Rules

- Corporation scope is resolved server-side.
- Browser cannot provide approval metadata for decision status changes through Numbers follow-up creation.
- Browser cannot override source references, source counts, confidence, model, prompt version, created timestamp, or operating-leg coverage.
- Browser cannot request worker dispatch, retry scheduling, EVE writes, wallet transfers, asset moves, contract actions, role changes, or external-service execution.
- Responses omit MongoDB credentials, OAuth token material, cookie signatures, worker callback secrets, and external execution handles.
