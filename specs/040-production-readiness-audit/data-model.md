# Data Model: M40 Production Readiness Audit

## Readiness Item

- `area`: build, environment, secrets, validation, command surface, data, monitoring, or deployment
- `status`: ready, needs configuration, unverified, or follow-up
- `evidence`: repo evidence or command output that supports the status
- `risk`: why the item matters for production
- `nextAction`: concrete action before or after deploy

## Environment Variable

- `name`: variable name
- `classification`: required, production-required, optional, or test-only
- `owner`: Netlify/server runtime, EVE SSO app, worker, or local test
- `secret`: whether the value must remain server-side
- `notes`: safe usage notes without values
