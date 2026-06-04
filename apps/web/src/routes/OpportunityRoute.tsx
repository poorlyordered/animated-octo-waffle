import { OpportunityPanel } from '../features/opportunity/components/OpportunityPanel';
import { useDecisionRecords } from '../features/decision-records/state/useDecisionRecords';
import { useAutomationQueue } from '../features/automation-queue/state/useAutomationQueue';
import { useOpportunitySurface } from '../features/opportunity/state/useOpportunitySurface';

export function OpportunityRoute() {
  const opportunity = useOpportunitySurface();
  const decisionRecords = useDecisionRecords();
  const automationQueue = useAutomationQueue();

  return (
    <OpportunityPanel
      {...opportunity}
      onCreateDecision={decisionRecords.createDecision}
      onCreateQueue={automationQueue.createQueueItem}
      onUpdateDecisionStatus={decisionRecords.updateStatus}
    />
  );
}
