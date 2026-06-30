# Data Model: M48 Live Read Consent Expansion

## EsiSyncDomain

- `numbers`: Existing read-only corporation health sync domain.
- `people`: New planning-only read-sync domain for future People ingestion workers.
- `opportunity`: New planning-only read-sync domain for future Opportunity ingestion workers.

## EsiSyncDomainSummary

Existing shape extended by the new domains:

- `domain`: `numbers`, `people`, or `opportunity`.
- `label`: Browser display label.
- `requiredScopes`: Read-only ESI scope names required for the domain.
- `available`: Whether the active vault has all required scopes.
- `missingScopes`: Read-only scope names still missing.

## EsiSyncRequestDocument

Existing queued sync records now support the new domain values. In M48:

- Numbers queued records remain worker-runnable by the existing Numbers ESI sync worker.
- People and Opportunity queued records are planning-only and must not be run until later worker features define execution.
