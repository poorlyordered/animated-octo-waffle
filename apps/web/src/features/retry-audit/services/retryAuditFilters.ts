import { retryRequestStatuses, type RetryRequestStatus, type RetryRequestSummary } from '@gryyk/contracts';

export type RetryAuditStatusFilter = 'all' | RetryRequestStatus;

export const retryAuditStatusFilters: RetryAuditStatusFilter[] = ['all', ...retryRequestStatuses];

export function retryAuditStatusLabel(status: RetryAuditStatusFilter): string {
  if (status === 'all') {
    return 'All statuses';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function filterRetryAudit(retries: RetryRequestSummary[], status: RetryAuditStatusFilter): RetryRequestSummary[] {
  if (status === 'all') {
    return retries;
  }

  return retries.filter((retry) => retry.status === status);
}

export function retryAttemptSummary(retry: RetryRequestSummary): string {
  const parts = [`${retry.status}: ${retry.reason}`];

  if (retry.claimedBy) parts.push(`Claimed by ${retry.claimedBy}.`);
  if (retry.completedAt) parts.push(`Completed ${new Date(retry.completedAt).toLocaleString()}.`);
  if (retry.canceledAt) parts.push(`Canceled ${new Date(retry.canceledAt).toLocaleString()}.`);
  if (retry.cancelReason) parts.push(`Reason: ${retry.cancelReason}`);
  if (retry.result) parts.push(`Replacement ${retry.result.replacementTargetId} is ${retry.result.replacementTargetStatus}.`);
  if (retry.blockedReason) parts.push(`Blocked: ${retry.blockedReason}`);
  parts.push(retry.policy.boundary);

  return parts.join(' ');
}
