import {
  automationQueueItemResponseSchema,
  workerHandoffListResponseSchema,
  workerHandoffResponseSchema
} from '@gryyk/contracts';
import { queuedItem } from '../fixtures/automationQueue';
import { blockedHandoff, readyHandoff } from '../fixtures/workerHandoff';

describe('Worker Handoff API contract', () => {
  it('accepts handoff preparation responses', () => {
    const parsed = workerHandoffResponseSchema.parse({ handoff: readyHandoff });

    expect(parsed.handoff.status).toBe('ready');
    expect(parsed.handoff.payloadSummary.taskIntent).toBe(queuedItem.taskIntent);
  });

  it('accepts scoped handoff list responses across statuses', () => {
    const parsed = workerHandoffListResponseSchema.parse({ handoffs: [readyHandoff, blockedHandoff] });

    expect(parsed.handoffs.map((handoff) => handoff.status)).toEqual(['ready', 'blocked']);
  });

  it('accepts queue detail responses with latest handoff summary', () => {
    const parsed = automationQueueItemResponseSchema.parse({
      queueItem: queuedItem,
      handoff: {
        id: readyHandoff.id,
        status: readyHandoff.status,
        createdAt: readyHandoff.createdAt,
        updatedAt: readyHandoff.updatedAt
      }
    });

    expect(parsed.handoff?.status).toBe('ready');
  });

  it('does not include secrets or dispatch targets in browser-visible handoff JSON', () => {
    const body = JSON.stringify({ handoff: readyHandoff });

    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('credential');
    expect(body).not.toContain('dispatchTarget');
  });
});
