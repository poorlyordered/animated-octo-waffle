import {
  createIntelligenceRefreshRunRequestSchema,
  createIntelligenceRefreshRunResponseSchema,
  intelligenceRefreshReadinessResponseSchema,
  intelligenceRefreshRunDetailResponseSchema,
  intelligenceRefreshRunListResponseSchema,
  intelligenceRefreshRunResponseSchema,
  intelligenceRefreshStepRetryResponseSchema,
  intelligenceRefreshStepSkipResponseSchema
} from '@gryyk/contracts';
import {
  completedRefreshRun,
  partialRefreshRun,
  queuedRefreshRun,
  refreshBoundary,
  refreshEvents,
  refreshReadiness,
  refreshTimeline
} from '../fixtures/intelligenceRefresh';

describe('intelligence refresh commander API contract', () => {
  it('accepts create requests and create responses', () => {
    expect(
      createIntelligenceRefreshRunRequestSchema.parse({
        domains: ['numbers', 'people', 'opportunity'],
        mode: 'full_refresh',
        reason: 'Refresh command intelligence before planning.'
      })
    ).toEqual({
      domains: ['numbers', 'people', 'opportunity'],
      mode: 'full_refresh',
      reason: 'Refresh command intelligence before planning.'
    });

    const parsed = createIntelligenceRefreshRunResponseSchema.parse({
      run: queuedRefreshRun,
      duplicate: false
    });

    expect(parsed.run.steps.map((step) => step.domain)).toEqual(['numbers', 'opportunity', 'people']);
    expect(parsed.duplicate).toBe(false);
  });

  it('defaults create request mode for backward compatibility', () => {
    expect(createIntelligenceRefreshRunRequestSchema.parse({ domains: ['numbers'] })).toEqual({
      domains: ['numbers'],
      mode: 'full_refresh'
    });
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

  it('accepts readiness, detailed timeline, and event responses', () => {
    const readiness = intelligenceRefreshReadinessResponseSchema.parse(refreshReadiness);
    const detail = intelligenceRefreshRunDetailResponseSchema.parse({
      run: partialRefreshRun,
      timeline: refreshTimeline,
      events: refreshEvents,
      boundary: refreshBoundary
    });

    expect(readiness.overallStatus).toBe('ready');
    expect(detail.timeline[1]?.statusLabel).toContain('Failed');
    expect(detail.events.map((event) => event.eventType)).toEqual(['run_created', 'step_failed']);
  });

  it('accepts retry and skip intent responses without execution handles', () => {
    const retry = intelligenceRefreshStepRetryResponseSchema.parse({
      run: partialRefreshRun,
      event: {
        ...refreshEvents[1],
        id: 'event-retry',
        eventType: 'step_retry_requested',
        actor: 'session:Ari Voss',
        message: 'Commander recorded retry intent.'
      },
      boundary: refreshBoundary
    });
    const skip = intelligenceRefreshStepSkipResponseSchema.parse({
      run: partialRefreshRun,
      event: {
        ...refreshEvents[1],
        id: 'event-skip',
        eventType: 'step_skipped',
        actor: 'session:Ari Voss',
        message: 'Commander skipped People step.'
      },
      boundary: refreshBoundary
    });

    expect(retry.event.eventType).toBe('step_retry_requested');
    expect(skip.event.eventType).toBe('step_skipped');
    expect(JSON.stringify({ retry, skip })).not.toContain('dispatchTarget');
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
