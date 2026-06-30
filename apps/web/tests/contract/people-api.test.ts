import {
  createLeadershipFollowUpRequestSchema,
  createPeopleFollowUpDecisionRequestSchema,
  createPeopleFollowUpQueueRequestSchema,
  leadershipFollowUpListResponseSchema,
  leadershipFollowUpResponseSchema,
  memberProfileDetailResponseSchema,
  memberProfileListResponseSchema,
  peopleFollowUpDecisionResponseSchema,
  peopleFollowUpQueueResponseSchema,
  updatePeopleFollowUpDecisionStatusRequestSchema
} from '@gryyk/contracts';
import {
  completeMember,
  linkedDecisionFollowUp,
  linkedQueueFollowUp,
  openFollowUp,
  approvedPeopleFollowUpDecisionResponse,
  peopleIngestionProvenance,
  peopleFollowUpDecisionResponse,
  peopleFollowUpQueueResponse,
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
    expect(memberProfileDetailResponseSchema.parse({ member: completeMember, followUps: [openFollowUp] }).followUps[0].status).toBe('open');
  });

  it('accepts follow-up list and create responses', () => {
    expect(leadershipFollowUpListResponseSchema.parse({ followUps: [openFollowUp] }).followUps[0].priority).toBe('high');
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
});
