# Contract: Opportunity Surface Data

M22 does not add a new backend endpoint.

The browser surface consumes the existing command brief contract:

- `GET /api/command-brief?focus=<focus>`
- `GET /api/research-status?focus=<focus>`

The derived surface MUST remain browser-safe and read-only. It MUST NOT include tokens, worker secrets, dispatch targets, EVE write handles, scheduling handles, or execution handles.
