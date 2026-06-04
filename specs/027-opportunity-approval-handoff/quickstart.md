# Quickstart: Opportunity Approval Handoff

1. Open the dedicated Opportunity surface.
2. Record a decision from an Opportunity recommendation.
3. Confirm the handoff shows proposed status and approval controls.
4. Approve the decision and confirm queue readiness appears without queued work.
5. Create queued work and confirm queue id/status appears.
6. Record another Opportunity decision and reject it.
7. Confirm rejected decisions do not show queue creation.
8. Run validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- opportunity decision-record-api automation-queue-api`
   - `npm test -- --maxWorkers=2`
   - `npm run test:e2e`
   - `npm run build`
