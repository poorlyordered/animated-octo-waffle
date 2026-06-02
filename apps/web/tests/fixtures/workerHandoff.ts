import type { WorkerHandoff } from '@gryyk/contracts';
import { queuedItem } from './automationQueue';

export const readyHandoff: WorkerHandoff = {
  id: 'handoff-1',
  corporationId: queuedItem.corporationId,
  queueItemId: queuedItem.id,
  sourceDecisionId: queuedItem.sourceDecisionId,
  status: 'ready',
  payloadSummary: {
    taskIntent: queuedItem.taskIntent,
    inputSummary: queuedItem.inputSummary,
    expectedOutput: queuedItem.expectedOutput,
    sourceDecisionId: queuedItem.sourceDecisionId,
    sourceBriefId: queuedItem.provenance.sourceBriefId,
    sourceReferences: queuedItem.provenance.sourceReferences,
    coverage: queuedItem.provenance.coverage
  },
  createdBy: 'commander',
  createdAt: '2026-06-01T15:00:00.000Z',
  updatedAt: '2026-06-01T15:00:00.000Z',
  progress: []
};

export const blockedHandoff: WorkerHandoff = {
  ...readyHandoff,
  id: 'handoff-2',
  queueItemId: 'queue-2',
  status: 'blocked',
  failure: {
    message: 'Worker prerequisites are missing.',
    code: 'worker_prerequisite_missing',
    failedAt: '2026-06-01T15:10:00.000Z'
  },
  updatedAt: '2026-06-01T15:10:00.000Z'
};

export const claimedHandoff: WorkerHandoff = {
  ...readyHandoff,
  id: 'handoff-claimed',
  status: 'claimed',
  claimedBy: 'overnightdesk-worker-1',
  claimedAt: '2026-06-01T15:05:00.000Z',
  updatedAt: '2026-06-01T15:05:00.000Z',
  progress: [
    {
      workerId: 'overnightdesk-worker-1',
      message: 'Fetched source documents.',
      code: 'sources_fetched',
      createdAt: '2026-06-01T15:06:00.000Z'
    }
  ]
};

export const completedHandoff: WorkerHandoff = {
  ...claimedHandoff,
  id: 'handoff-completed',
  status: 'completed',
  completedAt: '2026-06-01T15:20:00.000Z',
  updatedAt: '2026-06-01T15:20:00.000Z',
  result: {
    workerId: 'overnightdesk-worker-1',
    summary: 'Prepared safe output summary.',
    artifactRefs: ['brief:abc123'],
    completedAt: '2026-06-01T15:20:00.000Z'
  }
};

export const failedHandoff: WorkerHandoff = {
  ...claimedHandoff,
  id: 'handoff-failed',
  status: 'failed',
  updatedAt: '2026-06-01T15:25:00.000Z',
  failure: {
    workerId: 'overnightdesk-worker-1',
    message: 'Source data unavailable.',
    code: 'source_unavailable',
    failedAt: '2026-06-01T15:25:00.000Z'
  }
};
