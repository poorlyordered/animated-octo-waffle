# Gryyk-47 Greenfield

Gryyk-47 is being rebuilt as a command operating system for an EVE Online corporation. The product goal is not a generic chatbot. It is a data-driven loop for numbers, opportunity, and people, with automation doing the hands-and-feet work while the commander keeps decision authority.

Start here:

- Constitution: `.specify/memory/constitution.md`
- Roadmap: `docs/roadmap.md`
- Spec Kit commands: `.agents/skills/`

Current phase: foundation. The next expected step is a Spec Kit feature spec for the Command Brief MVP.

## Local Development

The Command Brief MVP uses Vitest for unit, contract, and component tests. Vitest is capped at two workers in `apps/web/vitest.config.ts` to keep local test runs from overloading the machine.

Useful commands:

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Server Environment

MongoDB credentials are server-side only. Do not expose them as `VITE_*`.

Required Netlify/server environment variables:

- `MONGODB_URI`
- `MONGODB_DB`

Local function requests also need a corporation scope. The development helper currently accepts `x-corporation-id` or `corporationId` for local testing; production auth should derive this from the authenticated EVE SSO session.
