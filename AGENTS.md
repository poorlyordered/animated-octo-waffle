# Gryyk-47 Greenfield Agent Guide

Read these before changing product behavior:

1. `.specify/memory/constitution.md`
2. `docs/roadmap.md`
3. `specs/002-decision-record-loop/plan.md`

Use Spec Kit for major work: constitution, specify, clarify when needed, plan, tasks, analyze, implement. Keep generated specs and implementation in sync.

Project constraints:

- Treat Gryyk-47 as a corporation command operating system, not a generic chat app.
- Preserve the numbers, opportunity, and people operating model in features and data contracts.
- Keep long-running AI/research work outside request/response functions.
- Keep server secrets server-side only.
- Require explicit user approval for irreversible or player-impacting actions.
