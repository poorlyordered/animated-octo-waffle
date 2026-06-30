# Quickstart: M32 People Follow-Up Handoff

1. Open the People operating layer.
2. Locate an open leadership follow-up without a decision.
3. Record a decision from the follow-up.
4. Verify the handoff shows proposed status, approval required, and queue blocked.
5. Approve the decision and verify queue-ready state appears without queued work.
6. Create queued work and verify queue item id/status appears.
7. Record another follow-up decision and reject it.
8. Verify rejected decisions do not show queue creation.
9. Confirm all visible boundary language says this slice does not dispatch workers, mutate EVE roles/access, schedule retries, or execute external services.

Validation commands:

- `npm test -- people`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
