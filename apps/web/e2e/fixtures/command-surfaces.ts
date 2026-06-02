import { completedItem, failedItem, queuedItem } from '../../tests/fixtures/automationQueue';
import { processedBrief, processedRequest } from '../../tests/fixtures/commandBrief';
import { approvedDecision, playerImpactingDecision, proposedDecision } from '../../tests/fixtures/decisionRecords';
import { numbersLiveProvenance, numbersSnapshot } from '../../tests/fixtures/numbers';
import { completeMember, missingLinkFollowUp, openFollowUp, playerImpactingFollowUp, staleMember } from '../../tests/fixtures/people';
import { blockedHandoff, claimedHandoff, completedHandoff, failedHandoff, readyHandoff } from '../../tests/fixtures/workerHandoff';
import {
  numbersFollowUpDecision,
  numbersFollowUpOrigin,
  numbersFollowUpQueueItem
} from '../../tests/fixtures/numbersFollowUpActions';
import {
  activeEsiSyncStatusWithHistory,
  duplicatePrepareEsiSyncResponse,
  missingEsiSyncStatus,
  prepareEsiSyncResponse,
  revokeEsiVaultResponse,
  startEsiSyncConsentResponse
} from '../../tests/fixtures/esiSync';

export const commandSurfaceFixtures = {
  commandBrief: {
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
    decision: {
      decision: numbersFollowUpDecision,
      origin: numbersFollowUpOrigin,
      message:
        'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.'
    },
    queue: {
      queueItem: numbersFollowUpQueueItem,
      origin: numbersFollowUpOrigin,
      message:
        'Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed.'
    }
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
        ...failedHandoff,
        id: 'handoff-browser-failed',
        queueItemId: 'queue-browser-callback-failed'
      }
    ]
  },
  people: {
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
    ]
  },
  esiSync: {
    missing: missingEsiSyncStatus,
    active: activeEsiSyncStatusWithHistory,
    startConsent: startEsiSyncConsentResponse,
    revoke: revokeEsiVaultResponse,
    prepare: prepareEsiSyncResponse,
    duplicatePrepare: duplicatePrepareEsiSyncResponse
  }
};
