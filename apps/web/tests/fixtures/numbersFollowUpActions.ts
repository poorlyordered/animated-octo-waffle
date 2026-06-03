import type {
  AutomationQueueItem,
  DecisionRecord,
  NumbersApprovalHandoff,
  NumbersFollowUpOrigin,
  NumbersFollowUpDecisionResponse,
  NumbersFollowUpQueueResponse
} from '@gryyk/contracts';
import { queuedItem } from './automationQueue';
import { numbersSnapshot } from './numbers';

export const numbersFollowUpOrigin: NumbersFollowUpOrigin = {
  sourceType: 'numbers_follow_up',
  snapshotId: numbersSnapshot.id,
  candidateId: numbersSnapshot.followUps[0].id,
  relatedSection: 'logistics',
  suggestedPath: 'decision'
};

export const numbersFollowUpDecision: DecisionRecord = {
  id: 'decision-numbers-follow-up-1',
  corporationId: numbersSnapshot.corporationId,
  sourceBriefId: numbersSnapshot.id,
  sourceRecommendation: numbersSnapshot.followUps[0].title,
  sourceContext: numbersFollowUpOrigin,
  sourceProvenance: {
    briefId: numbersSnapshot.id,
    briefCreatedAt: numbersSnapshot.createdAt,
    focus: numbersSnapshot.focus,
    model: numbersSnapshot.provenance.model ?? 'unknown',
    promptVersion: numbersSnapshot.provenance.promptVersion ?? 'unknown',
    confidence: numbersSnapshot.provenance.confidence ?? 0,
    sourceCount: numbersSnapshot.provenance.sourceCount,
    sourceReferences: numbersSnapshot.provenance.sourceReferences,
    coverage: numbersSnapshot.coverage ?? {
      numbers: 'present',
      opportunity: 'missing',
      people: 'missing',
      missingReasons: []
    }
  },
  status: 'proposed',
  rationale: numbersSnapshot.followUps[0].rationale,
  expectedResult: 'Commander decision recorded from a Numbers follow-up.',
  isPlayerImpacting: false,
  approval: null,
  statusHistory: [
    {
      toStatus: 'proposed',
      changedAt: '2026-06-02T12:00:00.000Z'
    }
  ],
  createdAt: '2026-06-02T12:00:00.000Z',
  updatedAt: '2026-06-02T12:00:00.000Z'
};

export const approvedNumbersFollowUpDecision: DecisionRecord = {
  ...numbersFollowUpDecision,
  id: 'decision-numbers-follow-up-approved',
  status: 'approved',
  approval: {
    approvedAt: '2026-06-02T12:05:00.000Z',
    approvalText: 'I approve queued preparation from this Numbers follow-up.'
  },
  updatedAt: '2026-06-02T12:05:00.000Z'
};

export const numbersFollowUpQueueItem: AutomationQueueItem = {
  ...queuedItem,
  id: 'queue-numbers-follow-up-1',
  corporationId: numbersSnapshot.corporationId,
  sourceDecisionId: approvedNumbersFollowUpDecision.id,
  taskIntent: numbersSnapshot.followUps[0].title,
  inputSummary: numbersSnapshot.followUps[0].rationale,
  expectedOutput: 'Prepare commander review options from the Numbers follow-up.',
  status: 'queued',
  attempts: 0,
  provenance: {
    ...queuedItem.provenance,
    decisionId: approvedNumbersFollowUpDecision.id,
    sourceBriefId: numbersSnapshot.id,
    sourceRecommendation: numbersSnapshot.followUps[0].title,
    sourceReferences: numbersSnapshot.provenance.sourceReferences,
    sourceCount: numbersSnapshot.provenance.sourceCount,
    confidence: numbersSnapshot.provenance.confidence,
    coverage: numbersSnapshot.coverage,
    createdAt: '2026-06-02T12:05:00.000Z'
  },
  createdAt: '2026-06-02T12:05:00.000Z',
  updatedAt: '2026-06-02T12:05:00.000Z'
};

export const proposedNumbersApprovalHandoff: NumbersApprovalHandoff = {
  candidateId: numbersFollowUpOrigin.candidateId,
  snapshotId: numbersFollowUpOrigin.snapshotId,
  decisionId: numbersFollowUpDecision.id,
  decisionStatus: 'proposed',
  approvalRequired: true,
  queueReady: false,
  message: `Decision ${numbersFollowUpDecision.id} is proposed. Approval is required before queued work can be created.`,
  boundary: 'Approval handoff only. No worker was dispatched and no execution occurred.'
};

export const approvedNumbersApprovalHandoff: NumbersApprovalHandoff = {
  ...proposedNumbersApprovalHandoff,
  decisionId: approvedNumbersFollowUpDecision.id,
  decisionStatus: 'approved',
  approvalRequired: false,
  queueReady: true,
  message: `Decision ${approvedNumbersFollowUpDecision.id} is approved and ready for queued work.`
};

export const queuedNumbersApprovalHandoff: NumbersApprovalHandoff = {
  ...approvedNumbersApprovalHandoff,
  queueItemId: numbersFollowUpQueueItem.id,
  queueStatus: 'queued',
  message: `Queued work is linked to approved Numbers decision ${approvedNumbersFollowUpDecision.id}.`,
  boundary: 'Queued work handoff only. No worker was dispatched and no execution occurred.'
};

export const numbersFollowUpDecisionResponse: NumbersFollowUpDecisionResponse = {
  decision: numbersFollowUpDecision,
  origin: numbersFollowUpOrigin,
  approvalHandoff: proposedNumbersApprovalHandoff,
  message:
    'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.'
};

export const approvedNumbersFollowUpDecisionResponse: NumbersFollowUpDecisionResponse = {
  decision: approvedNumbersFollowUpDecision,
  origin: numbersFollowUpOrigin,
  approvalHandoff: approvedNumbersApprovalHandoff,
  message: 'Existing decision surfaced. No duplicate was created.',
  duplicate: true
};

export const numbersFollowUpQueueResponse: NumbersFollowUpQueueResponse = {
  queueItem: numbersFollowUpQueueItem,
  origin: numbersFollowUpOrigin,
  approvalHandoff: queuedNumbersApprovalHandoff,
  message:
    'Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed.'
};
