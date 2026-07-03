import type { IntelligenceRefreshDomain, IntelligenceRefreshRunSummary } from '@gryyk/contracts';

export interface IntelligenceRefreshRunViewModel {
  run: IntelligenceRefreshRunSummary;
  title: string;
  statusLabel: string;
  domainLabel: string;
  sourceCount: number;
  evaluationLabel: string;
  completedCount: number;
  warningCount: number;
}

const domainLabels: Record<IntelligenceRefreshDomain, string> = {
  numbers: 'Numbers',
  opportunity: 'Opportunity',
  people: 'People'
};

export function deriveRefreshRunViewModel(run: IntelligenceRefreshRunSummary): IntelligenceRefreshRunViewModel {
  const sourceCount = run.steps.reduce((total, step) => total + (step.sourceCount ?? 0), 0);
  const completedCount = run.steps.filter((step) => step.status === 'completed').length;
  const warningCount = run.warnings.length + run.steps.reduce((total, step) => total + step.warnings.length, 0);

  return {
    run,
    title: `${run.requestedDomains.map((domain) => domainLabels[domain]).join(' + ')} refresh`,
    statusLabel: run.status.replaceAll('_', ' '),
    domainLabel: run.requestedDomains.map((domain) => domainLabels[domain]).join(', '),
    sourceCount,
    completedCount,
    warningCount,
    evaluationLabel: run.evaluation.status.replaceAll('_', ' ')
  };
}

export function newestRefreshRun(runs: IntelligenceRefreshRunSummary[]): IntelligenceRefreshRunSummary | null {
  return [...runs].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0] ?? null;
}
