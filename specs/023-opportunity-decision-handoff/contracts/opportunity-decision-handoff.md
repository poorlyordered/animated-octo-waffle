# Contract: Opportunity Decision Handoff

M23 does not add a backend endpoint.

The browser uses:

- `POST /api/decision-records`

with the existing `CreateDecisionRecordRequest` contract.

Derived browser handoff metadata MUST be safe to serialize and MUST NOT include tokens, worker secrets, queue handles, dispatch targets, EVE write handles, or execution handles.
