# Data Model: Opportunity Approval Handoff

## DecisionRecord

Existing decision record sourced from a research brief. Status changes from `proposed` to `approved` or `rejected` through the generic decision status endpoint.

## AutomationQueueItem

Existing queued work record created from an approved Opportunity decision. The queue item links to `sourceDecisionId`.

## OpportunityDecisionHandoff

Browser-derived handoff summary:

- `decisionId`
- `decisionStatus`
- `queueReady`
- `queueItemId`
- `queueStatus`
- `sourceBriefId`
- `sourceRecommendation`
- `sourceCount`
- `focus`
- `provenanceMode`
- `message`
- `boundary`

## Boundaries

Approval updates only decision status. Queue creation creates a queued work record only. Neither action dispatches workers, prepares handoffs, schedules research, fetches ESI, writes to EVE, mutates wallet/asset/contract/role state, or executes external services.
