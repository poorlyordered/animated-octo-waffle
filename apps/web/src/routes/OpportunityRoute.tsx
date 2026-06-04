import { OpportunityPanel } from '../features/opportunity/components/OpportunityPanel';
import { useDecisionRecords } from '../features/decision-records/state/useDecisionRecords';
import { useOpportunitySurface } from '../features/opportunity/state/useOpportunitySurface';

export function OpportunityRoute() {
  const opportunity = useOpportunitySurface();
  const decisionRecords = useDecisionRecords();

  return <OpportunityPanel {...opportunity} onCreateDecision={decisionRecords.createDecision} />;
}
