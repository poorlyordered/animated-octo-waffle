import { completedItem, failedItem, queuedItem } from '../../tests/fixtures/automationQueue';
import {
  opportunityIngestionProvenance,
  preparedOpportunityIngestionResponse,
  processedBrief,
  processedRequest
} from '../../tests/fixtures/commandBrief';
import { approvedDecision, playerImpactingDecision, proposedDecision, rejectedDecision } from '../../tests/fixtures/decisionRecords';
import { numbersLiveProvenance, numbersSnapshot } from '../../tests/fixtures/numbers';
import {
  completeMember,
  missingLinkFollowUp,
  openFollowUp,
  approvedPeopleFollowUpDecision,
  peopleIngestionProvenance,
  preparedPeopleIngestionResponse,
  peopleFollowUpDecision,
  peopleFollowUpQueueItem,
  playerImpactingFollowUp,
  rejectedPeopleFollowUpDecision,
  staleMember
} from '../../tests/fixtures/people';
import {
  blockedHandoff,
  claimedHandoff,
  completedHandoff,
  failedHandoff,
  failedHandoffWithCompletedRetry,
  readyHandoff
} from '../../tests/fixtures/workerHandoff';
import {
  approvedNumbersFollowUpDecisionResponse,
  approvedNumbersFollowUpDecisionStatusResponse,
  numbersFollowUpDecision,
  numbersFollowUpDecisionResponse,
  numbersFollowUpQueueResponse,
  rejectedNumbersFollowUpDecisionStatusResponse
} from '../../tests/fixtures/numbersFollowUpActions';
import {
  esiSyncRetryCancelResponse,
  esiSyncRetryResponse,
  esiSyncRetryRescheduleResponse,
  handoffRetryCancelResponse,
  handoffRetryResponse,
  handoffRetryRescheduleResponse
} from '../../tests/fixtures/retry';
import {
  activeEsiSyncStatusWithHistory,
  duplicatePrepareEsiSyncResponse,
  missingEsiSyncStatus,
  prepareEsiSyncResponse,
  revokeEsiVaultResponse,
  startEsiSyncConsentResponse
} from '../../tests/fixtures/esiSync';
import { operationsHealthResponse } from '../../tests/fixtures/operationsHealth';

export const commandSurfaceFixtures = {
  commandBrief: {
    opportunityProvenance: {
      ...opportunityIngestionProvenance,
      message: 'Latest Opportunity context is linked to processed browser research history.'
    },
    preparedOpportunityIngestion: preparedOpportunityIngestionResponse,
    brief: {
      ...processedBrief,
      executiveSummary: 'Browser smoke brief confirms the command surface renders with deterministic opportunity context.',
      memory: ['Browser smoke memory item'],
      recommendedActions: ['Browser smoke recommendation for command validation.'],
      strategicImpacts: ['Browser smoke impact validates opportunity context.'],
      watchlist: ['Browser smoke watchlist item']
    }
  },
  researchStatus: {
    request: processedRequest
  },
  numbers: {
    snapshot: numbersSnapshot,
    liveProvenance: numbersLiveProvenance
  },
  numbersFollowUpActions: {
    decision: numbersFollowUpDecisionResponse,
    approvedDecision: approvedNumbersFollowUpDecisionResponse,
    approvedStatus: approvedNumbersFollowUpDecisionStatusResponse,
    rejectedStatus: rejectedNumbersFollowUpDecisionStatusResponse,
    queue: numbersFollowUpQueueResponse
  },
  decisionRecords: {
    decisions: [
      {
        ...proposedDecision,
        expectedResult: 'Decision detail remains inspectable.',
        id: 'decision-browser-proposed',
        rationale: 'Browser smoke validates decision detail rendering.',
        sourceRecommendation: 'Browser smoke decision record recommendation.'
      },
      {
        ...approvedDecision,
        id: 'decision-browser-approved',
        sourceRecommendation: 'Browser smoke approved decision for queue links.'
      },
      {
        ...playerImpactingDecision,
        expectedResult: 'Approval boundary remains visible.',
        id: 'decision-browser-player-impacting',
        rationale: 'Requires explicit approval before action-like progression.',
        sourceRecommendation: 'Browser smoke player-impacting decision.'
      },
      {
        ...rejectedDecision,
        id: 'decision-browser-rejected',
        sourceRecommendation: 'Browser smoke rejected decision.'
      },
      {
        ...numbersFollowUpDecision,
        id: 'decision-browser-numbers',
        sourceRecommendation: 'Browser smoke Numbers follow-up decision.'
      },
      {
        ...proposedDecision,
        id: 'decision-browser-proposed-2',
        sourceRecommendation: 'Browser smoke second Opportunity decision.'
      },
      {
        ...approvedDecision,
        id: 'decision-browser-approved-2',
        sourceRecommendation: 'Browser smoke second approved decision.'
      },
      {
        ...proposedDecision,
        id: 'decision-browser-proposed-3',
        sourceRecommendation: 'Browser smoke third Opportunity decision.'
      }
    ]
  },
  automationQueue: {
    queueItems: [
      {
        ...queuedItem,
        expectedOutput: 'A browser-visible queued work record.',
        id: 'queue-browser-queued',
        inputSummary: 'Use deterministic browser smoke decision context.',
        sourceDecisionId: 'decision-browser-approved',
        taskIntent: 'Browser smoke queued work item.'
      },
      {
        ...failedItem,
        id: 'queue-browser-failed',
        taskIntent: 'Browser smoke failed work item.'
      },
      {
        ...completedItem,
        id: 'queue-browser-completed',
        taskIntent: 'Browser smoke completed work item.'
      },
      {
        ...queuedItem,
        id: 'queue-browser-claimed',
        taskIntent: 'Browser smoke claimed callback work item.'
      },
      {
        ...completedItem,
        id: 'queue-browser-callback-completed',
        taskIntent: 'Browser smoke callback completed work item.'
      },
      {
        ...failedItem,
        id: 'queue-browser-callback-failed',
        taskIntent: 'Browser smoke callback failed work item.'
      }
    ],
    handoffs: [
      {
        ...readyHandoff,
        id: 'handoff-browser-ready',
        queueItemId: 'queue-browser-queued'
      },
      {
        ...blockedHandoff,
        id: 'handoff-browser-blocked',
        queueItemId: 'queue-browser-failed'
      },
      {
        ...claimedHandoff,
        id: 'handoff-browser-claimed',
        queueItemId: 'queue-browser-claimed'
      },
      {
        ...completedHandoff,
        id: 'handoff-browser-completed',
        queueItemId: 'queue-browser-callback-completed'
      },
      {
        ...failedHandoffWithCompletedRetry,
        id: 'handoff-browser-failed',
        queueItemId: 'queue-browser-callback-failed'
      },
      {
        ...failedHandoffWithCompletedRetry,
        id: 'handoff-browser-opportunity-failed',
        queueItemId: 'queue-browser-opportunity',
        retry: undefined,
        retryHistory: []
      },
      {
        ...failedHandoff,
        id: 'handoff-browser-people-failed',
        queueItemId: 'queue-people-follow-up',
        retry: undefined,
        retryHistory: []
      }
    ]
  },
  people: {
    ingestionProvenance: {
      ...peopleIngestionProvenance,
      message: 'Latest People profiles are linked to completed browser ingestion history.'
    },
    preparedIngestion: preparedPeopleIngestionResponse,
    followUps: [
      {
        ...openFollowUp,
        id: 'follow-up-browser-open',
        memberDisplayName: 'Browser Smoke Pilot',
        memberProfileId: 'member-browser-complete',
        reason: 'Browser smoke leadership follow-up.'
      },
      {
        ...missingLinkFollowUp,
        id: 'follow-up-browser-missing-link',
        memberDisplayName: 'Browser Smoke Pilot',
        memberProfileId: 'member-browser-complete'
      },
      {
        ...playerImpactingFollowUp,
        id: 'follow-up-browser-player-impacting',
        memberDisplayName: 'Browser Smoke Pilot',
        memberProfileId: 'member-browser-complete',
        reason: 'Browser smoke player-impacting follow-up.'
      }
    ],
    members: [
      {
        ...completeMember,
        displayName: 'Browser Smoke Pilot',
        id: 'member-browser-complete',
        profileSummary: 'Browser smoke member profile renders leadership context.'
      },
      {
        ...staleMember,
        displayName: 'Browser Smoke Stale Pilot',
        id: 'member-browser-stale'
      }
    ],
    decision: peopleFollowUpDecision,
    approvedDecision: approvedPeopleFollowUpDecision,
    rejectedDecision: rejectedPeopleFollowUpDecision,
    queueItem: peopleFollowUpQueueItem
  },
  esiSync: {
    missing: missingEsiSyncStatus,
    active: activeEsiSyncStatusWithHistory,
    startConsent: startEsiSyncConsentResponse,
    revoke: revokeEsiVaultResponse,
    prepare: prepareEsiSyncResponse,
    duplicatePrepare: duplicatePrepareEsiSyncResponse
  },
  retries: {
    handoff: handoffRetryResponse,
    handoffCancel: handoffRetryCancelResponse,
    handoffReschedule: handoffRetryRescheduleResponse,
    esiSync: esiSyncRetryResponse,
    esiSyncCancel: esiSyncRetryCancelResponse,
    esiSyncReschedule: esiSyncRetryRescheduleResponse
  },
  operationsHealth: operationsHealthResponse
};
