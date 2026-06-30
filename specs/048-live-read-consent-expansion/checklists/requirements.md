# Requirements Checklist: M48 Live Read Consent Expansion

## Completeness

- [x] ESI sync domain contract includes Numbers, People, and Opportunity.
- [x] Vault status lists all read-sync domains.
- [x] Prepare sync accepts People and Opportunity domains.
- [x] Non-Numbers sync records remain planning-only.
- [x] ESI sync worker rejects non-Numbers run attempts.
- [x] Browser smoke covers multi-domain rendering and non-Numbers prepare boundary.
- [x] Roadmap records M48 completion and recommends M49.

## Quality

- [x] Requirements are measurable through contract/unit/browser tests.
- [x] No secret values are introduced.
- [x] No People/Opportunity ESI fetch, EVE write, worker dispatch, retry execution, or external-service mutation is introduced.
