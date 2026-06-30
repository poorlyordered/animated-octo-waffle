# Contract: Production Operations

The M46 production operations follow-up is a documentation/runbook contract rather than an API contract.

## Required Runbook Sections

- Operating boundary
- Pre-deploy evidence checklist
- Netlify environment verification
- EVE SSO provider verification
- MongoDB operations verification
- Monitoring and alerting
- Worker secret rotation posture
- Deploy and smoke verification
- Rollback procedure
- Go/no-go record

## Evidence Contract

- Evidence may name variable names, setting names, environment names, commit SHAs, deploy ids, PR URLs, callback URLs, scope names, owners, timestamps, and pass/fail results.
- Evidence must not include secret values, connection strings, access tokens, refresh tokens, JWTs, cookies, token hashes, sealing keys, OAuth secrets, worker secrets, raw production records, or production data exports.

## Boundary Contract

- The runbook must not require or imply browser/request-path deployment, worker dispatch, ESI fetch outside scoped read flows, EVE writes, wallet/asset/contract/role mutation, standing/access changes, or external-service mutation.
- Production deploy and rollback guidance must preserve MongoDB data.
- Live provider verification remains an operator action outside app request paths.

## Restart Surface Contract

- `README.md` names the M46 review phase while the branch is active.
- `AGENTS.md` points to `specs/046-production-operations-followup/plan.md`.
- `.specify/feature.json` points to `specs/046-production-operations-followup`.
- `docs/roadmap.md` records M46 completion and recommends M47.
