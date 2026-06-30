# Quickstart: M33 People Worker Handoff

1. Open the People operating layer.
2. Record a People follow-up decision.
3. Approve the decision.
4. Create queued work.
5. Verify queued-work detail says the work is ready for explicit worker handoff preparation.
6. Select Prepare worker handoff.
7. Verify handoff id/status appears.
8. Verify boundary language says no worker was dispatched, claimed, retried, executed, and no EVE role/access or external-service action occurred.

Validation commands:

- `npm test -- people`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
