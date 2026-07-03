import {
  deriveBoardStatusExplanation,
  deriveRefreshRunViewModel,
  deriveTimelineItem,
  newestRefreshRun
} from '../../src/features/intelligence-refresh/services/intelligenceRefreshSurface';
import { completedRefreshRun, partialRefreshRun, queuedRefreshRun } from '../fixtures/intelligenceRefresh';

describe('intelligence refresh surface view model', () => {
  it('derives compact run labels and counts from refresh state', () => {
    const view = deriveRefreshRunViewModel(completedRefreshRun);

    expect(view.title).toBe('Numbers + Opportunity + People refresh');
    expect(view.statusLabel).toBe('completed with warnings');
    expect(view.evaluationLabel).toBe('completed');
    expect(view.sourceCount).toBe(12);
    expect(view.completedCount).toBe(1);
    expect(view.warningCount).toBe(1);
  });

  it('selects the newest updated run for the summary panel', () => {
    expect(newestRefreshRun([queuedRefreshRun, partialRefreshRun, completedRefreshRun])?.id).toBe(completedRefreshRun.id);
    expect(newestRefreshRun([])).toBeNull();
  });

  it('uses specific timeline labels instead of generic processing state', () => {
    const prepared = deriveTimelineItem(queuedRefreshRun.steps[0]!);
    const failed = deriveTimelineItem(partialRefreshRun.steps[1]!);

    expect(prepared.statusLabel).toBe('Waiting for worker');
    expect(prepared.nextAction).toBe('Waiting for trusted worker claim.');
    expect(failed.statusLabel).toBe('Failed: People ESI worker unavailable.');
    expect(failed.canRetry).toBe(true);
    expect(failed.canSkip).toBe(true);
  });

  it('derives actionable board labels from refresh run state', () => {
    const blocked = deriveBoardStatusExplanation({
      ...queuedRefreshRun,
      status: 'queued',
      steps: [
        {
          ...queuedRefreshRun.steps[0]!,
          status: 'blocked',
          failure: {
            reason: 'Explicit active ESI read-sync consent is required for Numbers.',
            failedAt: '2026-07-03T00:00:00.000Z'
          }
        }
      ]
    });
    const failed = deriveBoardStatusExplanation(partialRefreshRun);
    const completed = deriveBoardStatusExplanation(completedRefreshRun);

    expect(blocked.label).toBe('ESI authorization required');
    expect(blocked.href).toContain(queuedRefreshRun.id);
    expect(failed.label).toBe('People refresh failed');
    expect(failed.nextAction).toContain('retry intent');
    expect(completed.label).toBe('Completed with missing or stale outputs');
  });
});
