import {
  decisionListCounts,
  decisionSourceDomain,
  decisionSourceLabel,
  filterDecisionRecords
} from '../../src/features/decision-records/services/decisionListFilters';
import { approvedDecision, proposedDecision, rejectedDecision } from '../fixtures/decisionRecords';
import { numbersFollowUpDecision } from '../fixtures/numbersFollowUpActions';

describe('decision list filters', () => {
  const decisions = [proposedDecision, approvedDecision, rejectedDecision, numbersFollowUpDecision];

  it('labels source domains from existing decision source context', () => {
    expect(decisionSourceDomain(proposedDecision)).toBe('opportunity');
    expect(decisionSourceLabel(proposedDecision)).toBe('Opportunity / brief');
    expect(decisionSourceDomain(numbersFollowUpDecision)).toBe('numbers');
    expect(decisionSourceLabel(numbersFollowUpDecision)).toBe('Numbers follow-up');
  });

  it('filters decisions by status and source', () => {
    expect(filterDecisionRecords(decisions, { status: 'proposed', source: 'all' }).map((decision) => decision.id)).toEqual([
      proposedDecision.id,
      numbersFollowUpDecision.id
    ]);
    expect(filterDecisionRecords(decisions, { status: 'all', source: 'numbers' }).map((decision) => decision.id)).toEqual([
      numbersFollowUpDecision.id
    ]);
    expect(filterDecisionRecords(decisions, { status: 'approved', source: 'opportunity' }).map((decision) => decision.id)).toEqual([
      approvedDecision.id
    ]);
  });

  it('derives workload counts from all and visible decisions', () => {
    const visible = filterDecisionRecords(decisions, { status: 'proposed', source: 'all' });
    const counts = decisionListCounts(decisions, visible);

    expect(counts.total).toBe(4);
    expect(counts.visible).toBe(2);
    expect(counts.proposed).toBe(2);
    expect(counts.approved).toBe(1);
    expect(counts.rejected).toBe(1);
    expect(counts.playerImpacting).toBe(0);
  });
});
