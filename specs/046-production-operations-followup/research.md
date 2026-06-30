# Research: M46 Production Operations Follow-up

## Decision: Keep M46 as an operations documentation slice

Rationale: The roadmap calls for production operations follow-up after readiness gaps were refreshed. The repo can define evidence, verification, monitoring, and rollback requirements, but it cannot prove live Netlify, EVE SSO provider, MongoDB backup, or external monitoring posture without provider access and operator decisions.

Alternatives considered:

- Deploy directly from M46: rejected because M46 is meant to prepare the operation and evidence trail, not bypass live-provider verification.
- Add request-path provider probes: rejected because live provider checks should not create new app behavior or run long external operations in request paths.

## Decision: Store no secret material in evidence

Rationale: Production operations need durable evidence, but repo artifacts and PR comments must never capture secret values, tokens, cookies, connection strings, or raw production records.

Alternatives considered:

- Store redacted secret screenshots: rejected because screenshots can accidentally leak enough material to be unsafe.
- Store hashes of secrets: rejected because the repo does not need secret fingerprints to prove operational readiness.

## Decision: Recommend a read-only operations health surface for M47

Rationale: M46 creates an operator checklist. A future product slice can turn safe status data into a read-only commander-facing health surface once the operational categories are explicit.

Alternatives considered:

- Expand ESI read consent next: rejected for now because live operations posture should be visible before adding more live read paths.
- Add worker auto-dispatch next: rejected by the no-execution and human-authority boundaries.
