# Research: M35 Decision Backend Filtering

## Decision: Source filters use existing source context

**Rationale**: The browser already defines decision source domains from `sourceContext.sourceType`. Reusing that model keeps Numbers and People follow-up decisions distinct from legacy Opportunity/research brief decisions.

**Alternatives considered**: Add a new persisted source domain field. Rejected for this slice because existing normalized records already provide enough information.

## Decision: Pagination remains browser-local

**Rationale**: M35 only moves status/source filtering to the API. Backend pagination would require response metadata and selection/count semantics that should be its own slice.

## Decision: Opportunity includes legacy records

**Rationale**: Earlier decision records may not have `sourceContext`; treating those as Opportunity/brief decisions preserves existing behavior.

