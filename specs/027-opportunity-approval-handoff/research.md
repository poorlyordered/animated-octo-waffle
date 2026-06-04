# Research: Opportunity Approval Handoff

## Decision: Reuse existing decision and queue APIs

Opportunity decisions are already stored as regular decision records sourced from research briefs. The existing decision status endpoint can approve or reject them, and the existing automation queue endpoint already enforces approved-decision queue creation.

## Decision: Browser handoff metadata remains derived

No new durable handoff collection is needed. The Opportunity surface can derive approval and queue readiness from the returned decision and optional queue item.

## Decision: Approval and queue creation remain separate

Approval status change must not create queued work. Queue creation is a separate commander action available only after approval.
