# Data Model: Numbers Operating Layer

## NumbersSnapshot

Latest processed corporation numbers state for one corporation scope.

Fields:

- `id`: Stable snapshot identifier.
- `corporationId`: Server-owned corporation scope.
- `focus`: Optional snapshot focus, defaulting to `corporation`.
- `sections`: Wallet, assets, logistics, market, and activity sections.
- `observations`: Commander-readable observations.
- `risks`: Risk summaries.
- `opportunities`: Opportunity summaries.
- `followUps`: Display-only planning candidates.
- `provenance`: Source and processing metadata.
- `createdAt`: ISO timestamp when the snapshot was created.
- `updatedAt`: ISO timestamp when the snapshot was updated.

Validation rules:

- `corporationId`, `sections`, `provenance`, and timestamps are required.
- Browser-visible snapshots must not include secrets, OAuth tokens, cookie signatures, MongoDB credentials, or dispatch targets.
- Missing sections are represented explicitly rather than omitted from the response.

## NumbersSection

One numbers operating section: wallet, assets, logistics, market, or activity.

Fields:

- `key`: Section key.
- `label`: Display label.
- `status`: `healthy`, `watch`, `critical`, `stale`, or `missing`.
- `summary`: Commander-readable summary.
- `metrics`: Display-safe measured values.
- `updatedAt`: Optional ISO timestamp for section data freshness.
- `staleReason`: Optional reason when stale.
- `missingReason`: Optional reason when missing.

Validation rules:

- Missing sections must include `missingReason`.
- Stale sections must include `staleReason`.
- Metrics are display-only and must not include action instructions.

## NumbersMetric

Display-safe measured value.

Fields:

- `label`: Metric label.
- `value`: Human-readable value.
- `unit`: Optional unit.
- `trend`: Optional `up`, `down`, `flat`, or `unknown`.
- `severity`: Optional `info`, `watch`, or `critical`.

Validation rules:

- Values are strings for display stability across ISK, counts, volume, and percentages.

## NumbersFollowUpCandidate

Recommendation-derived planning candidate.

Fields:

- `id`: Stable candidate identifier.
- `title`: Candidate title.
- `rationale`: Why the follow-up matters.
- `suggestedPath`: `decision` or `queue`.
- `isPlayerImpacting`: Whether explicit approval would be required in later workflows.
- `relatedSection`: Optional section key.

Validation rules:

- Candidates are display-only in M8.
- Player-impacting candidates must be visibly marked.

## NumbersProvenance

Source and processing metadata.

Fields:

- `sourceCount`: Number of source inputs.
- `sourceReferences`: Source references.
- `confidence`: Optional confidence value from 0 to 1.
- `model`: Optional model identifier.
- `promptVersion`: Optional prompt/version identifier.
- `createdAt`: ISO timestamp for provenance creation.

Validation rules:

- Source references are browser-safe.
- Missing model/prompt metadata is allowed but shown as unavailable.
