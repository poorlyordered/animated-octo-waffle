import type { AutomationQueueItem, QueueStatus } from '@gryyk/contracts';

interface AutomationQueueListProps {
  queueItems: AutomationQueueItem[];
  selectedQueueItemId?: string;
  statusFilter: QueueStatus | 'all';
  onSelect: (queueItem: AutomationQueueItem) => void;
  onStatusFilterChange: (status: QueueStatus | 'all') => void;
}

const statuses: Array<QueueStatus | 'all'> = ['all', 'queued', 'blocked', 'running', 'failed', 'completed', 'canceled'];

export function AutomationQueueList({
  queueItems,
  selectedQueueItemId,
  statusFilter,
  onSelect,
  onStatusFilterChange
}: AutomationQueueListProps) {
  return (
    <section aria-label="Automation queue">
      <h2>Automation queue</h2>
      <label>
        Status filter
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as QueueStatus | 'all')}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      {queueItems.length === 0 ? (
        <p className="empty-state">No queued work has been recorded yet.</p>
      ) : (
        <div className="decision-list">
          {queueItems.map((queueItem) => (
            <button
              className={queueItem.id === selectedQueueItemId ? 'decision-list-item selected' : 'decision-list-item'}
              key={queueItem.id}
              type="button"
              onClick={() => onSelect(queueItem)}
            >
              <span>{queueItem.taskIntent}</span>
              <strong>{queueItem.status}</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
