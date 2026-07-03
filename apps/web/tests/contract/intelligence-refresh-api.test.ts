import {
  createIntelligenceRefreshRunRequestSchema,
  createIntelligenceRefreshRunResponseSchema,
  intelligenceRefreshRunListResponseSchema,
  intelligenceRefreshRunResponseSchema
} from '@gryyk/contracts';
import { completedRefreshRun, partialRefreshRun, queuedRefreshRun } from '../fixtures/intelligenceRefresh';

describe('intelligence refresh commander API contract', () => {
  it('accepts create requests and create responses', () => {
    expect(
      createIntelligenceRefreshRunRequestSchema.parse({
        domains: ['numbers', 'people', 'opportunity'],
        reason: 'Refresh command intelligence before planning.'
      })
    ).toEqual({
      domains: ['numbers', 'people', 'opportunity'],
      reason: 'Refresh command intelligence before planning.'
    });

    const parsed = createIntelligenceRefreshRunResponseSchema.parse({
      run: queuedRefreshRun,
      duplicate: false
    });

    expect(parsed.run.steps.map((step) => step.domain)).toEqual(['numbers', 'opportunity', 'people']);
    expect(parsed.duplicate).toBe(false);
  });

  it('accepts list and detail responses for queued, partial, and evaluated runs', () => {
    const list = intelligenceRefreshRunListResponseSchema.parse({
      runs: [queuedRefreshRun, partialRefreshRun, completedRefreshRun]
    });
    const detail = intelligenceRefreshRunResponseSchema.parse({ run: completedRefreshRun });

    expect(list.runs).toHaveLength(3);
    expect(detail.run.evaluation.brainRunId).toBe('brain-1');
    expect(detail.run.evaluation.commandBriefId).toBe('brief-1');
  });

  it('keeps secrets and execution handles out of browser-visible refresh JSON', () => {
    const body = JSON.stringify({ runs: [queuedRefreshRun, partialRefreshRun, completedRefreshRun] });

    expect(body).not.toContain('accessToken');
    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('sealed');
    expect(body).not.toContain('client-secret');
    expect(body).not.toContain('dispatchTarget');
    expect(body).not.toContain('retrySchedule');
    expect(body).not.toContain('walletAction');
    expect(body).not.toContain('roleMutation');
  });
});
