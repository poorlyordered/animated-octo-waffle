import {
  brainRunSummarySchema,
  commandBriefSchema,
  intelligenceRefreshRunResponseSchema,
  intelligenceRefreshWorkerClaimRequestSchema,
  intelligenceRefreshWorkerCompleteRequestSchema,
  intelligenceRefreshWorkerEvaluateRequestSchema,
  intelligenceRefreshWorkerFailRequestSchema,
  intelligenceRefreshWorkerListResponseSchema
} from '@gryyk/contracts';
import { completedRefreshRun, queuedRefreshRun } from '../fixtures/intelligenceRefresh';

describe('intelligence refresh worker API contract', () => {
  it('accepts worker transition request schemas', () => {
    expect(intelligenceRefreshWorkerClaimRequestSchema.parse({ workerId: 'numbers-worker-1' })).toEqual({
      workerId: 'numbers-worker-1'
    });
    expect(
      intelligenceRefreshWorkerCompleteRequestSchema.parse({
        workerId: 'numbers-worker-1',
        result: {
          sourceCount: 12,
          summary: 'Numbers refresh completed.',
          sectionStatuses: [{ key: 'wallet', status: 'captured' }],
          warnings: []
        }
      }).result.sourceCount
    ).toBe(12);
    expect(intelligenceRefreshWorkerFailRequestSchema.parse({ workerId: 'people-worker-1', reason: 'Source unavailable.' })).toEqual({
      workerId: 'people-worker-1',
      reason: 'Source unavailable.'
    });
    expect(intelligenceRefreshWorkerEvaluateRequestSchema.parse({ workerId: 'brain-worker-1', allowPartial: true })).toEqual({
      workerId: 'brain-worker-1',
      allowPartial: true
    });
  });

  it('accepts worker list and run responses', () => {
    const list = intelligenceRefreshWorkerListResponseSchema.parse({
      steps: [{ runId: queuedRefreshRun.id, step: queuedRefreshRun.steps[0] }]
    });
    const runResponse = intelligenceRefreshRunResponseSchema.parse({ run: completedRefreshRun });

    expect(list.steps[0].step.status).toBe('prepared');
    expect(runResponse.run.status).toBe('completed_with_warnings');
  });

  it('accepts refresh-linked Brain run and command brief summaries', () => {
    const run = brainRunSummarySchema.parse({
      id: 'brain-1',
      corporationId: completedRefreshRun.corporationId,
      focus: 'gryyk-47-brain',
      status: 'processed',
      provider: 'openrouter',
      model: 'openai/gpt-5.2',
      promptVersion: 'brain-command-v1',
      refreshRunId: completedRefreshRun.id,
      createdAt: '2026-07-03T00:04:00.000Z',
      updatedAt: '2026-07-03T00:04:30.000Z',
      completedAt: '2026-07-03T00:04:30.000Z'
    });
    const brief = commandBriefSchema.parse({
      id: 'brief-1',
      corporationId: completedRefreshRun.corporationId,
      focus: 'gryyk-47-brain',
      createdAt: '2026-07-03T00:04:30.000Z',
      model: 'openai/gpt-5.2',
      promptVersion: 'brain-command-v1',
      refreshRunId: completedRefreshRun.id,
      refreshSourceSummary: completedRefreshRun.evaluation.sourceSummary,
      sourceCount: 1,
      sourceReferences: [{ title: 'Refresh run', sourceId: completedRefreshRun.id }],
      confidence: 0.82,
      executiveSummary: 'Refresh evaluation completed.',
      briefMarkdown: '# Refresh evaluation',
      strategicImpacts: ['Numbers are refreshed.'],
      recommendedActions: ['Review the command brief.'],
      watchlist: ['Monitor failed domains.'],
      memory: ['Refresh completed with warnings.'],
      coverage: { numbers: 'present', opportunity: 'stale', people: 'stale', missingReasons: [] }
    });

    expect(run.refreshRunId).toBe(completedRefreshRun.id);
    expect(brief.refreshSourceSummary).toEqual(completedRefreshRun.evaluation.sourceSummary);
  });
});
