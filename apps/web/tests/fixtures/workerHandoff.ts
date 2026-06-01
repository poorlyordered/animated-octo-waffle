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
  updatedAt: '2026-06-01T15:00:00.000Z'
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
