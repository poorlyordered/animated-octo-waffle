# Data Model: Browser Workflow Smoke Tests

## BrowserSmokeScenario

Represents one real-browser validation flow for a command surface.

Fields:

- `id`: Stable scenario identifier.
- `surface`: One of `command-brief`, `decision-records`, `automation-queue`, or `people`.
- `description`: Human-readable validation purpose.
- `fixtureSet`: The deterministic fixture bundle used by the scenario.
- `expectedLandmarks`: Headings, sections, and notices that must be visible.
- `forbiddenText`: Execution or mutation claims that must not appear.
- `diagnostics`: Console, page error, failed request, and screenshot information captured on failure.

Validation rules:

- Each existing command surface must have at least one scenario.
- Each scenario must define at least one expected visible landmark.
- Player-impacting or automation-related scenarios must define relevant forbidden execution language.

## CommandSurfaceFixture

Represents deterministic local data used by browser smoke scenarios.

Fields:

- `commandBrief`: Processed command brief and research status fixture data.
- `decisionRecords`: Decision record list/detail fixture data, including player-impacting approval state.
- `automationQueue`: Queue item fixture data, including queued, failed, and completed states.
- `people`: Member profile and leadership follow-up fixture data, including missing links and approval state.

Validation rules:

- Fixtures must avoid production secrets and live identifiers that imply mutation.
- Fixtures must include enough data to avoid blank-state-only validation.
- Fixtures should reuse existing contract fixture shapes where practical.

## BrowserSmokeResult

Represents the recorded outcome for feature validation.

Fields:

- `command`: Exact command executed.
- `startedAt`: Validation start timestamp.
- `status`: `passed`, `failed`, or `blocked`.
- `duration`: Human-readable elapsed time.
- `notes`: Known setup constraints or failure details.

Validation rules:

- Validation artifacts must record all commands used for final handoff.
- Blocked results must explain the external missing prerequisite, such as unavailable browser binaries.
