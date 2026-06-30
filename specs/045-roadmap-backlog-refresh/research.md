# Research: M45 Roadmap Backlog Refresh

## Decision: Refresh the roadmap after ingestion and worker policy hardening

Rationale: M42 and M43 added worker-backed People and Opportunity ingestion lifecycles, and M44 hardened worker callback authorization. The roadmap tail now needs a fresh restart point that reflects those delivered controls before another implementation slice begins.

Alternatives considered:

- Start a new ingestion capability immediately: rejected because the roadmap explicitly called for reassessment after ingestion expansion and worker policy hardening.
- Treat production readiness as complete: rejected because repo tests do not verify live Netlify, EVE SSO, MongoDB backup/access policy, or monitoring state.

## Decision: Recommend a production-operations follow-up for M46

Rationale: The command loop now has broad browser/API coverage and worker policy documentation, but live-provider and operating-runbook gaps remain. A production-operations follow-up is the next bounded slice that can convert readiness audit gaps into concrete repo artifacts and verification steps.

Alternatives considered:

- Add automatic worker dispatch: rejected by human-authority and no-execution boundaries.
- Add external mutations: rejected because player-impacting actions require a separately specified approval and execution model.
- Add another roadmap-only refresh: rejected because M45 can name a concrete M46 slice.
