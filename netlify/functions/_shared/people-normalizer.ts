import type {
  FollowUpPriority,
  FollowUpStatus,
  LeadershipFollowUp,
  MemberActivitySummary,
  MemberProfile,
  MemberRoleContext,
  PeopleDataCoverage
} from '../../../packages/contracts/src/index';
import {
  followUpPriorities,
  followUpStatuses,
  leadershipFollowUpSchema,
  memberProfileSchema
} from '../../../packages/contracts/src/index';
import { coverageFromMember } from './people-rules';

export type MemberProfileDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
};

export type LeadershipFollowUpDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
};

function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function optionalIsoDate(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = isoDate(value);
  return parsed === new Date(0).toISOString() ? undefined : parsed;
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : undefined;
}

function boolValue(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function sourceRefs(value: unknown): MemberProfile['sourceRefs'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const source = recordValue(item);
    const title = optionalString(source.title);

    if (!title) {
      return [];
    }

    const ref: MemberProfile['sourceRefs'][number] = { title };
    if (optionalString(source.url)) {
      ref.url = optionalString(source.url);
    }
    if (optionalString(source.sourceId)) {
      ref.sourceId = optionalString(source.sourceId);
    }
    return [ref];
  });
}

function normalizeRoleContext(value: unknown): MemberRoleContext {
  const source = recordValue(value);

  return {
    roles: stringArray(source.roles),
    titles: stringArray(source.titles),
    accessNotes: stringValue(source.accessNotes),
    isStale: boolValue(source.isStale),
    lastObservedAt: optionalIsoDate(source.lastObservedAt),
    missingReasons: stringArray(source.missingReasons)
  };
}

function normalizeActivitySummary(value: unknown): MemberActivitySummary {
  const source = recordValue(value);
  const lastActiveAt = optionalIsoDate(source.lastActiveAt ?? source.lastObservedAt);
  const missingReasons = stringArray(source.missingReasons);

  if (!lastActiveAt && missingReasons.length === 0) {
    missingReasons.push('Activity timestamp is missing.');
  }

  return {
    lastActiveAt,
    activityLabel: stringValue(source.activityLabel, lastActiveAt ? 'Recent activity observed.' : 'No activity timestamp recorded.'),
    participationCount: nonNegativeNumber(source.participationCount),
    staleAfterDays: nonNegativeNumber(source.staleAfterDays),
    isStale: boolValue(source.isStale),
    missingReasons
  };
}

function normalizeCoverage(value: unknown, member: MemberProfile): PeopleDataCoverage {
  const source = recordValue(value);
  const fallback = coverageFromMember(member);

  return {
    identity: source.identity === 'missing' || source.identity === 'stale' || source.identity === 'present' ? source.identity : fallback.identity,
    roles: source.roles === 'missing' || source.roles === 'stale' || source.roles === 'present' ? source.roles : fallback.roles,
    activity: source.activity === 'missing' || source.activity === 'stale' || source.activity === 'present' ? source.activity : fallback.activity,
    delegation:
      source.delegation === 'missing' || source.delegation === 'stale' || source.delegation === 'present'
        ? source.delegation
        : fallback.delegation,
    missingReasons: stringArray(source.missingReasons).length > 0 ? stringArray(source.missingReasons) : fallback.missingReasons
  };
}

function normalizeFollowUpStatus(value: unknown): FollowUpStatus {
  return followUpStatuses.includes(value as FollowUpStatus) ? (value as FollowUpStatus) : 'open';
}

function normalizeFollowUpPriority(value: unknown): FollowUpPriority {
  return followUpPriorities.includes(value as FollowUpPriority) ? (value as FollowUpPriority) : 'medium';
}

function normalizeApproval(value: unknown): LeadershipFollowUp['approval'] {
  const source = recordValue(value);
  const approvedAt = optionalIsoDate(source.approvedAt);

  if (!approvedAt) {
    return null;
  }

  const approval: NonNullable<LeadershipFollowUp['approval']> = { approvedAt };
  const approvedBy = optionalString(source.approvedBy);
  const approvalText = optionalString(source.approvalText);
  if (approvedBy) {
    approval.approvedBy = approvedBy;
  }
  if (approvalText) {
    approval.approvalText = approvalText;
  }
  return approval;
}

export function normalizeMemberProfileDocument(document: MemberProfileDocument): MemberProfile {
  const roleContext = normalizeRoleContext(document.roleContext);
  const activitySummary = normalizeActivitySummary(document.activitySummary);
  const member: MemberProfile = {
    id: String(document.id ?? document._id?.toString() ?? 'unknown'),
    corporationId: String(document.corporationId ?? ''),
    characterId: optionalString(document.characterId),
    displayName: stringValue(document.displayName ?? document.name ?? document.characterName, 'Unknown member'),
    aliases: stringArray(document.aliases),
    profileSummary: stringValue(document.profileSummary ?? document.summary),
    roleContext,
    activitySummary,
    delegationNotes: stringValue(document.delegationNotes),
    followUpSummary: {
      open: nonNegativeNumber(recordValue(document.followUpSummary).open) ?? 0,
      blocked: nonNegativeNumber(recordValue(document.followUpSummary).blocked) ?? 0,
      completed: nonNegativeNumber(recordValue(document.followUpSummary).completed) ?? 0
    },
    coverage: {
      identity: 'present',
      roles: 'present',
      activity: 'present',
      delegation: 'present',
      missingReasons: []
    } satisfies PeopleDataCoverage,
    operatingLegCoverage:
      document.operatingLegCoverage && typeof document.operatingLegCoverage === 'object'
        ? (document.operatingLegCoverage as MemberProfile['operatingLegCoverage'])
        : undefined,
    sourceRefs: sourceRefs(document.sourceRefs ?? document.sourceReferences),
    lastObservedAt: optionalIsoDate(document.lastObservedAt),
    createdAt: isoDate(document.createdAt),
    updatedAt: isoDate(document.updatedAt ?? document.createdAt)
  };

  member.coverage = normalizeCoverage(document.coverage, member);
  return memberProfileSchema.parse(member);
}

export function normalizeLeadershipFollowUpDocument(document: LeadershipFollowUpDocument): LeadershipFollowUp {
  const sourceContext = recordValue(document.sourceContext);
  const coverage = normalizeCoverage(sourceContext.coverage, {
    id: stringValue(sourceContext.memberProfileId, stringValue(document.memberProfileId, 'unknown')),
    corporationId: String(document.corporationId ?? ''),
    aliases: [],
    profileSummary: '',
    roleContext: { roles: [], titles: [], accessNotes: '', isStale: false, missingReasons: [] },
    activitySummary: { activityLabel: '', isStale: false, missingReasons: [] },
    delegationNotes: '',
    displayName: stringValue(document.memberDisplayName, 'Unknown member'),
    followUpSummary: { open: 0, blocked: 0, completed: 0 },
    coverage: { identity: 'present', roles: 'missing', activity: 'missing', delegation: 'missing', missingReasons: [] },
    sourceRefs: [],
    createdAt: isoDate(document.createdAt),
    updatedAt: isoDate(document.updatedAt ?? document.createdAt)
  });

  return leadershipFollowUpSchema.parse({
    id: String(document.id ?? document._id?.toString() ?? 'unknown'),
    corporationId: String(document.corporationId ?? ''),
    memberProfileId: stringValue(document.memberProfileId, stringValue(sourceContext.memberProfileId, 'unknown')),
    memberDisplayName: stringValue(document.memberDisplayName, stringValue(sourceContext.memberDisplayName, 'Unknown member')),
    reason: stringValue(document.reason, 'Leadership follow-up'),
    priority: normalizeFollowUpPriority(document.priority),
    status: normalizeFollowUpStatus(document.status),
    owner: optionalString(document.owner),
    dueAt: optionalIsoDate(document.dueAt),
    sourceDecisionId: optionalString(document.sourceDecisionId),
    sourceQueueItemId: optionalString(document.sourceQueueItemId),
    isPlayerImpacting: boolValue(document.isPlayerImpacting),
    approval: normalizeApproval(document.approval),
    sourceContext: {
      memberProfileId: stringValue(sourceContext.memberProfileId, stringValue(document.memberProfileId, 'unknown')),
      memberDisplayName: stringValue(sourceContext.memberDisplayName, stringValue(document.memberDisplayName, 'Unknown member')),
      profileUpdatedAt: optionalIsoDate(sourceContext.profileUpdatedAt),
      decisionId: optionalString(sourceContext.decisionId),
      decisionStatus: optionalString(sourceContext.decisionStatus),
      queueItemId: optionalString(sourceContext.queueItemId),
      queueStatus: optionalString(sourceContext.queueStatus),
      missingLinkReasons: stringArray(sourceContext.missingLinkReasons),
      coverage,
      createdAt: isoDate(sourceContext.createdAt ?? document.createdAt)
    },
    createdAt: isoDate(document.createdAt),
    updatedAt: isoDate(document.updatedAt ?? document.createdAt)
  });
}
