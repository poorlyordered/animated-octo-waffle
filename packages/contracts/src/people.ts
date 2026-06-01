import type { ApprovalSnapshot } from './automation-queue.js';
import type { OperatingLegCoverage, SourceReference } from './command-brief.js';

export const peopleCoverageStates = ['present', 'missing', 'stale'] as const;
export type PeopleCoverageState = (typeof peopleCoverageStates)[number];

export const followUpPriorities = ['low', 'medium', 'high', 'urgent'] as const;
export type FollowUpPriority = (typeof followUpPriorities)[number];

export const followUpStatuses = ['open', 'blocked', 'completed', 'canceled'] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];

export interface MemberRoleContext {
  roles: string[];
  titles: string[];
  accessNotes: string;
  isStale: boolean;
  lastObservedAt?: string;
  missingReasons: string[];
}

export interface MemberActivitySummary {
  lastActiveAt?: string;
  activityLabel: string;
  participationCount?: number;
  staleAfterDays?: number;
  isStale: boolean;
  missingReasons: string[];
}

export interface PeopleDataCoverage {
  identity: PeopleCoverageState;
  roles: PeopleCoverageState;
  activity: PeopleCoverageState;
  delegation: PeopleCoverageState;
  missingReasons: string[];
}

export interface FollowUpSummary {
  open: number;
  blocked: number;
  completed: number;
}

export interface MemberProfile {
  id: string;
  corporationId: string;
  characterId?: string;
  displayName: string;
  aliases: string[];
  profileSummary: string;
  roleContext: MemberRoleContext;
  activitySummary: MemberActivitySummary;
  delegationNotes: string;
  followUpSummary: FollowUpSummary;
  coverage: PeopleDataCoverage;
  operatingLegCoverage?: OperatingLegCoverage;
  sourceRefs: SourceReference[];
  lastObservedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpSourceContext {
  memberProfileId: string;
  memberDisplayName: string;
  profileUpdatedAt?: string;
  decisionId?: string;
  decisionStatus?: string;
  queueItemId?: string;
  queueStatus?: string;
  missingLinkReasons: string[];
  coverage: PeopleDataCoverage;
  createdAt: string;
}

export interface LeadershipFollowUp {
  id: string;
  corporationId: string;
  memberProfileId: string;
  memberDisplayName: string;
  reason: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  owner?: string;
  dueAt?: string;
  sourceDecisionId?: string;
  sourceQueueItemId?: string;
  isPlayerImpacting: boolean;
  approval: ApprovalSnapshot | null;
  sourceContext: FollowUpSourceContext;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadershipFollowUpRequest {
  memberProfileId: string;
  reason: string;
  priority: FollowUpPriority;
  owner?: string;
  dueAt?: string;
  sourceDecisionId?: string;
  sourceQueueItemId?: string;
  isPlayerImpacting: boolean;
  approvalText?: string;
}

export interface MemberProfileListResponse {
  members: MemberProfile[];
}

export interface MemberProfileDetailResponse {
  member: MemberProfile;
  followUps: LeadershipFollowUp[];
}

export interface LeadershipFollowUpListResponse {
  followUps: LeadershipFollowUp[];
}

export interface LeadershipFollowUpResponse {
  followUp: LeadershipFollowUp;
}
