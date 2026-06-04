# Research: Decision List Filters

## Decision: Browser-Local Filters

M24 filters the currently loaded decision list in the browser.

**Rationale**: The current list size is small and the existing API already returns the records needed for review. Browser-local filters avoid introducing backend complexity before pagination or larger history needs are proven.

## Decision: Source Domain Labels From Existing Context

Numbers decisions are identified by `sourceContext.sourceType === "numbers_follow_up"`. Everything else is treated as Opportunity/brief context for this slice.

**Rationale**: Existing command brief and Opportunity decisions share the `research_brief` source model. This is enough to distinguish the current operating-domain sources without changing contracts.
