# Data Model: M35 Decision Backend Filtering

## DecisionRecordSourceFilter

- `opportunity`: research brief or legacy decision records without source context
- `numbers`: decisions with `sourceContext.sourceType = numbers_follow_up`
- `people`: decisions with `sourceContext.sourceType = people_follow_up`

## DecisionRecord List Query

- `corporationId`: required server-owned scope
- `status`: optional bounded decision status
- `source`: optional bounded source domain
- `sourceBriefId`: optional existing brief/snapshot id filter

