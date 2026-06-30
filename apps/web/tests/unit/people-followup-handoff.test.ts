import { peopleFollowUpHandoff, assertNoUnsafePeopleFollowUpFields, assertNoUnsafePeopleFollowUpStatusFields } from '../../../../netlify/functions/_shared/people-rules';
import {
  approvedPeopleFollowUp,
  approvedPeopleFollowUpDecision,
  openFollowUp,
  peopleFollowUpDecision,
  peopleFollowUpQueueItem
} from '../fixtures/people';

describe('People follow-up handoff rules', () => {
  it('marks proposed People decisions as approval required and queue blocked', () => {
    const handoff = peopleFollowUpHandoff(openFollowUp, { decision: peopleFollowUpDecision });

    expect(handoff.approvalRequired).toBe(true);
    expect(handoff.queueReady).toBe(false);
    expect(handoff.message).toContain('Approval is required');
  });

  it('marks approved People decisions as queue ready', () => {
    const handoff = peopleFollowUpHandoff(approvedPeopleFollowUp, { decision: approvedPeopleFollowUpDecision });

    expect(handoff.approvalRequired).toBe(false);
    expect(handoff.queueReady).toBe(true);
    expect(handoff.boundary).toContain('No queued work');
  });

  it('links queued work without implying execution', () => {
    const handoff = peopleFollowUpHandoff(approvedPeopleFollowUp, {
      decision: approvedPeopleFollowUpDecision,
      queueItem: peopleFollowUpQueueItem
    });

    expect(handoff.queueItemId).toBe(peopleFollowUpQueueItem.id);
    expect(handoff.queueStatus).toBe('queued');
    expect(handoff.boundary).toContain('No worker was dispatched');
  });

  it('rejects browser-controlled execution and handoff fields', () => {
    expect(() => assertNoUnsafePeopleFollowUpFields({ dispatch: true })).toThrow('Unsafe People follow-up action field rejected');
    expect(() => assertNoUnsafePeopleFollowUpStatusFields({ queueStatus: 'queued' })).toThrow(
      'Unsafe People follow-up status field rejected'
    );
    expect(() => assertNoUnsafePeopleFollowUpStatusFields({ approvalText: 'Approved.' })).not.toThrow();
  });
});
