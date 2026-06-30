import type { ApprovalSnapshot } from './automation-queue.js';
import type { OperatingLegCoverage, SourceReference } from './command-brief.js';
import type { AutomationQueueItem } from './automation-queue.js';
import type { DecisionRecord } from './decision-record.js';

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

export const peopleIngestionStatuses = ['queued', 'claimed', 'completed', 'failed', 'cancelled'] as const;
export type PeopleIngestionStatus = (typeof peopleIngestionStatuses)[number];

export const peopleIngestionModes = ['latest_ingestion', 'historical_profiles', 'unavailable'] as const;
export type PeopleIngestionMode = (typeof peopleIngestionModes)[number];

export type PeopleIngestionSectionKey = 'identity' | 'roles' | 'activity' | 'delegation';

export interface PeopleIngestionSectionStatus {
  key: PeopleIngestionSectionKey;
  status: PeopleCoverageState;
}

export interface PeopleIngestionFailure {
  reason: string;
  failedAt: string;
}

export interface PeopleIngestionHistoryItem {
  id: string;
  status: PeopleIngestionStatus;
  requestedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  sourceCount?: number;
  failure?: PeopleIngestionFailure;
  sectionStatuses: PeopleIngestionSectionStatus[];
  boundary: string;
}

export interface PeopleIngestionProvenance {
  mode: PeopleIngestionMode;
  sourceCount: number;
  profileCount: number;
  sectionStatuses: PeopleIngestionSectionStatus[];
  history: PeopleIngestionHistoryItem[];
  message: string;
  boundary: string;
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

export interface PeopleFollowUpHandoff {
  followUpId: string;
  memberProfileId: string;
  memberDisplayName: string;
  decisionId?: string;
  decisionStatus?: string;
  approvalRequired: boolean;
  queueReady: boolean;
  queueItemId?: string;
  queueStatus?: string;
  duplicate?: boolean;
  message: string;
  boundary: string;
  missingLinkReasons: string[];
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

export interface CreatePeopleFollowUpDecisionRequest {
  rationale?: string;
  expectedResult?: string;
}

export interface UpdatePeopleFollowUpDecisionStatusRequest {
  status: 'approved' | 'rejected';
  approvalText?: string;
  rejectionReason?: string;
}

export interface CreatePeopleFollowUpQueueRequest {
  title: string;
  inputSummary: string;
  expectedOutput: string;
  owner?: string;
}

export interface MemberProfileListResponse {
  members: MemberProfile[];
  ingestionProvenance?: PeopleIngestionProvenance;
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

export interface PeopleFollowUpDecisionResponse {
  followUp: LeadershipFollowUp;
  decision: DecisionRecord;
  handoff: PeopleFollowUpHandoff;
  duplicate?: boolean;
  message: string;
}

export interface PeopleFollowUpQueueResponse {
  followUp: LeadershipFollowUp;
  queueItem: AutomationQueueItem;
  handoff: PeopleFollowUpHandoff;
  duplicate?: boolean;
  message: string;
}
