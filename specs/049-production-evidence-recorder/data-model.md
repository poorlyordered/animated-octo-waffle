# Data Model: M49 Production Evidence Recorder

## ProductionEvidenceRecord

- `id`: MongoDB id as string
- `corporationId`: server-owned command corporation scope
- `environment`: `production`, `staging`, or `controlled_staging`
- `decision`: `go`, `no_go`, or `controlled_staging`
- `commitSha`: reviewed commit SHA
- `pullRequestUrl`: optional PR URL
- `deployId`: optional deployment identifier
- `rollbackTarget`: optional rollback deploy id or commit
- `checks`: fixed validation evidence checks
- `recordedBy`: `session:<characterName>` or `command-scope:<corporationId>`
- `recordedAt`: ISO timestamp
- `boundary`: no-secret, no-production-export boundary text

## ProductionEvidenceCheck

- `key`: one of validation, Netlify environment, EVE SSO provider, MongoDB, monitoring, worker secrets, smoke test, rollback
- `status`: `verified`, `attention`, `blocked`, or `not_applicable`
- `evidence`: bounded value-free text

## Storage

Collection: `production_evidence_records`

Records are scoped by `corporationId` and listed newest-first. They must not store secret values, token material, raw logs, connection strings, cookies, JWTs, or production record exports.
