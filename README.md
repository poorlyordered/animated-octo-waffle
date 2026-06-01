# Gryyk-47 Greenfield

Gryyk-47 is being rebuilt as a command operating system for an EVE Online corporation. The product goal is not a generic chatbot. It is a data-driven loop for numbers, opportunity, and people, with automation doing the hands-and-feet work while the commander keeps decision authority.

Start here:

- Constitution: `.specify/memory/constitution.md`
- Roadmap: `docs/roadmap.md`
- Spec Kit commands: `.agents/skills/`

Current phase: Command Brief MVP implemented on `001-command-brief-mvp`.

## Local Development

The Command Brief MVP uses Vitest for unit, contract, and component tests. Vitest is capped at two workers in `apps/web/vitest.config.ts` to keep local test runs from overloading the machine.

Useful commands:

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Use Netlify Dev, not plain Vite, when validating function-backed API calls locally:

- `npm run dev:netlify`

## Server Environment

MongoDB credentials are server-side only. Do not expose them as `VITE_*`.

Required Netlify/server environment variables:

- `MONGODB_URI`
- `MONGODB_DB`
- `EVEONLINE_CORPORATION_ID`

The MVP is a single-corporation read surface. Corporation scope is server-owned through `EVEONLINE_CORPORATION_ID`; the browser does not send or choose corporation identity. A later EVE SSO slice should replace this configured scope with authenticated session-derived scope.
