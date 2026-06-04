import type { DecisionRecord, DecisionStatus } from '@gryyk/contracts';

export type DecisionSourceFilter = 'all' | 'opportunity' | 'numbers';
export type DecisionStatusFilter = 'all' | DecisionStatus;

export interface DecisionListFilters {
  source: DecisionSourceFilter;
  status: DecisionStatusFilter;
}

export interface DecisionListCounts {
  approved: number;
  playerImpacting: number;
  proposed: number;
  rejected: number;
  total: number;
  visible: number;
}

export function decisionSourceDomain(decision: DecisionRecord): Exclude<DecisionSourceFilter, 'all'> {
  return decision.sourceContext?.sourceType === 'numbers_follow_up' ? 'numbers' : 'opportunity';
}

export function decisionSourceLabel(decision: DecisionRecord): string {
  return decisionSourceDomain(decision) === 'numbers' ? 'Numbers follow-up' : 'Opportunity / brief';
}

export function filterDecisionRecords(decisions: DecisionRecord[], filters: DecisionListFilters): DecisionRecord[] {
  return decisions.filter((decision) => {
    const statusMatches = filters.status === 'all' || decision.status === filters.status;
    const sourceMatches = filters.source === 'all' || decisionSourceDomain(decision) === filters.source;

    return statusMatches && sourceMatches;
  });
}

export function decisionListCounts(decisions: DecisionRecord[], visible: DecisionRecord[]): DecisionListCounts {
  return {
    approved: decisions.filter((decision) => decision.status === 'approved').length,
    playerImpacting: decisions.filter((decision) => decision.isPlayerImpacting).length,
    proposed: decisions.filter((decision) => decision.status === 'proposed').length,
    rejected: decisions.filter((decision) => decision.status === 'rejected').length,
    total: decisions.length,
    visible: visible.length
  };
}
