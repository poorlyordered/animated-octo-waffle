import { describe, expect, it } from 'vitest';
import {
  automationQueueItemResponseSchema,
  automationQueueListResponseSchema,
  createAutomationQueueItemRequestSchema,
  queueStatusSchema
} from '@gryyk/contracts';
import { failedItem, playerImpactingQueuedItem, queuedItem } from '../fixtures/automationQueue';

describe('Automation Queue API contract', () => {
  it('accepts queue list responses', () => {
    const parsed = automationQueueListResponseSchema.parse({ queueItems: [queuedItem, failedItem] });

    expect(parsed.queueItems[0].status).toBe('queued');
    expect(parsed.queueItems[1].failure?.message).toContain('worker');
  });

  it('accepts queue mutation and detail responses', () => {
    const parsed = automationQueueItemResponseSchema.parse({ queueItem: playerImpactingQueuedItem });

    expect(parsed.queueItem.status).toBe('queued');
    expect(parsed.queueItem.approval?.approvalText).toContain('approve');
  });

  it('accepts create requests and rejects missing task fields', () => {
    expect(
      createAutomationQueueItemRequestSchema.parse({
        sourceDecisionId: 'decision-1',
        taskIntent: 'Prepare scouting summary.',
        inputSummary: 'Use the approved decision.',
        expectedOutput: 'A commander-readable plan.',
        owner: 'research-worker'
      }).sourceDecisionId
    ).toBe('decision-1');

    expect(() =>
      createAutomationQueueItemRequestSchema.parse({
        sourceDecisionId: 'decision-1',
        inputSummary: 'Use the approved decision.',
        expectedOutput: 'A commander-readable plan.'
      })
    ).toThrow();
  });

  it('accepts valid status filters and rejects unknown values', () => {
    expect(queueStatusSchema.parse('failed')).toBe('failed');
    expect(() => queueStatusSchema.parse('executed')).toThrow();
  });
});
