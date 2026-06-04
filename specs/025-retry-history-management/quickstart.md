# Quickstart: Retry History Management

1. Load automation queue detail for a failed handoff with multiple retry attempts.
2. Confirm the latest retry is still visible in the existing retry row.
3. Confirm retry history lists recent attempts with statuses, reasons, cancellation/block/completion details, and policy boundary.
4. Load ESI token vault sync history for a failed Numbers sync request with multiple retry attempts.
5. Confirm retry history appears under that sync item and remains read-only.
6. Run validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- retry-request-store worker-handoff-api esi-sync-api`
   - `npm test`
   - `npm run test:e2e`
   - `npm run build`
