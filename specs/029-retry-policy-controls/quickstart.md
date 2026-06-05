# Quickstart: M29 Retry Policy Controls

1. Open the automation queue and select a failed worker handoff with a scheduled retry.
2. Confirm retry policy controls show run/defer options only when rescheduling is allowed.
3. Select `Defer 6 hours`.
4. Confirm the retry remains scheduled and shows updated not-before metadata.
5. Open ESI token vault sync history.
6. Repeat the same delay-control check for a scheduled Numbers sync retry.
7. Confirm no policy control copy claims dispatch, claim, execution, ESI fetch, EVE write, wallet, asset, contract, role, or external-service mutation.
