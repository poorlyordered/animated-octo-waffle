# Data Model: Dedicated Opportunity Surface

## OpportunitySurfaceViewModel

Derived client-side from `CommandBriefViewModel`.

- `summary`: latest executive summary or unavailable-state message
- `displayState`: command brief display state
- `provenance`: optional Opportunity ingestion provenance
- `strategicImpacts`: command brief strategic impacts
- `recommendedActions`: command brief recommended actions
- `watchlist`: command brief watchlist
- `sourceReferences`: command brief source references
- `coverage`: command brief operating leg coverage
- `boundary`: read-only Opportunity boundary text

## Existing Data Sources

- `CommandBrief`
- `OpportunityIngestionProvenance`
- `ResearchRequest`

No durable data model changes are required.
