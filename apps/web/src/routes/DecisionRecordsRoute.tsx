import { DecisionRecordDetail } from '../features/decision-records/components/DecisionRecordDetail';
import { DecisionRecordList } from '../features/decision-records/components/DecisionRecordList';
import { useDecisionRecords } from '../features/decision-records/state/useDecisionRecords';
import { useAutomationQueue } from '../features/automation-queue/state/useAutomationQueue';

export function DecisionRecordsRoute() {
  const decisionRecords = useDecisionRecords();
  const automationQueue = useAutomationQueue();

  if (decisionRecords.loading) {
    return <main className="command-brief">Loading decision records...</main>;
  }

  if (decisionRecords.error) {
    return <main className="command-brief error-state">{decisionRecords.error}</main>;
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Decision Records</p>
          <h1>Decision loop</h1>
        </div>
      </header>
      <DecisionRecordList
        decisions={decisionRecords.decisions}
        selectedDecisionId={decisionRecords.selectedDecision?.id}
        onSelect={decisionRecords.selectDecision}
      />
      <DecisionRecordDetail
        decision={decisionRecords.selectedDecision}
        onUpdateStatus={decisionRecords.updateStatus}
        queueItems={
          decisionRecords.selectedDecision ? automationQueue.queueItemsForDecision(decisionRecords.selectedDecision.id) : []
        }
        onCreateQueueItem={automationQueue.createQueueItem}
      />
    </main>
  );
}
