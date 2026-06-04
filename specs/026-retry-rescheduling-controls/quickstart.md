# Quickstart: Retry Rescheduling Controls

1. Open automation queue detail for a failed worker handoff with a scheduled retry.
2. Confirm the retry policy shows reschedule eligibility and the Reschedule retry control is enabled.
3. Reschedule the retry and confirm the response remains scheduled with a not-before timestamp.
4. Open ESI token vault sync history for a failed Numbers sync request with a scheduled retry.
5. Reschedule the retry and confirm the response remains scheduled with a not-before timestamp.
6. Confirm blocked/completed/canceled retries do not present enabled reschedule controls.
7. Run validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- retry-request-store retry-worker-api worker-handoff-api esi-sync-api`
   - `npm test -- --maxWorkers=2`
   - `npm run test:e2e`
   - `npm run build`
