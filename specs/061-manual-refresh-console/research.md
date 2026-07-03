# Research: Manual Refresh Console

## Decision: Extend Intelligence Refresh Runs Instead Of Creating A New Pipeline

**Rationale**: Existing contracts, store helpers, worker callbacks, and UI already model durable refresh runs with domain steps and Brain evaluation linkage. Extending them avoids duplicate lifecycle state and keeps command-board processing labels grounded in one canonical run record.

**Alternatives considered**:

- Build a separate refresh-console collection. Rejected because it would duplicate run status and require reconciliation with `intelligence_refresh_runs`.
- Make command board buttons execute pulls directly. Rejected because it violates the constitution boundary for long-running work and browser request paths.

## Decision: Model Refresh Mode As Commander Intent On Run Creation

**Rationale**: The current run request only carries domains and reason. Adding a refresh mode lets the UI distinguish evaluating existing stored data from preparing fresh source pulls or a full refresh without implying the browser executed work.

**Alternatives considered**:

- Encode mode in free-text reason. Rejected because it is not machine-testable and cannot drive duplicate active-run behavior.
- Create separate endpoints per mode. Rejected because mode is a property of one command artifact, not separate products.

## Decision: Readiness Is A Browser-Safe Checklist

**Rationale**: The commander needs to know whether session, corporation authorization, ESI consent/scopes, provider config, worker callback config, and storage are ready before creating more queued work. Each item can expose status, reason, required action, and safe details without secrets.

**Alternatives considered**:

- Hide readiness inside run creation failures. Rejected because it preserves the current mystery around processing/blocking states.
- Expose raw config state. Rejected because secrets and server internals must stay server-side.

## Decision: Store Events As Refresh Run Events

**Rationale**: The run detail needs a durable event log independent from the current step summary array. Events make commander actions, worker transitions, retry intent, skip intent, and evaluation outcomes auditable.

**Alternatives considered**:

- Derive all events from current step fields. Rejected because it loses chronology and repeated retry/skip attempts.
- Reuse retry request history only. Rejected because refresh events include readiness/run creation/worker/evaluation events beyond retry.

## Decision: Retry And Skip Are Intent Records From Browser Paths

**Rationale**: The browser can record commander intent and update event/timeline state, but cannot dispatch a worker, fetch ESI, call OpenRouter, or mutate EVE. This preserves the existing automation-as-hands-and-feet model.

**Alternatives considered**:

- Browser-triggered worker execution. Rejected by constitution and existing architecture.
- No recovery controls. Rejected because failed/blocked processing would remain non-actionable.

## Decision: Board Status Labels Are Derived From Existing Run State

**Rationale**: The board remains a summary surface. It should show specific labels and link to run detail, while the Refresh Console owns control and explanation.

**Alternatives considered**:

- Duplicate full timeline on every board panel. Rejected because it would overload the board and create repeated UI logic.
- Keep generic `processing`. Rejected because it was the user-reported pain point.
