import type { OperationsHealthResponse } from '@gryyk/contracts';

export const operationsHealthResponse: OperationsHealthResponse = {
  generatedAt: '2026-06-30T22:10:00.000Z',
  corporationId: '917701062',
  overallStatus: 'degraded',
  commandApis: [
    {
      key: 'command_brief',
      label: 'Command brief',
      status: 'ready',
      evidence: '3 scoped research_briefs records found.',
      lastUpdatedAt: '2026-06-30T21:50:00.000Z'
    },
    {
      key: 'numbers',
      label: 'Numbers API',
      status: 'ready',
      evidence: '1 scoped numbers_snapshots records found.',
      lastUpdatedAt: '2026-06-30T21:45:00.000Z'
    },
    {
      key: 'opportunity',
      label: 'Opportunity API',
      status: 'ready',
      evidence: '3 scoped research_briefs records found.',
      lastUpdatedAt: '2026-06-30T21:50:00.000Z'
    },
    {
      key: 'people',
      label: 'People API',
      status: 'ready',
      evidence: '2 scoped member_profiles records found.',
      lastUpdatedAt: '2026-06-30T21:40:00.000Z'
    },
    {
      key: 'decision_records',
      label: 'Decision Records API',
      status: 'ready',
      evidence: '8 scoped strategic_decisions records found.',
      lastUpdatedAt: '2026-06-30T21:35:00.000Z'
    },
    {
      key: 'automation_queue',
      label: 'Automation Queue API',
      status: 'ready',
      evidence: '4 scoped automation_queue records found.',
      lastUpdatedAt: '2026-06-30T21:30:00.000Z'
    },
    {
      key: 'esi_sync',
      label: 'ESI sync API',
      status: 'degraded',
      evidence: '0 scoped esi_sync_requests records found.',
      lastUpdatedAt: null
    }
  ],
  ingestion: [
    {
      key: 'numbers_esi_sync',
      label: 'Numbers ESI sync',
      status: 'degraded',
      queued: 1,
      processing: 0,
      completed: 2,
      failed: 1,
      latestAt: '2026-06-30T21:20:00.000Z',
      evidence: '1 queued, 0 processing, 2 completed, 1 failed records.'
    },
    {
      key: 'people_ingestion',
      label: 'People ingestion',
      status: 'ready',
      queued: 0,
      processing: 1,
      completed: 3,
      failed: 0,
      latestAt: '2026-06-30T21:10:00.000Z',
      evidence: '0 queued, 1 processing, 3 completed, 0 failed records.'
    },
    {
      key: 'opportunity_ingestion',
      label: 'Opportunity ingestion',
      status: 'degraded',
      queued: 1,
      processing: 1,
      completed: 4,
      failed: 1,
      latestAt: '2026-06-30T21:00:00.000Z',
      evidence: '1 queued, 1 processing, 4 completed, 1 failed records.'
    }
  ],
  retryPosture: {
    scheduled: 2,
    claimed: 0,
    completed: 5,
    blocked: 1,
    canceled: 1,
    workerHandoffTargets: 6,
    esiSyncTargets: 3,
    evidence: '2 scheduled retries, 1 blocked retries, 6 worker handoff targets, 3 ESI sync targets.'
  },
  workerReadiness: [
    {
      workerClass: 'worker_handoff',
      label: 'Worker handoff callbacks',
      secretState: 'configured',
      status: 'ready',
      evidence: 'WORKER_HANDOFF_CALLBACK_SECRET is configured for this worker class.'
    },
    {
      workerClass: 'retry_worker',
      label: 'Retry worker callbacks',
      secretState: 'fallback',
      status: 'degraded',
      evidence: 'Using shared WORKER_CALLBACK_SECRET fallback for RETRY_WORKER_CALLBACK_SECRET.'
    },
    {
      workerClass: 'esi_sync',
      label: 'ESI sync worker callbacks',
      secretState: 'configured',
      status: 'ready',
      evidence: 'ESI_SYNC_WORKER_CALLBACK_SECRET is configured for this worker class.'
    },
    {
      workerClass: 'people_ingestion',
      label: 'People ingestion worker callbacks',
      secretState: 'configured',
      status: 'ready',
      evidence: 'PEOPLE_INGESTION_WORKER_CALLBACK_SECRET is configured for this worker class.'
    },
    {
      workerClass: 'opportunity_ingestion',
      label: 'Opportunity ingestion worker callbacks',
      secretState: 'missing',
      status: 'blocked',
      evidence: 'No class-specific secret or shared fallback is configured for OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET.'
    }
  ],
  warnings: [
    {
      key: 'missing_opportunity_ingestion_secret',
      severity: 'warning',
      message: 'Opportunity ingestion worker callbacks has no class-specific secret or shared fallback configured.'
    },
    {
      key: 'production_evidence_external',
      severity: 'info',
      message:
        'Live Netlify, EVE SSO provider, MongoDB backup/index/access, and monitoring evidence must be verified with the M46 production operations runbook.'
    }
  ],
  boundary:
    'Operations health is read-only. It does not dispatch workers, execute retries, fetch ESI, write to EVE, mutate wallets, assets, contracts, roles, standings, access, or call external services.'
};
