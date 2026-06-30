import { useMemo, useState } from 'react';
import type { RetryRequestSummary } from '@gryyk/contracts';
import {
  filterRetryAudit,
  retryAttemptSummary,
  retryAuditStatusFilters,
  retryAuditStatusLabel,
  type RetryAuditStatusFilter
} from '../services/retryAuditFilters';

interface RetryAuditHistoryProps {
  ariaLabel: string;
  boundary: string;
  retries: RetryRequestSummary[];
  title?: string;
}

export function RetryAuditHistory({ ariaLabel, boundary, retries, title = 'Retry history' }: RetryAuditHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<RetryAuditStatusFilter>('all');
  const visibleRetries = useMemo(() => filterRetryAudit(retries, statusFilter), [retries, statusFilter]);

  return (
    <section aria-label={ariaLabel}>
      <h4>{title}</h4>
      <label>
        Retry status
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RetryAuditStatusFilter)}>
          {retryAuditStatusFilters.map((status) => (
            <option value={status} key={status}>
              {retryAuditStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <p>
        Showing {visibleRetries.length} of {retries.length} retry attempts.
      </p>
      {visibleRetries.length > 0 ? (
        <ul>
          {visibleRetries.map((retry) => (
            <li key={retry.id}>{retryAttemptSummary(retry)}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No retry attempts match the selected status.</p>
      )}
      <p className="notice">{boundary}</p>
    </section>
  );
}
