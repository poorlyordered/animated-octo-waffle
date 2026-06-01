# Data Model: Command Brief MVP

## CommandBrief

Represents the latest processed intelligence artifact for a corporation and focus.

Fields:

- `id`: stable document identifier.
- `corporationId`: corporation this brief belongs to.
- `focus`: research focus, initially `grykk-47-eve-official-news`.
- `createdAt`: when the processed brief was stored.
- `model`: AI model or processor identifier that produced the brief.
- `promptVersion`: prompt or processor version that shaped the brief.
- `sourceCount`: number of source items used.
- `sourceReferences`: source identifiers, URLs, titles, or other safe references used to create the brief.
- `confidence`: numeric confidence from 0 to 1.
- `executiveSummary`: concise commander-facing summary.
- `briefMarkdown`: longer processed brief content.
- `strategicImpacts`: list of strategic impact statements.
- `recommendedActions`: list of commander-facing recommendations.
- `watchlist`: list of issues, entities, or events to monitor.
- `memory`: durable context items useful for future decisions.
- `coverage`: derived `OperatingLegCoverage`.

Validation rules:

- `corporationId`, `focus`, and `createdAt` are required.
- `confidence` must be between 0 and 1 when present.
- Missing list fields normalize to empty lists.
- `sourceCount` must match `sourceReferences` when references are available.
- Briefs for other corporations must never be returned to the active commander.

## ResearchRequest

Represents the latest background research request/status for a corporation and focus.

Fields:

- `id`: stable document identifier.
- `corporationId`: corporation this request belongs to.
- `focus`: research focus.
- `status`: one of `queued`, `raw_captured`, `processing`, `processed`, `failed`.
- `createdAt`: when the request was created.
- `updatedAt`: most recent status update timestamp.
- `requestedBy`: character or user that requested the job, when available.
- `errorMessage`: safe failure message, present only for failed requests.

State transitions:

```text
queued -> raw_captured -> processing -> processed
queued -> failed
raw_captured -> failed
processing -> failed
```

Validation rules:

- Unknown statuses normalize to a safe failure/unknown presentation state and are logged server-side.
- `errorMessage` must be sanitized before reaching the client.

## OperatingLegCoverage

Derived indicator for the three operating legs in the constitution.

Fields:

- `numbers`: `present`, `missing`, or `stale`.
- `opportunity`: `present`, `missing`, or `stale`.
- `people`: `present`, `missing`, or `stale`.
- `missingReasons`: optional messages explaining missing or stale legs.

Validation rules:

- Opportunity is present when a processed official-news brief has at least one source or strategic output.
- Numbers and people are missing until their source data is included in the brief or a future integration.
- Coverage must be visible anywhere recommendations are shown.

## CommandBriefViewModel

Client-facing composition of latest brief and latest request status.

Fields:

- `brief`: latest `CommandBrief`, or null.
- `request`: latest `ResearchRequest`, or null.
- `displayState`: `empty`, `processing`, `processed`, `failed`, or `stale`.
- `staleReason`: optional message when request recency makes the shown brief stale.

Validation rules:

- If no brief and no request exist, display state is `empty`.
- If latest request is processing and no newer processed brief exists, display state is `processing`.
- If latest request failed and is newer than the latest brief, display state is `stale` with failure context.
- If latest request failed and no brief exists, display state is `failed`.
