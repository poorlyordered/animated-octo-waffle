import {
  createLeadershipFollowUpRequestSchema,
  leadershipFollowUpListResponseSchema,
  leadershipFollowUpResponseSchema,
  memberProfileDetailResponseSchema,
  memberProfileListResponseSchema
} from '@gryyk/contracts';
import {
  completeMember,
  linkedDecisionFollowUp,
  linkedQueueFollowUp,
  openFollowUp,
  peopleIngestionProvenance,
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
});
