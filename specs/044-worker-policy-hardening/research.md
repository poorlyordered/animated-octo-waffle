# Research: M44 Worker Policy Hardening

## Decision: Class-specific secrets with shared fallback

Add class-specific worker callback secrets while preserving `WORKER_CALLBACK_SECRET` as a fallback.

Rationale: this improves blast-radius control without forcing an immediate deployment migration. Operators can rotate individual worker classes over time.

## Decision: Keep worker class server-owned

Endpoint handlers pass the worker class to the auth helper; clients do not send worker class metadata to choose a policy.

Rationale: browser or worker-controlled class selection would weaken the separation by allowing a caller to pick the easiest class to authorize.

## Decision: Document policy in repo docs

Add a dedicated worker policy runbook rather than scattering operator guidance across feature specs.

Rationale: worker secret separation and retry boundaries are operational concerns that future sessions need to find quickly.
