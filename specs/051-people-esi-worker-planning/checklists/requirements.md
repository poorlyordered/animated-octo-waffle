# Requirements Checklist: M51 People ESI Worker Planning

- [x] People sync requests are worker-listable and claimable.
- [x] People sync requests are externally completable through a worker-only callback.
- [x] Unsafe worker result material is rejected before storage/response.
- [x] Numbers in-process run remains Numbers-only.
- [x] Opportunity ESI sync remains planning-only.
- [x] Worker-safe responses expose no token material or execution handles.
- [x] Browser paths remain read-only and do not fetch ESI or mutate EVE state.
