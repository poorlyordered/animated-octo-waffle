import { filterRetryAudit, retryAttemptSummary, retryAuditStatusLabel } from '../../src/features/retry-audit/services/retryAuditFilters';
import { canceledHandoffRetry, completedHandoffRetry, handoffRetry } from '../fixtures/retry';

describe('retry audit filters', () => {
  const retries = [completedHandoffRetry, canceledHandoffRetry, handoffRetry];

  it('filters retry attempts by status without mutating the audit list', () => {
    expect(filterRetryAudit(retries, 'all').map((retry) => retry.id)).toEqual([
      completedHandoffRetry.id,
      canceledHandoffRetry.id,
      handoffRetry.id
    ]);
    expect(filterRetryAudit(retries, 'completed').map((retry) => retry.id)).toEqual([completedHandoffRetry.id]);
    expect(filterRetryAudit(retries, 'blocked')).toEqual([]);
  });

  it('labels statuses and preserves execution/cancellation audit details', () => {
    expect(retryAuditStatusLabel('all')).toBe('All statuses');
    expect(retryAuditStatusLabel('canceled')).toBe('Canceled');
    expect(retryAttemptSummary(completedHandoffRetry)).toContain('Replacement handoff-browser-retry-ready is ready.');
    expect(retryAttemptSummary(canceledHandoffRetry)).toContain('Reason: Commander canceled retry after policy review.');
  });
});
