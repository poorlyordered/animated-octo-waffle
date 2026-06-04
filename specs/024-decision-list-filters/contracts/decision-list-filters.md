# Contract: Decision List Filters

M24 does not add a backend API contract.

The browser consumes existing `GET /api/decision-records` responses and derives:

- source labels
- status/source filter output
- workload counts

Derived metadata MUST be browser-safe and MUST NOT include tokens, worker secrets, dispatch targets, EVE write handles, queue execution handles, or external-service execution handles.
