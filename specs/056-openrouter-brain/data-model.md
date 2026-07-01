# Data Model: OpenRouter Brain

## Brain Run

Represents one trusted server-side model reasoning attempt.

Fields:

- `id`: stable string id.
- `corporationId`: scoped corporation id.
- `focus`: command focus, default `gryyk-47-brain`.
- `status`: `queued`, `processing`, `processed`, or `failed`.
- `requestedBy`: worker/operator id when supplied.
- `workerId`: trusted worker id when supplied.
- `provider`: `openrouter`.
- `model`: configured or returned model slug.
- `promptVersion`: version string for the Brain prompt contract.
- `sourceReferences`: safe source references used for the run.
- `createdAt`, `updatedAt`, `claimedAt`, `completedAt`, `failedAt`: lifecycle timestamps.
- `errorMessage`: safe error category/message, never raw secrets or provider payloads.

Persistence:

- Stored in `research_requests` using focus `gryyk-47-brain`.

State transitions:

- `queued` -> `processing` -> `processed`
- `queued` -> `processing` -> `failed`
- Missing configuration may produce `failed` or blocked status without calling the provider.

## Brain Prompt Context

Represents bounded, safe context supplied to the model.

Fields:

- `corporationId`
- `focus`
- `generatedAt`
- `numbers`: summary of current numbers snapshot or missing reason.
- `opportunity`: latest opportunity/brief summary or missing reason.
- `people`: summary of people/follow-up status or missing reason.
- `decisions`: recent decision status counts and safe summaries.
- `queue`: automation queue status counts and safe summaries.
- `sourceReferences`: safe source references for provenance.

Validation:

- No secrets, tokens, OAuth material, callback secrets, connection strings, or raw provider payloads.
- Text values are bounded before prompt construction.

## Brain Output

Validated model output before conversion to a command brief.

Fields:

- `executiveSummary`
- `briefMarkdown`
- `strategicImpacts`
- `recommendedActions`
- `watchlist`
- `memory`
- `missingData`
- `confidence`
- `coverage`
- `draftOrders`: review-only draft work requiring commander approval.

Validation:

- Arrays have bounded lengths.
- Text values have bounded lengths.
- `confidence` is clamped by schema to 0 through 1.
- Coverage must explicitly mark numbers, opportunity, and people as present, missing, or stale.
- Draft orders cannot include execution handles or status implying completed action.

Persistence:

- Converted into a `research_briefs` document compatible with `CommandBrief`.

## Provider Configuration

Server-side environment configuration.

Variables:

- `OPENROUTER_API_KEY`: required to call provider.
- `OPENROUTER_MODEL`: optional model slug.
- `OPENROUTER_BASE_URL`: optional base URL override, defaulting to official API root.
- `OPENROUTER_APP_URL`: optional attribution URL.
- `OPENROUTER_APP_TITLE`: optional attribution title.
- `OPENROUTER_TIMEOUT_MS`: optional timeout override.
- `OPENROUTER_MAX_COMPLETION_TOKENS`: optional response budget.
- `BRAIN_WORKER_CALLBACK_SECRET`: optional Brain worker class secret; falls back to `WORKER_CALLBACK_SECRET`.

Validation:

- API key is required only for live provider calls.
- Base URL must use HTTPS.
- Numeric settings must be bounded.
