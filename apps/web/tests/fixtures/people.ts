import type { LeadershipFollowUp, MemberProfile, PeopleIngestionProvenance } from '@gryyk/contracts';
import { approvedDecision } from './decisionRecords';
import { queuedItem } from './automationQueue';

export const completeMember: MemberProfile = {
  id: 'member-1',
  corporationId: '917701062',
  characterId: '2110000001',
  displayName: 'Ari Voss',
  aliases: ['Ari'],
  profileSummary: 'Reliable logistics lead with current delegation coverage.',
  roleContext: {
    roles: ['Logistics', 'Industry'],
    titles: ['Quartermaster'],
    accessNotes: 'Has logistics coordination context.',
    isStale: false,
    lastObservedAt: '2026-06-01T11:00:00.000Z',
    missingReasons: []
  },
  activitySummary: {
    lastActiveAt: '2026-06-01T10:00:00.000Z',
    activityLabel: 'Active this week',
    participationCount: 7,
    staleAfterDays: 14,
    isStale: false,
    missingReasons: []
  },
  delegationNotes: 'Owns buyback preparation and hauling coordination.',
  followUpSummary: {
    open: 1,
    blocked: 0,
    completed: 2
  },
  coverage: {
    identity: 'present',
    roles: 'present',
    activity: 'present',
    delegation: 'present',
    missingReasons: []
  },
  sourceRefs: [{ title: 'Member profile import', sourceId: 'profile-1' }],
  lastObservedAt: '2026-06-01T11:00:00.000Z',
  createdAt: '2026-06-01T09:00:00.000Z',
  updatedAt: '2026-06-01T11:00:00.000Z'
};

export const staleMember: MemberProfile = {
  ...completeMember,
  id: 'member-2',
  displayName: 'Mira Tal',
  activitySummary: {
    lastActiveAt: '2026-04-01T10:00:00.000Z',
    activityLabel: 'Activity stale',
    participationCount: 1,
    staleAfterDays: 14,
    isStale: true,
    missingReasons: []
  },
  coverage: {
    ...completeMember.coverage,
    activity: 'stale'
  }
};

export const missingDataMember: MemberProfile = {
  ...completeMember,
  id: 'member-3',
  displayName: 'Unknown Scout',
  roleContext: {
    roles: [],
    titles: [],
    accessNotes: '',
    isStale: false,
    missingReasons: ['Role context is missing.']
  },
  activitySummary: {
    activityLabel: 'No activity timestamp recorded.',
    isStale: false,
    missingReasons: ['Activity timestamp is missing.']
  },
  delegationNotes: '',
  followUpSummary: {
    open: 0,
    blocked: 0,
    completed: 0
  },
  coverage: {
    identity: 'present',
    roles: 'missing',
    activity: 'missing',
    delegation: 'missing',
    missingReasons: ['Role context is missing.', 'Activity timestamp is missing.', 'Delegation notes are missing.']
  }
};

export const peopleIngestionProvenance: PeopleIngestionProvenance = {
  mode: 'latest_ingestion',
  sourceCount: 3,
  profileCount: 3,
  sectionStatuses: [
    { key: 'identity', status: 'present' },
    { key: 'roles', status: 'missing' },
    { key: 'activity', status: 'stale' },
    { key: 'delegation', status: 'missing' }
  ],
  history: [
    {
      id: 'people-sync-1',
      status: 'completed',
      requestedAt: '2026-06-02T09:00:00.000Z',
      claimedBy: 'people-worker',
      claimedAt: '2026-06-02T09:05:00.000Z',
      completedAt: '2026-06-02T09:20:00.000Z',
      sourceCount: 3,
      sectionStatuses: [
        { key: 'identity', status: 'present' },
        { key: 'roles', status: 'missing' },
        { key: 'activity', status: 'stale' },
        { key: 'delegation', status: 'missing' }
      ],
      boundary:
        'People ingestion history is read-only. This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.'
    }
  ],
  message: 'Latest People profiles are linked to completed ingestion history.',
  boundary:
    'People ingestion history is read-only. This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.'
};

export const openFollowUp: LeadershipFollowUp = {
  id: 'follow-up-1',
  corporationId: completeMember.corporationId,
  memberProfileId: completeMember.id,
  memberDisplayName: completeMember.displayName,
  reason: 'Confirm logistics coverage for weekend operations.',
  priority: 'high',
  status: 'open',
  owner: 'CEO',
  dueAt: '2026-06-03T17:00:00.000Z',
  isPlayerImpacting: false,
  approval: null,
  sourceContext: {
    memberProfileId: completeMember.id,
    memberDisplayName: completeMember.displayName,
    profileUpdatedAt: completeMember.updatedAt,
    coverage: completeMember.coverage,
    missingLinkReasons: [],
    createdAt: '2026-06-01T12:00:00.000Z'
  },
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z'
};

export const blockedFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-2',
  reason: 'Resolve missing role context.',
  priority: 'medium',
  status: 'blocked',
  memberProfileId: missingDataMember.id,
  memberDisplayName: missingDataMember.displayName
};

export const completedFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-3',
  reason: 'Completed onboarding check-in.',
  priority: 'low',
  status: 'completed'
};

export const linkedDecisionFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-4',
  sourceDecisionId: approvedDecision.id,
  sourceContext: {
    ...openFollowUp.sourceContext,
    decisionId: approvedDecision.id,
    decisionStatus: approvedDecision.status
  }
};

export const linkedQueueFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-5',
  sourceQueueItemId: queuedItem.id,
  sourceContext: {
    ...openFollowUp.sourceContext,
    queueItemId: queuedItem.id,
    queueStatus: queuedItem.status
  }
};

export const missingLinkFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-6',
  sourceDecisionId: 'missing-decision',
  sourceQueueItemId: 'missing-queue',
  sourceContext: {
    ...openFollowUp.sourceContext,
    decisionId: 'missing-decision',
    queueItemId: 'missing-queue',
    missingLinkReasons: ['Source decision missing-decision was not found.', 'Source queue item missing-queue was not found.']
  }
};

export const playerImpactingFollowUp: LeadershipFollowUp = {
  ...openFollowUp,
  id: 'follow-up-7',
  isPlayerImpacting: true,
  approval: {
    approvedAt: '2026-06-01T12:05:00.000Z',
    approvalText: 'I approve this player-impacting follow-up.'
  }
};
