# Research: Command Brief MVP

## Decision: Use Processed Brief Reads As The First Vertical Slice

**Rationale**: The prior implementation failed when long-running AI work ran through Netlify/Inngest boundaries and model calls exceeded practical time limits. Reading already-processed records gives the commander immediate value while validating the new operating-system UI.

**Alternatives considered**:

- Trigger research from the web app: rejected for MVP because it repeats timeout and queue-observability risks.
- Build a full worker platform first: rejected because it delays the first user-visible slice.

## Decision: Keep MongoDB As The Shared Operational Store

**Rationale**: Existing OvernightDesk output already targets MongoDB collections. Keeping MongoDB avoids a migration before the product model is proven and supports document-shaped research briefs, statuses, and metadata.

**Alternatives considered**:

- New relational database: better for some future operational ledgers, but unnecessary for read-only brief MVP.
- Local static fixtures only: useful for tests, but not enough to validate real production integration.

## Decision: Use Typed Adapters Between Stored Documents And UI Contracts

**Rationale**: OvernightDesk and Gryyk-47 may evolve independently. A typed adapter can normalize arrays, missing fields, stale states, and future document changes without leaking storage shape into UI components.

**Alternatives considered**:

- Direct UI reads of backend response documents: rejected because it couples presentation to stored document shape.
- Store only markdown and render it directly: rejected because it hides confidence, source count, status, and operating-leg coverage.

## Decision: Start With Two Read Endpoints

**Rationale**: Separate `research-status` and `command-brief` endpoints make loading states clear and allow status to succeed even if a processed brief is absent. The UI can compose both into one command brief screen.

**Alternatives considered**:

- Single combined endpoint: simpler for the client, but less explicit for diagnostics.
- Client-side direct MongoDB access: rejected because credentials and scoping must stay server-side.

## Decision: Report Missing Operating Legs Explicitly

**Rationale**: The constitution requires recommendations to be grounded in numbers, opportunity, and people. The first slice is expected to have strong opportunity data but incomplete numbers and people data, so missing coverage must be visible.

**Alternatives considered**:

- Hide missing legs until integrations exist: rejected because it makes recommendations appear more complete than they are.
- Block rendering unless all legs exist: rejected because opportunity-only briefs still provide value.
