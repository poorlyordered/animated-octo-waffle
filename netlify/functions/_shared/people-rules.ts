import type {
  AutomationQueueItem,
  CreateLeadershipFollowUpRequest,
  DecisionRecord,
  LeadershipFollowUp,
  MemberProfile,
  PeopleFollowUpHandoff,
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

const unsafePeopleFollowUpFields = new Set([
  'corporationId',
  'approval',
  'approvedAt',
  'decisionStatus',
  'handoff',
  'queueItem',
  'queueItemId',
  'queueReady',
  'queueStatus',
  'sourceContext',
  'sourceProvenance',
  'provenance',
  'sourceReferences',
  'confidence',
  'model',
  'promptVersion',
  'execute',
  'executeNow',
  'execution',
  'dispatch',
  'dispatchTarget',
  'workerId',
  'workerSecret',
  'retry',
  'retryAt',
  'roleAction',
  'accessAction',
  'standingAction',
  'eveWrite',
  'walletAction',
  'assetAction',
  'contractAction',
  'externalService'
]);

const unsafePeopleFollowUpStatusFields = new Set(
  [...unsafePeopleFollowUpFields].filter((field) => field !== 'approvalText')
);

const decisionBoundary =
  'People follow-up handoff only. No queued work, worker dispatch, EVE role/access change, retry, or external execution occurred.';
const queueBoundary =
  'People queued work handoff only. No worker was dispatched, no handoff was prepared, and no EVE role/access or external-service change occurred.';

export function assertNoUnsafePeopleFollowUpFields(value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const unsafeField = Object.keys(record).find((key) => unsafePeopleFollowUpFields.has(key));

  if (unsafeField) {
    throw new Error(`Unsafe People follow-up action field rejected: ${unsafeField}`);
  }
}

export function assertNoUnsafePeopleFollowUpStatusFields(value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const unsafeField = Object.keys(record).find((key) => unsafePeopleFollowUpStatusFields.has(key));

  if (unsafeField) {
    throw new Error(`Unsafe People follow-up status field rejected: ${unsafeField}`);
  }
}

export function assertPeopleDecisionOrigin(followUp: LeadershipFollowUp, decision: DecisionRecord): void {
  if (
    decision.sourceContext?.sourceType !== 'people_follow_up' ||
    decision.sourceContext.followUpId !== followUp.id ||
    decision.sourceContext.memberProfileId !== followUp.memberProfileId
  ) {
    throw new Error('Decision does not match this People follow-up');
  }
}

export function peopleFollowUpHandoff(
  followUp: LeadershipFollowUp,
  options: {
    decision?: DecisionRecord | null;
    queueItem?: AutomationQueueItem | null;
    duplicate?: boolean;
  } = {}
): PeopleFollowUpHandoff {
  const decision = options.decision ?? null;
  const queueItem = options.queueItem ?? null;
  const queueReady = decision?.status === 'approved';
  const approvalRequired = decision?.status === 'proposed';

  const handoff: PeopleFollowUpHandoff = {
    followUpId: followUp.id,
    memberProfileId: followUp.memberProfileId,
    memberDisplayName: followUp.memberDisplayName,
    decisionId: decision?.id ?? followUp.sourceContext.decisionId,
    decisionStatus: decision?.status ?? followUp.sourceContext.decisionStatus,
    approvalRequired,
    queueReady,
    duplicate: options.duplicate || undefined,
    message: queueItem
      ? `${options.duplicate ? 'Existing queued work is linked' : 'Queued work is linked'} to approved People decision ${decision?.id ?? followUp.sourceContext.decisionId}.`
      : queueReady
        ? `Decision ${decision.id} is approved and ready for separate queued work.`
        : decision?.status === 'rejected'
          ? `Decision ${decision.id} is rejected. Queued work cannot be created from this People follow-up.`
          : decision
            ? `Decision ${decision.id} is ${decision.status}. Approval is required before queued work can be created.`
            : 'No decision has been recorded for this People follow-up.',
    boundary: queueItem ? queueBoundary : decisionBoundary,
    missingLinkReasons: followUp.sourceContext.missingLinkReasons
  };

  if (queueItem) {
    handoff.queueItemId = queueItem.id;
    handoff.queueStatus = queueItem.status;
  } else if (followUp.sourceContext.queueItemId) {
    handoff.queueItemId = followUp.sourceContext.queueItemId;
    handoff.queueStatus = followUp.sourceContext.queueStatus;
  }

  return handoff;
}
