import {
  automationQueueItemResponseSchema,
  scheduleRetryResponseSchema,
  workerClaimRequestSchema,
  workerCompleteRequestSchema,
  workerFailRequestSchema,
  workerHandoffListResponseSchema,
  workerHandoffResponseSchema,
  workerProgressRequestSchema
} from '@gryyk/contracts';
import { queuedItem } from '../fixtures/automationQueue';
import { handoffRetryResponse } from '../fixtures/retry';
import {
  blockedHandoff,
  claimedHandoff,
  completedHandoff,
  failedHandoff,
  failedHandoffWithCompletedRetry,
  readyHandoff
} from '../fixtures/workerHandoff';

describe('Worker Handoff API contract', () => {
  it('accepts scheduled handoff retry responses', () => {
    const parsed = scheduleRetryResponseSchema.parse(handoffRetryResponse);

    expect(parsed.retry.targetType).toBe('worker_handoff');
    expect(parsed.retry.status).toBe('scheduled');
    expect(JSON.stringify(parsed)).not.toContain('dispatchTarget');
    expect(JSON.stringify(parsed)).not.toContain('token');
  });

  it('accepts handoff preparation responses', () => {
    const parsed = workerHandoffResponseSchema.parse({ handoff: readyHandoff });

    expect(parsed.handoff.status).toBe('ready');
    expect(parsed.handoff.payloadSummary.taskIntent).toBe(queuedItem.taskIntent);
  });

  it('accepts scoped handoff list responses across statuses', () => {
    const parsed = workerHandoffListResponseSchema.parse({
      handoffs: [readyHandoff, blockedHandoff, claimedHandoff, completedHandoff, failedHandoff]
    });

    expect(parsed.handoffs.map((handoff) => handoff.status)).toEqual([
      'ready',
      'blocked',
      'claimed',
      'completed',
      'failed'
    ]);
  });

  it('accepts completed retry execution summaries on failed handoffs', () => {
    const parsed = workerHandoffResponseSchema.parse({ handoff: failedHandoffWithCompletedRetry });

    expect(parsed.handoff.retry?.status).toBe('completed');
    expect(parsed.handoff.retry?.result?.replacementTargetStatus).toBe('ready');
  });

  it('accepts queue detail responses with latest handoff summary', () => {
    const parsed = automationQueueItemResponseSchema.parse({
      queueItem: queuedItem,
      handoff: {
        id: readyHandoff.id,
        status: readyHandoff.status,
        createdAt: readyHandoff.createdAt,
        updatedAt: readyHandoff.updatedAt,
        progress: []
      }
    });

    expect(parsed.handoff?.status).toBe('ready');
  });

  it('does not include secrets or dispatch targets in browser-visible handoff JSON', () => {
    const body = JSON.stringify({ handoff: completedHandoff });

    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('credential');
    expect(body).not.toContain('dispatchTarget');
    expect(body).not.toContain('rawPayload');
  });

  it('accepts worker callback request payloads', () => {
    expect(workerClaimRequestSchema.parse({ workerId: 'overnightdesk-worker-1' })).toEqual({
      workerId: 'overnightdesk-worker-1'
    });
    expect(
      workerProgressRequestSchema.parse({
        workerId: 'overnightdesk-worker-1',
        message: 'Fetched source documents',
        code: 'sources_fetched'
      })
    ).toEqual({
      workerId: 'overnightdesk-worker-1',
      message: 'Fetched source documents',
      code: 'sources_fetched'
    });
    expect(
      workerCompleteRequestSchema.parse({
        workerId: 'overnightdesk-worker-1',
        summary: 'Prepared safe output summary',
        artifactRefs: ['brief:abc123']
      })
    ).toEqual({
      workerId: 'overnightdesk-worker-1',
      summary: 'Prepared safe output summary',
      artifactRefs: ['brief:abc123']
    });
    expect(
      workerFailRequestSchema.parse({
        workerId: 'overnightdesk-worker-1',
        message: 'Source data unavailable',
        code: 'source_unavailable'
      })
    ).toEqual({
      workerId: 'overnightdesk-worker-1',
      message: 'Source data unavailable',
      code: 'source_unavailable'
    });
  });

  it('rejects unsafe callback payload fields', () => {
    expect(() =>
      workerCompleteRequestSchema.parse({
        workerId: 'overnightdesk-worker-1',
        summary: 'Prepared safe output summary',
        token: 'secret-token',
        dispatchTarget: 'external-system',
        rawPayload: { secret: 'value' }
      })
    ).toThrow();
  });
});
