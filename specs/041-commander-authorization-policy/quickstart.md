# Quickstart: M41 Commander Authorization Policy

1. Create a signed session cookie for the configured `EVEONLINE_CORPORATION_ID`.
2. Confirm command APIs resolve session scope.
3. Create a signed session cookie for a different corporation id.
4. Confirm command APIs return 403 and do not fall back.
5. Confirm `/api/eve-session` reports an unauthorized session state without secrets.
