import type { IntelligenceRefreshRunSummary } from '@gryyk/contracts';

export const refreshBoundary =
  'Refresh runs prepare and evaluate intelligence only. They do not execute EVE or player-impacting actions.';

export const queuedRefreshRun: IntelligenceRefreshRunSummary = {
  id: 'refresh-queued',
  corporationId: '917701062',
  requestedBy: 'session:Ari Voss',
  mode: 'full_refresh',
  requestedDomains: ['numbers', 'opportunity', 'people'],
  status: 'queued',
  steps: [
    {
      id: 'step-numbers',
      domain: 'numbers',
      status: 'prepared',
      preparedRequest: { type: 'esi_sync_request', id: 'sync-numbers' },
      sectionStatuses: [],
      warnings: []
    },
    {
      id: 'step-opportunity',
      domain: 'opportunity',
      status: 'queued',
      sectionStatuses: [],
      warnings: []
    },
    {
      id: 'step-people',
      domain: 'people',
      status: 'queued',
      sectionStatuses: [],
      warnings: []
    }
  ],
  evaluation: { status: 'not_ready', sourceSummary: [] },
  policy: { allowPartialEvaluation: true, boundary: refreshBoundary },
  createdAt: '2026-07-03T00:00:00.000Z',
  updatedAt: '2026-07-03T00:00:00.000Z',
  warnings: [],
  boundary: refreshBoundary
};

export const refreshReadiness = {
  overallStatus: 'ready',
  createdAt: '2026-07-03T00:00:00.000Z',
  boundary: refreshBoundary,
  items: [
    {
      key: 'session',
      label: 'Signed session',
      status: 'ready',
      reason: 'Signed EVE session is active.',
      safeDetails: ['Commander scope resolved from server session.']
    },
    {
      key: 'esi_vault',
      label: 'ESI consent',
      status: 'ready',
      reason: 'Active read-only ESI consent is available for Numbers preparation.',
      safeDetails: ['Numbers scopes available.']
    },
    {
      key: 'model_provider',
      label: 'Brain provider',
      status: 'ready',
      reason: 'Brain provider configuration is available.',
      safeDetails: ['OpenRouter configuration present.']
    }
  ]
} as const;

export const refreshTimeline = [
  {
    stepId: 'step-numbers',
    domain: 'numbers',
    technicalStatus: 'completed',
    statusLabel: 'Completed source capture',
    statusTone: 'complete',
    completedAt: '2026-07-03T00:02:00.000Z',
    warnings: [],
    artifactLinks: [{ label: 'Numbers sync', type: 'esi_sync_request', id: 'sync-numbers' }],
    canRetry: false,
    canSkip: false
  },
  {
    stepId: 'step-people',
    domain: 'people',
    technicalStatus: 'failed',
    statusLabel: 'Failed: People ESI worker unavailable.',
    statusTone: 'failed',
    failedAt: '2026-07-03T00:03:00.000Z',
    failure: 'People ESI worker unavailable.',
    warnings: [],
    artifactLinks: [],
    canRetry: true,
    canSkip: true,
    nextAction: 'Record retry intent or skip with missing People outputs.'
  }
] as const;

export const refreshEvents = [
  {
    id: 'event-refresh-created',
    runId: 'refresh-partial',
    corporationId: '917701062',
    eventType: 'run_created',
    actor: 'session:Ari Voss',
    message: 'Commander created full refresh run.',
    safeDetails: ['Domains: numbers, opportunity, people'],
    artifactLinks: [],
    createdAt: '2026-07-03T00:00:00.000Z'
  },
  {
    id: 'event-people-failed',
    runId: 'refresh-partial',
    corporationId: '917701062',
    eventType: 'step_failed',
    actor: 'worker:people-worker',
    stepId: 'step-people',
    domain: 'people',
    message: 'People step failed.',
    safeDetails: ['People ESI worker unavailable.'],
    artifactLinks: [],
    createdAt: '2026-07-03T00:03:00.000Z'
  }
] as const;

export const partialRefreshRun: IntelligenceRefreshRunSummary = {
  ...queuedRefreshRun,
  id: 'refresh-partial',
  status: 'waiting_for_evaluation',
  steps: [
    {
      id: 'step-numbers',
      domain: 'numbers',
      status: 'completed',
      preparedRequest: { type: 'esi_sync_request', id: 'sync-numbers' },
      completedAt: '2026-07-03T00:02:00.000Z',
      sourceCount: 12,
      sectionStatuses: [{ key: 'wallet', status: 'complete' }],
      warnings: []
    },
    {
      id: 'step-people',
      domain: 'people',
      status: 'failed',
      failedAt: '2026-07-03T00:03:00.000Z',
      sectionStatuses: [],
      failure: { reason: 'People ESI worker unavailable.', failedAt: '2026-07-03T00:03:00.000Z' },
      warnings: []
    }
  ],
  evaluation: {
    status: 'ready',
    sourceSummary: ['numbers completed with 12 sources', 'people failed: People ESI worker unavailable.']
  },
  updatedAt: '2026-07-03T00:03:00.000Z',
  warnings: ['Partial evaluation is available because at least one domain completed.']
};

export const completedRefreshRun: IntelligenceRefreshRunSummary = {
  ...partialRefreshRun,
  id: 'refresh-completed',
  status: 'completed_with_warnings',
  evaluation: {
    status: 'completed',
    brainRunId: 'brain-1',
    commandBriefId: 'brief-1',
    model: 'openai/gpt-5.2',
    provider: 'openrouter',
    promptVersion: 'brain-command-v1',
    confidence: 0.82,
    sourceSummary: ['numbers completed with 12 sources', 'people failed: People ESI worker unavailable.'],
    createdAt: '2026-07-03T00:04:00.000Z',
    completedAt: '2026-07-03T00:04:30.000Z'
  },
  completedAt: '2026-07-03T00:04:30.000Z',
  updatedAt: '2026-07-03T00:04:30.000Z'
};
