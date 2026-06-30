# Research: M50 Operations Health Filtering

## Decision: browser-local filters only

Rationale: the roadmap explicitly excludes server preference storage and live-provider calls. Local state is enough to organize a single operations-health response without expanding auth, persistence, or API contracts.

Rejected alternative: persisted saved filters. That would introduce preference storage that is out of scope for M50.

## Decision: filter workers by both status and secret state

Rationale: the roadmap names worker readiness states. In the current contract, operators care about both readiness status (`ready`, `degraded`, `blocked`) and secret posture (`configured`, `fallback`, `missing`), so the surface exposes both.

Rejected alternative: a single combined filter. It would make common investigations like blocked plus missing less direct.

## Decision: no operations-health contract change

Rationale: M47 already returns all data needed for warning and worker filtering. Adding fields would increase API churn without improving the slice.
