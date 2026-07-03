import { deriveRefreshRunViewModel, newestRefreshRun } from '../../src/features/intelligence-refresh/services/intelligenceRefreshSurface';
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
});
