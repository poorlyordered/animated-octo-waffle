import type {
  CreateLeadershipFollowUpRequest,
  MemberProfile,
  PeopleCoverageState,
  PeopleDataCoverage
} from '../../../packages/contracts/src/index';

export function coverageState(present: boolean, stale: boolean): PeopleCoverageState {
  if (!present) {
    return 'missing';
  }

  return stale ? 'stale' : 'present';
}

export function coverageFromMember(member: Pick<MemberProfile, 'roleContext' | 'activitySummary' | 'delegationNotes' | 'displayName'>): PeopleDataCoverage {
  const missingReasons = [
    ...member.roleContext.missingReasons,
    ...member.activitySummary.missingReasons
  ];

  if (!member.delegationNotes.trim()) {
    missingReasons.push('Delegation notes are missing.');
  }

  return {
    identity: coverageState(Boolean(member.displayName.trim()), false),
    roles: coverageState(member.roleContext.roles.length > 0 || member.roleContext.titles.length > 0, member.roleContext.isStale),
    activity: coverageState(Boolean(member.activitySummary.lastActiveAt), member.activitySummary.isStale),
    delegation: coverageState(Boolean(member.delegationNotes.trim()), false),
    missingReasons: [...new Set(missingReasons)]
  };
}

export function needsFollowUp(member: MemberProfile): boolean {
  return member.followUpSummary.open > 0 || member.followUpSummary.blocked > 0;
}

export function assertFollowUpApprovalBoundary(request: CreateLeadershipFollowUpRequest): void {
  if (request.isPlayerImpacting && !request.approvalText?.trim()) {
    throw new Error('Explicit approval is required for player-impacting follow-ups');
  }
}

export function assertNoDuplicateFollowUp(duplicateExists: boolean): void {
  if (duplicateExists) {
    throw new Error('Leadership follow-up already exists for this member and reason');
  }
}
