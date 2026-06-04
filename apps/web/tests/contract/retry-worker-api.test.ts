import {
  retryRequestSummarySchema,
  cancelRetryRequestSchema,
  cancelRetryResponseSchema,
  rescheduleRetryRequestSchema,
  rescheduleRetryResponseSchema,
  retryWorkerReadyResponseSchema,
  retryWorkerRequestSchema,
  retryWorkerResponseSchema
} from '@gryyk/contracts';
import {
  completedHandoffRetry,
  handoffRetryCancelResponse,
  handoffRetryRescheduleResponse,
  retryWorkerEsiBlockedResponse,
  retryWorkerHandoffCompletedResponse,
  retryWorkerReadyResponse
} from '../fixtures/retry';

describe('Retry worker API contract', () => {
  it('accepts worker ready retry listings', () => {
    const parsed = retryWorkerReadyResponseSchema.parse(retryWorkerReadyResponse);

    expect(parsed.retries).toHaveLength(2);
    expect(parsed.retries[0].status).toBe('scheduled');
    expect(JSON.stringify(parsed)).not.toContain('accessToken');
    expect(JSON.stringify(parsed)).not.toContain('dispatchTarget');
  });

  it('accepts retry worker request payloads', () => {
    expect(retryWorkerRequestSchema.parse({ workerId: 'retry-worker-1' })).toEqual({
      workerId: 'retry-worker-1'
    });
  });

  it('accepts commander retry cancellation payloads and responses', () => {
    expect(cancelRetryRequestSchema.parse({ reason: 'Commander canceled retry after policy review.' }).reason).toContain('canceled');
    const parsed = cancelRetryResponseSchema.parse(handoffRetryCancelResponse);

    expect(parsed.retry.status).toBe('canceled');
    expect(parsed.retry.policy.canCancel).toBe(false);
    expect(parsed.retry.policy.canReschedule).toBe(false);
    expect(parsed.retry.boundary).toContain('Retry canceled');
  });

  it('accepts commander retry reschedule payloads and responses', () => {
    expect(
      rescheduleRetryRequestSchema.parse({
        reason: 'Commander deferred scheduled worker handoff retry for later review.',
        notBefore: '2026-06-02T18:30:00.000Z'
      })
    ).toEqual({
      reason: 'Commander deferred scheduled worker handoff retry for later review.',
      notBefore: '2026-06-02T18:30:00.000Z'
    });
    const parsed = rescheduleRetryResponseSchema.parse(handoffRetryRescheduleResponse);

    expect(parsed.retry.status).toBe('scheduled');
    expect(parsed.retry.notBefore).toBe('2026-06-02T18:30:00.000Z');
    expect(parsed.retry.policy.canReschedule).toBe(true);
  });

  it('accepts completed handoff retry execution responses', () => {
    const parsed = retryWorkerResponseSchema.parse(retryWorkerHandoffCompletedResponse);

    expect(parsed.retry.status).toBe('completed');
    expect(parsed.retry.result?.replacementTargetStatus).toBe('ready');
    expect(parsed.retry.result?.replacementTargetId).toBe('handoff-browser-retry-ready');
  });

  it('accepts blocked ESI sync retry execution responses', () => {
    const parsed = retryWorkerResponseSchema.parse(retryWorkerEsiBlockedResponse);

    expect(parsed.retry.status).toBe('blocked');
    expect(parsed.retry.blockedReason).toContain('Active ESI consent');
  });

  it('keeps retry execution summaries browser safe', () => {
    const parsed = retryRequestSummarySchema.parse(completedHandoffRetry);
    const body = JSON.stringify(parsed);

    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('accessToken');
    expect(body).not.toContain('sealed');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('rawPayload');
    expect(body).not.toContain('dispatchTarget');
  });
});
