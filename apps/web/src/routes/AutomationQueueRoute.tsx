import { AutomationQueueDetail } from '../features/automation-queue/components/AutomationQueueDetail';
import { AutomationQueueList } from '../features/automation-queue/components/AutomationQueueList';
import { useAutomationQueue } from '../features/automation-queue/state/useAutomationQueue';

export function AutomationQueueRoute() {
  const automationQueue = useAutomationQueue();

  if (automationQueue.loading) {
    return <main className="command-brief">Loading automation queue...</main>;
  }

  if (automationQueue.error) {
    return <main className="command-brief error-state">{automationQueue.error}</main>;
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Automation Queue</p>
          <h1>Queued work</h1>
        </div>
      </header>
      <AutomationQueueList
        queueItems={automationQueue.queueItems}
        selectedQueueItemId={automationQueue.selectedQueueItem?.queueItem.id}
        statusFilter={automationQueue.statusFilter}
        onSelect={automationQueue.selectQueueItem}
        onStatusFilterChange={automationQueue.setStatusFilter}
      />
      <AutomationQueueDetail
        queueItem={automationQueue.selectedQueueItem?.queueItem ?? null}
        handoff={automationQueue.selectedQueueItem?.handoff}
        onPrepareHandoff={automationQueue.prepareHandoff}
        onScheduleHandoffRetry={automationQueue.scheduleHandoffRetry}
      />
    </main>
  );
}
