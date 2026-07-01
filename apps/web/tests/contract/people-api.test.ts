import {
  createLeadershipFollowUpRequestSchema,
  createPeopleFollowUpDecisionRequestSchema,
  createPeopleFollowUpQueueRequestSchema,
  leadershipFollowUpListResponseSchema,
  leadershipFollowUpResponseSchema,
  memberProfileDetailResponseSchema,
  memberProfileListResponseSchema,
  peopleIngestionWorkerClaimRequestSchema,
  peopleIngestionWorkerCompleteRequestSchema,
  peopleIngestionWorkerFailRequestSchema,
  peopleIngestionWorkerListResponseSchema,
  peopleIngestionWorkerResponseSchema,
  peopleFollowUpDecisionResponseSchema,
  peopleFollowUpQueueResponseSchema,
  preparePeopleIngestionRequestSchema,
  preparePeopleIngestionResponseSchema,
  updatePeopleFollowUpDecisionStatusRequestSchema
} from '@gryyk/contracts';
import {
  completeMember,
  linkedDecisionFollowUp,
  linkedQueueFollowUp,
  approvedPeopleFollowUpDecisionResponse,
  peopleIngestionProvenance,
  peopleFollowUpDecisionResponse,
  peopleFollowUpQueueResponse,
  preparedPeopleIngestionResponse,
  playerImpactingFollowUp
} from '../fixtures/people';

describe('People API contract', () => {
  it('accepts member list and detail responses', () => {
    const parsed = memberProfileListResponseSchema.parse({
      members: [completeMember],
      ingestionProvenance: peopleIngestionProvenance
    });
    expect(parsed.members[0].displayName).toBe('Ari Voss');
    expect(parsed.ingestionProvenance?.history[0].status).toBe('completed');
    expect(
      memberProfileDetailResponseSchema.parse({
        member: completeMember,
        followUps: [approvedPeopleFollowUpDecisionResponse.followUp],
        handoffByFollowUpId: {
          [approvedPeopleFollowUpDecisionResponse.followUp.id]: approvedPeopleFollowUpDecisionResponse.handoff
        }
      }).handoffByFollowUpId?.[approvedPeopleFollowUpDecisionResponse.followUp.id].queueReady
    ).toBe(true);
  });

  it('accepts follow-up list and create responses', () => {
    const parsedList = leadershipFollowUpListResponseSchema.parse({
      followUps: [approvedPeopleFollowUpDecisionResponse.followUp],
      handoffByFollowUpId: {
        [approvedPeopleFollowUpDecisionResponse.followUp.id]: approvedPeopleFollowUpDecisionResponse.handoff
      }
    });

    expect(parsedList.followUps[0].priority).toBe('high');
    expect(parsedList.handoffByFollowUpId?.[approvedPeopleFollowUpDecisionResponse.followUp.id].queueReady).toBe(true);
    expect(leadershipFollowUpResponseSchema.parse({ followUp: playerImpactingFollowUp }).followUp.approval?.approvalText).toContain(
      'approve'
    );
  });

  it('accepts create follow-up requests and rejects missing fields', () => {
    expect(
      createLeadershipFollowUpRequestSchema.parse({
        memberProfileId: 'member-1',
        reason: 'Confirm delegation.',
        priority: 'medium',
        isPlayerImpacting: false
      }).priority
    ).toBe('medium');

    expect(() =>
      createLeadershipFollowUpRequestSchema.parse({
        memberProfileId: 'member-1',
        priority: 'medium'
      })
    ).toThrow();
  });

  it('accepts linked decision and linked queue follow-up payloads', () => {
    expect(leadershipFollowUpResponseSchema.parse({ followUp: linkedDecisionFollowUp }).followUp.sourceContext.decisionId).toBeTruthy();
    expect(leadershipFollowUpResponseSchema.parse({ followUp: linkedQueueFollowUp }).followUp.sourceContext.queueStatus).toBe('queued');
  });

  it('accepts People follow-up decision and queue handoff payloads', () => {
    expect(peopleFollowUpDecisionResponseSchema.parse(peopleFollowUpDecisionResponse).handoff.approvalRequired).toBe(true);
    expect(peopleFollowUpDecisionResponseSchema.parse(approvedPeopleFollowUpDecisionResponse).handoff.queueReady).toBe(true);
    expect(peopleFollowUpQueueResponseSchema.parse(peopleFollowUpQueueResponse).handoff.queueStatus).toBe('queued');
  });

  it('accepts People follow-up action requests and rejects invalid status', () => {
    expect(createPeopleFollowUpDecisionRequestSchema.parse({ rationale: 'Review leadership follow-up.' }).rationale).toContain('Review');
    expect(updatePeopleFollowUpDecisionStatusRequestSchema.parse({ status: 'approved', approvalText: 'Approved.' }).status).toBe('approved');
    expect(
      createPeopleFollowUpQueueRequestSchema.parse({
        title: 'Prepare People plan',
        inputSummary: 'Use approved decision.',
        expectedOutput: 'Draft options.'
      }).title
    ).toBe('Prepare People plan');
    expect(() => updatePeopleFollowUpDecisionStatusRequestSchema.parse({ status: 'delegated' })).toThrow();
  });

  it('accepts People ingestion prepare and worker payloads', () => {
    expect(preparePeopleIngestionRequestSchema.parse({ reason: 'Refresh People context.' }).reason).toContain('Refresh');
    expect(preparePeopleIngestionResponseSchema.parse(preparedPeopleIngestionResponse).request.status).toBe('queued');
    expect(peopleIngestionWorkerClaimRequestSchema.parse({ workerId: 'people-worker-1' }).workerId).toBe('people-worker-1');
    expect(
      peopleIngestionWorkerCompleteRequestSchema.parse({
        workerId: 'people-worker-1',
        sourceCount: 4,
        sectionStatuses: preparedPeopleIngestionResponse.request.sectionStatuses
      }).sourceCount
    ).toBe(4);
    expect(peopleIngestionWorkerFailRequestSchema.parse({ workerId: 'people-worker-1', reason: 'ESI unavailable.' }).reason).toContain(
      'ESI'
    );
    const workerResponse = {
      request: {
        ...preparedPeopleIngestionResponse.request,
        corporationId: '917701062',
        requestedBy: 'Commander'
      }
    };
    expect(peopleIngestionWorkerResponseSchema.parse(workerResponse).request.corporationId).toBe('917701062');
    expect(peopleIngestionWorkerListResponseSchema.parse({ requests: [workerResponse.request] }).requests[0].status).toBe('queued');
  });
});
