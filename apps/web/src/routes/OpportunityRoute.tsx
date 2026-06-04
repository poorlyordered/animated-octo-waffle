import { OpportunityPanel } from '../features/opportunity/components/OpportunityPanel';
import { useOpportunitySurface } from '../features/opportunity/state/useOpportunitySurface';

export function OpportunityRoute() {
  const opportunity = useOpportunitySurface();

  return <OpportunityPanel {...opportunity} />;
}
