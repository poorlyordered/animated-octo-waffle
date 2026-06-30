# Quickstart: M34 People Handoff Retry Controls

1. Open the People operating layer.
2. Record and approve a People follow-up decision.
3. Create queued work and prepare a failed worker handoff fixture.
4. Schedule handoff retry.
5. Reschedule the retry.
6. Apply a bounded delay policy.
7. Cancel the retry.
8. Verify retry state/history appears and all boundary text says no worker dispatch, claim, execution, EVE role/access change, or external-service action occurred.

Validation commands:

- `npm test -- people`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
