# Research: M36 Cross-Surface Retry Audit Filtering

## Decision: Use browser-local filtering

**Rationale**: Retry histories are already embedded in the surface response and this slice is about audit readability, not backend retrieval.

**Alternatives considered**: Add retry history API endpoints. Rejected because it would expand backend scope without evidence that embedded histories are too large.

## Decision: Share a component across retry surfaces

**Rationale**: Automation Queue and ESI already duplicated detailed retry summary formatting while Opportunity and People used shorter local summaries. A shared component makes status filtering and boundary language consistent.

## Decision: Keep all status options visible

**Rationale**: Empty filtered states are useful audit feedback and keep controls recoverable.

