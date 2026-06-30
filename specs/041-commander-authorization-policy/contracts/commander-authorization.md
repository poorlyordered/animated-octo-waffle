# Contract: Commander Authorization Policy

## Scope Resolution

- Valid signed session matching `EVEONLINE_CORPORATION_ID` resolves to session scope.
- No valid signed session resolves to fallback scope when `EVEONLINE_CORPORATION_ID` exists.
- Valid signed session with a different corporation id returns an unauthorized policy failure.
- Browser-controlled headers, query parameters, and bodies do not affect corporation scope.

## Command API Response

Unauthorized signed sessions return:

```json
{
  "error": "Signed EVE session is not authorized for this corporation"
}
```

Status: `403`.

## Session State Response

Unauthorized signed sessions return display-safe identity and a safe reason; no secrets or token material are included.
