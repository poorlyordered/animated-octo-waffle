import {
  decisionListCounts,
  decisionServerFilters,
  decisionSourceDomain,
  decisionSourceLabel,
  filterDecisionRecords,
  paginateDecisionRecords,
  parseDecisionListSettings,
  readDecisionListSettings,
  writeDecisionListSettings
} from '../../src/features/decision-records/services/decisionListFilters';
import { approvedDecision, proposedDecision, rejectedDecision } from '../fixtures/decisionRecords';
import { numbersFollowUpDecision } from '../fixtures/numbersFollowUpActions';
import { peopleFollowUpDecision } from '../fixtures/people';

describe('decision list filters', () => {
  const decisions = [proposedDecision, approvedDecision, rejectedDecision, numbersFollowUpDecision, peopleFollowUpDecision];

  it('labels source domains from existing decision source context', () => {
    expect(decisionSourceDomain(proposedDecision)).toBe('opportunity');
    expect(decisionSourceLabel(proposedDecision)).toBe('Opportunity / brief');
    expect(decisionSourceDomain(numbersFollowUpDecision)).toBe('numbers');
    expect(decisionSourceLabel(numbersFollowUpDecision)).toBe('Numbers follow-up');
    expect(decisionSourceDomain(peopleFollowUpDecision)).toBe('people');
    expect(decisionSourceLabel(peopleFollowUpDecision)).toBe('People follow-up');
  });

  it('filters decisions by status and source', () => {
    expect(filterDecisionRecords(decisions, { status: 'proposed', source: 'all' }).map((decision) => decision.id)).toEqual([
      proposedDecision.id,
      numbersFollowUpDecision.id,
      peopleFollowUpDecision.id
    ]);
    expect(filterDecisionRecords(decisions, { status: 'all', source: 'numbers' }).map((decision) => decision.id)).toEqual([
      numbersFollowUpDecision.id
    ]);
    expect(filterDecisionRecords(decisions, { status: 'approved', source: 'opportunity' }).map((decision) => decision.id)).toEqual([
      approvedDecision.id
    ]);
    expect(filterDecisionRecords(decisions, { status: 'all', source: 'people' }).map((decision) => decision.id)).toEqual([
      peopleFollowUpDecision.id
    ]);
  });

  it('maps browser all-filters to bounded server query filters', () => {
    expect(decisionServerFilters({ status: 'all', source: 'all' })).toEqual({});
    expect(decisionServerFilters({ status: 'approved', source: 'people' })).toEqual({
      status: 'approved',
      source: 'people'
    });
  });

  it('derives workload counts from all and visible decisions', () => {
    const visible = filterDecisionRecords(decisions, { status: 'proposed', source: 'all' });
    const counts = decisionListCounts(decisions, visible);

    expect(counts.total).toBe(5);
    expect(counts.visible).toBe(3);
    expect(counts.proposed).toBe(3);
    expect(counts.approved).toBe(1);
    expect(counts.rejected).toBe(1);
    expect(counts.playerImpacting).toBe(0);
  });

  it('parses persisted decision list settings safely', () => {
    expect(parseDecisionListSettings({ status: 'approved', source: 'people', pageSize: 3 })).toEqual({
      status: 'approved',
      source: 'people',
      pageSize: 3
    });
    expect(parseDecisionListSettings({ status: 'invalid', source: 'unsafe', pageSize: 999 })).toEqual({
      status: 'all',
      source: 'all',
      pageSize: 5
    });
  });

  it('reads and writes browser-local decision list settings', () => {
    const storage = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value)
    };

    writeDecisionListSettings(adapter, 'decision-settings', {
      status: 'rejected',
      source: 'opportunity',
      pageSize: 10
    });

    expect(readDecisionListSettings(adapter, 'decision-settings')).toEqual({
      status: 'rejected',
      source: 'opportunity',
      pageSize: 10
    });
    storage.set('decision-settings', '{bad json');
    expect(readDecisionListSettings(adapter, 'decision-settings')).toEqual({
      status: 'all',
      source: 'all',
      pageSize: 5
    });
  });

  it('paginates visible decisions with clamped page bounds', () => {
    const firstPage = paginateDecisionRecords(decisions, 1, 3);
    const secondPage = paginateDecisionRecords(decisions, 2, 3);
    const clampedPage = paginateDecisionRecords(decisions, 99, 3);

    expect(firstPage.items.map((decision) => decision.id)).toEqual([proposedDecision.id, approvedDecision.id, rejectedDecision.id]);
    expect(firstPage.startIndex).toBe(1);
    expect(firstPage.endIndex).toBe(3);
    expect(firstPage.totalPages).toBe(2);
    expect(secondPage.items.map((decision) => decision.id)).toEqual([numbersFollowUpDecision.id, peopleFollowUpDecision.id]);
    expect(clampedPage.page).toBe(2);
  });
});
