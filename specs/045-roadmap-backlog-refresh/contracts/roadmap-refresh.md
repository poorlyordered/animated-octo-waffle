# Contract: Roadmap Refresh

The M45 roadmap refresh is a documentation contract rather than an API contract.

## Required Roadmap Shape

- A completed `M45: Roadmap Backlog Refresh` section exists after M44.
- The `Near-Term Recommendation` section names M46 as the recommended next slice.
- `Recommended next-slice candidates` lists ordered candidates with enough detail to start the next Spec Kit feature.
- Each candidate preserves no-execution and explicit-approval boundaries where relevant.

## Production Readiness Contract

- `docs/production-readiness.md` keeps live-provider gaps visible.
- Repo-completed controls from M41 and M44 are not listed as open roadmap gaps.
- Class-specific worker secret environment variables are documented without exposing secret values.

## Restart Surface Contract

- `README.md` names the M45 review phase while the branch is active.
- `AGENTS.md` points to `specs/045-roadmap-backlog-refresh/plan.md`.
- `.specify/feature.json` points to `specs/045-roadmap-backlog-refresh`.
