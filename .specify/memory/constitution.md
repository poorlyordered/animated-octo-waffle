<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles: template placeholders -> Command Simulation, Data-Driven Stool, Automation With Auditability, Human Authority, Durable Architecture
Added sections: Product Boundaries, Development Workflow
Removed sections: none
Templates requiring updates: plan-template.md updated, spec-template.md updated, tasks-template.md updated
Follow-up TODOs: none
-->
# Gryyk-47 Constitution

## Core Principles

### I. Command Simulation, Not Generic Chat
Gryyk-47 MUST be designed as an AI-assisted corporation operating simulator for EVE Online. Chat is one interface, not the product boundary. Every feature MUST improve a commander's ability to understand the corporation, make a decision, assign work, or inspect results.

### II. The Three-Leg Data Stool
Every meaningful recommendation MUST connect to at least one of the three operating legs: numbers, opportunity, and people. Strategic surfaces SHOULD make all three visible when possible. If a recommendation lacks enough data, the system MUST say what is missing instead of presenting guesswork as fact.

### III. Automation Is Hands And Feet
Automation MUST collect, normalize, queue, summarize, and prepare action. It MUST NOT silently make irreversible game, financial, access-control, or player-impacting decisions. Automated jobs MUST expose status, inputs, outputs, timestamps, failures, and retry behavior.

### IV. Human Command Authority
The user remains the commander. Gryyk-47 MUST distinguish observations, recommendations, draft orders, and executed actions. Any action that affects players, assets, permissions, standings, wallets, contracts, or external services MUST require explicit approval unless a later constitution amendment defines a narrow safe automation class.

### V. Durable, Inspectable Architecture
Core data contracts MUST be stable, server-owned secrets MUST stay server-side, and long-running work MUST run outside request/response paths. The app MUST prefer small bounded modules, typed contracts, testable adapters, and reproducible artifacts over one-off glue. External AI output MUST be stored with model, prompt/version, source references, confidence, and createdAt metadata.

## Product Boundaries

Gryyk-47 is a command operating system for a player corporation, not a replacement for EVE Online clients or alliance tools. The system MAY read official EVE APIs, user-authorized ESI data, corporation data stores, and processed intelligence from OvernightDesk or similar workers. The system MUST keep source capture, AI processing, decision support, and user presentation as separable concerns.

The first-class domains are:

- Numbers: wallets, industry, logistics, markets, assets, activity, and measurable operational health.
- Opportunity: official news, patch changes, recruitment openings, market gaps, doctrine shifts, diplomacy, and expansion options.
- People: members, roles, activity, trust, skills, social graph, onboarding, retention, and delegation.

## Development Workflow

Spec Kit is the governing development process. Major work starts with constitution alignment, then spec, clarification when needed, plan, tasks, analysis, and implementation. Each feature MUST define independent user stories, measurable success criteria, data contracts, validation strategy, and operational risks before implementation.

Greenfield development MUST protect learning speed. The repo starts clean, but integrations with EVE SSO, MongoDB, Netlify, OvernightDesk, and future worker platforms MUST be introduced through adapters so they can be tested or replaced independently.

## Governance

This constitution supersedes ad hoc repo practices. A feature plan fails the constitution check if it cannot explain its data source, user decision boundary, automation behavior, test approach, and impact on the three operating legs.

Amendments require a documented reason, version bump, migration notes for affected specs, and review of dependent templates. Semantic versioning applies: MAJOR for principle removals or incompatible governance changes, MINOR for new principles or materially expanded governance, PATCH for clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-05-31 | **Last Amended**: 2026-05-31
