import type { AutomationQueueItem } from '@gryyk/contracts';
import { approvedDecision, playerImpactingDecision } from './decisionRecords';

export const queuedItem: AutomationQueueItem = {
  id: 'queue-1',
  corporationId: approvedDecision.corporationId,
  sourceDecisionId: approvedDecision.id,
  taskIntent: 'Prepare a scouting summary for the approved opportunity window.',
  inputSummary: 'Use the approved decision, source brief, and recent opportunity notes.',
  expectedOutput: 'A commander-readable scouting plan with risk and timing notes.',
  status: 'queued',
  requestedBy: 'commander',
  owner: 'research-worker',
  isPlayerImpacting: false,
  approval: null,
  provenance: {
    decisionId: approvedDecision.id,
    decisionStatus: 'approved',
    decisionApprovedAt: approvedDecision.approval?.approvedAt,
    sourceBriefId: approvedDecision.sourceBriefId,
    sourceRecommendation: approvedDecision.sourceRecommendation,
    confidence: approvedDecision.sourceProvenance.confidence,
    sourceCount: approvedDecision.sourceProvenance.sourceCount,
    sourceReferences: approvedDecision.sourceProvenance.sourceReferences,
    coverage: approvedDecision.sourceProvenance.coverage,
    createdAt: '2026-06-01T12:10:00.000Z'
  },
  attempts: 0,
  createdAt: '2026-06-01T12:10:00.000Z',
  updatedAt: '2026-06-01T12:10:00.000Z'
};

export const failedItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-2',
  taskIntent: 'Retry failed scouting summary preparation.',
  status: 'failed',
  attempts: 1,
  lastAttemptedAt: '2026-06-01T13:00:00.000Z',
  failure: {
    message: 'External worker was unavailable.',
    code: 'worker_unavailable',
    failedAt: '2026-06-01T13:00:10.000Z'
  },
  retry: {
    eligible: true,
    notBefore: '2026-06-01T13:15:00.000Z'
  },
  updatedAt: '2026-06-01T13:00:10.000Z'
};

export const completedItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-3',
  status: 'completed',
  attempts: 1,
  output: {
    summary: 'Scouting plan completed.',
    completedAt: '2026-06-01T14:00:00.000Z'
  },
  updatedAt: '2026-06-01T14:00:00.000Z'
};

export const blockedItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-4',
  status: 'blocked'
};

export const runningItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-5',
  status: 'running'
};

export const canceledItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-6',
  status: 'canceled'
};

export const approvedPlayerImpactingDecision = {
  ...playerImpactingDecision,
  status: 'approved' as const,
  approval: {
    approvedAt: '2026-06-01T12:15:00.000Z',
    approvalText: 'I explicitly approve this player-impacting queue work.'
  },
  updatedAt: '2026-06-01T12:15:00.000Z'
};

export const playerImpactingQueuedItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-7',
  sourceDecisionId: approvedPlayerImpactingDecision.id,
  isPlayerImpacting: true,
  approval: {
    approvedAt: '2026-06-01T12:15:00.000Z',
    approvalText: 'I explicitly approve this player-impacting queue work.'
  },
  provenance: {
    ...queuedItem.provenance,
    decisionId: approvedPlayerImpactingDecision.id,
    decisionApprovedAt: '2026-06-01T12:15:00.000Z'
  }
};
