# Requirements Checklist: M54 Opportunity ESI Worker Planning

- [x] Opportunity sync requests are worker-listable and claimable.
- [x] Opportunity sync requests are externally completable through a worker-only callback.
- [x] Opportunity sync requests are failable after worker claim.
- [x] Numbers in-process run remains Numbers-only.
- [x] Worker-safe summaries reject unsafe token, raw payload, dispatch, retry, wallet, role, and access material.
- [x] Browser paths remain read-only planning/visibility paths with no ESI fetch, worker dispatch, EVE write, or external mutation.
