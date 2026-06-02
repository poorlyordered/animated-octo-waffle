# Quickstart: Numbers Follow-Up Actions

## Goal

Validate that a commander can turn a Numbers follow-up candidate into a proposed decision, approve it through the existing decision workflow, then create queued work without dispatching workers or executing EVE/player-impacting actions.

## Prerequisites

- Local environment variables are configured for MongoDB and command scope.
- Test data can be written to an isolated MongoDB database such as `gryyk47_greenfield_test`.
- The app has a processed Numbers snapshot with at least one follow-up candidate.

## Seed Scenario

Create or load a Numbers snapshot with:

- Corporation scope matching the active test scope.
- One market or logistics follow-up candidate with `suggestedPath: "decision"`.
- Source references, source count, confidence, model, prompt version, and created timestamp.
- Operating-leg coverage including Numbers and optionally Opportunity.

## Validation Flow

1. Start the local app and API environment.
2. Open the Numbers surface.
3. Select the seeded follow-up candidate.
4. Create a decision from the follow-up.
5. Verify the decision:
   - Is `proposed`.
   - Links to the Numbers snapshot and candidate.
   - Preserves source references, source count, confidence, model, prompt version, and created timestamp when available.
   - Contains no execution, dispatch, retry, wallet, asset, EVE write, token, or secret fields.
6. Attempt to create the same decision again.
7. Verify the existing decision is surfaced and no duplicate record is created.
8. Approve the decision through the existing decision status workflow.
9. Create queued work from the approved decision.
10. Verify the queue item:
    - Links to the approved decision.
    - Starts as `queued`.
    - Has `attempts: 0`.
    - Has no handoff claim, worker dispatch, retry schedule, output, wallet action, asset action, EVE write, token, or secret fields.
11. Attempt to create the same queue item again.
12. Verify the existing queue item is surfaced or duplicate creation is refused without mutation.

## Expected Local Validation

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Validation Results

- 2026-06-02: `npm run lint` passed.
- 2026-06-02: `npm run typecheck` passed.
- 2026-06-02: `npm test` passed, 29 suites and 121 tests.
- 2026-06-02: `npm run test:e2e` passed, 19 browser smoke tests.
- 2026-06-02: `npm run build` passed.

## Out Of Scope

- Live ESI sync.
- ESI token vaulting.
- Worker handoff preparation.
- Worker callback processing.
- Retry scheduling.
- Wallet, asset, contract, role, standings, or external-service execution.
