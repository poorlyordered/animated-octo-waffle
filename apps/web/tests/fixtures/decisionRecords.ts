import type { DecisionRecord } from '@gryyk/contracts';
import { processedBrief } from './commandBrief';

export const proposedDecision: DecisionRecord = {
  id: 'decision-1',
  corporationId: processedBrief.corporationId,
  sourceBriefId: processedBrief.id,
  sourceRecommendation: processedBrief.recommendedActions[0],
  sourceProvenance: {
    briefId: processedBrief.id,
    briefCreatedAt: processedBrief.createdAt,
    focus: processedBrief.focus,
    model: processedBrief.model,
    promptVersion: processedBrief.promptVersion,
    confidence: processedBrief.confidence,
    sourceCount: processedBrief.sourceCount,
    sourceReferences: processedBrief.sourceReferences,
    coverage: processedBrief.coverage
  },
  status: 'proposed',
  rationale: 'Patch timing may affect staging priorities.',
  expectedResult: 'Leadership has a clear readiness follow-up.',
  isPlayerImpacting: false,
  approval: null,
  statusHistory: [
    {
      toStatus: 'proposed',
      changedAt: '2026-06-01T12:00:00.000Z'
    }
  ],
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z'
};

export const approvedDecision: DecisionRecord = {
  ...proposedDecision,
  id: 'decision-2',
  status: 'approved',
  approval: {
    approvedAt: '2026-06-01T12:05:00.000Z',
    approvalText: 'I approve this player-impacting follow-up.'
  },
  statusHistory: [
    ...proposedDecision.statusHistory,
    {
      fromStatus: 'proposed',
      toStatus: 'approved',
      changedAt: '2026-06-01T12:05:00.000Z'
    }
  ],
  updatedAt: '2026-06-01T12:05:00.000Z'
};

export const delegatedDecision: DecisionRecord = {
  ...approvedDecision,
  id: 'decision-3',
  status: 'delegated',
  statusHistory: [
    ...approvedDecision.statusHistory,
    {
      fromStatus: 'approved',
      toStatus: 'delegated',
      changedAt: '2026-06-01T12:10:00.000Z'
    }
  ],
  updatedAt: '2026-06-01T12:10:00.000Z'
};

export const doneDecision: DecisionRecord = {
  ...delegatedDecision,
  id: 'decision-4',
  status: 'done'
};

export const rejectedDecision: DecisionRecord = {
  ...proposedDecision,
  id: 'decision-5',
  status: 'rejected'
};

export const playerImpactingDecision: DecisionRecord = {
  ...proposedDecision,
  id: 'decision-6',
  isPlayerImpacting: true
};
