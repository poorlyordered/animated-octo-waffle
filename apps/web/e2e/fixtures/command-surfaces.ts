import { completedItem, failedItem, queuedItem } from '../../tests/fixtures/automationQueue';
import { processedBrief, processedRequest } from '../../tests/fixtures/commandBrief';
import { approvedDecision, playerImpactingDecision, proposedDecision } from '../../tests/fixtures/decisionRecords';
import { completeMember, missingLinkFollowUp, openFollowUp, playerImpactingFollowUp, staleMember } from '../../tests/fixtures/people';

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
  }
};
