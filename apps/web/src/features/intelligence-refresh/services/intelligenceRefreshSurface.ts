import type {
  IntelligenceRefreshDomain,
  IntelligenceRefreshDomainStep,
  IntelligenceRefreshRunSummary,
  IntelligenceRefreshTimelineItem
} from '@gryyk/contracts';

export interface IntelligenceRefreshRunViewModel {
  run: IntelligenceRefreshRunSummary;
  title: string;
  statusLabel: string;
  statusExplanation: BoardStatusExplanation;
  domainLabel: string;
  sourceCount: number;
  evaluationLabel: string;
  completedCount: number;
  warningCount: number;
}

export interface BoardStatusExplanation {
  label: string;
  tone: 'ready' | 'processing' | 'warning' | 'blocked' | 'failed' | 'complete';
  href?: string;
  reason: string;
  nextAction?: string;
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
    statusExplanation: deriveBoardStatusExplanation(run),
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

export function deriveTimelineItem(step: IntelligenceRefreshDomainStep, allowPartialEvaluation = true): IntelligenceRefreshTimelineItem {
  return {
    stepId: step.id,
    domain: step.domain,
    technicalStatus: step.status,
    statusLabel: labelForStep(step),
    statusTone: toneForStep(step),
    owner: step.claimedBy,
    startedAt: step.claimedAt,
    completedAt: step.completedAt,
    failedAt: step.failedAt,
    skippedAt: step.skippedAt,
    blocker: step.status === 'blocked' ? step.failure?.reason : undefined,
    failure: step.status === 'failed' || step.status === 'skipped' ? step.failure?.reason : undefined,
    warnings: step.warnings,
    artifactLinks: step.preparedRequest
      ? [{ label: step.preparedRequest.type.replaceAll('_', ' '), type: step.preparedRequest.type, id: step.preparedRequest.id }]
      : [],
    canRetry: step.status === 'failed' || step.status === 'blocked',
    canSkip: allowPartialEvaluation && (step.status === 'failed' || step.status === 'blocked' || step.status === 'prepared'),
    nextAction: nextActionForStep(step, allowPartialEvaluation)
  };
}

export function deriveBoardStatusExplanation(run: IntelligenceRefreshRunSummary): BoardStatusExplanation {
  if (run.status === 'completed_with_warnings' || (run.status === 'completed' && run.warnings.length > 0)) {
    return {
      label: 'Completed with missing or stale outputs',
      tone: 'warning',
      href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
      reason: run.warnings[0] ?? 'The run completed but produced warnings.',
      nextAction: 'Inspect warnings before relying on the outputs.'
    };
  }

  if (run.status === 'completed') {
    return {
      label: 'Refresh complete',
      tone: 'complete',
      href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
      reason: 'All selected refresh domains reached a terminal usable state.'
    };
  }

  const failedStep = run.steps.find((step) => step.status === 'failed');
  if (failedStep) {
    return {
      label: `${domainLabels[failedStep.domain]} refresh failed`,
      tone: 'failed',
      href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
      reason: failedStep.failure?.reason ?? 'A refresh step failed before producing usable output.',
      nextAction: 'Inspect the refresh run and record retry intent after correcting the failure.'
    };
  }

  const blockedStep = run.steps.find((step) => step.status === 'blocked');
  if (blockedStep) {
    return {
      label: blockerLabel(blockedStep),
      tone: 'blocked',
      href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
      reason: blockedStep.failure?.reason ?? 'A prerequisite is blocking source preparation.',
      nextAction: 'Resolve the prerequisite before preparing fresh source data.'
    };
  }

  if (run.status === 'queued' || run.status === 'running' || run.status === 'waiting_for_evaluation' || run.status === 'evaluating') {
    return {
      label: activeLabel(run),
      tone: run.status === 'evaluating' ? 'processing' : 'ready',
      href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
      reason: activeReason(run),
      nextAction: run.status === 'waiting_for_evaluation' ? 'Wait for Brain evaluation claim or inspect ready sources.' : 'Inspect the run timeline.'
    };
  }

  return {
    label: run.status.replaceAll('_', ' '),
    tone: 'warning',
    href: `/intelligence-refresh?run=${encodeURIComponent(run.id)}`,
    reason: 'Refresh state needs review.'
  };
}

function labelForStep(step: IntelligenceRefreshDomainStep): string {
  if (step.status === 'queued') return 'Waiting for preparation';
  if (step.status === 'prepared') return 'Waiting for worker';
  if (step.status === 'running') return 'Pulling source data';
  if (step.status === 'completed') return 'Completed source capture';
  if (step.status === 'blocked') return step.failure ? `Blocked: ${step.failure.reason}` : 'Blocked';
  if (step.status === 'failed') return step.failure ? `Failed: ${step.failure.reason}` : 'Failed';
  if (step.status === 'skipped') return step.failure ? `Skipped: ${step.failure.reason}` : 'Skipped';
  return 'Unknown status';
}

function toneForStep(step: IntelligenceRefreshDomainStep): IntelligenceRefreshTimelineItem['statusTone'] {
  if (step.status === 'completed') return 'complete';
  if (step.status === 'failed') return 'failed';
  if (step.status === 'blocked') return 'blocked';
  if (step.status === 'skipped') return 'warning';
  if (step.status === 'running') return 'processing';
  return 'ready';
}

function nextActionForStep(step: IntelligenceRefreshDomainStep, allowPartialEvaluation: boolean): string | undefined {
  if (step.status === 'blocked') return 'Resolve blocker or record retry intent when ready.';
  if (step.status === 'failed' && allowPartialEvaluation) return 'Record retry intent or skip with missing outputs.';
  if (step.status === 'failed') return 'Record retry intent after correcting the failure.';
  if (step.status === 'prepared') return 'Waiting for trusted worker claim.';
  if (step.status === 'queued') return 'Waiting for source preparation.';
  if (step.status === 'running') return 'Worker is collecting source data.';
  return undefined;
}

function blockerLabel(step: IntelligenceRefreshDomainStep): string {
  const reason = step.failure?.reason.toLowerCase() ?? '';
  if (reason.includes('esi')) return 'ESI authorization required';
  if (reason.includes('worker')) return 'Worker configuration missing';
  return `${domainLabels[step.domain]} prerequisite blocked`;
}

function activeLabel(run: IntelligenceRefreshRunSummary): string {
  if (run.status === 'waiting_for_evaluation') return 'Sources ready, waiting for Brain evaluation';
  if (run.status === 'evaluating') return 'Brain evaluation running';
  if (run.status === 'running') return 'Source workers active';
  return 'Refresh prepared, waiting for workers';
}

function activeReason(run: IntelligenceRefreshRunSummary): string {
  if (run.mode === 'evaluate_existing') return 'Existing command data is ready for evaluation without a fresh source pull.';
  if (run.status === 'waiting_for_evaluation') return 'Source preparation has finished and evaluation has not completed yet.';
  if (run.status === 'evaluating') return 'The Brain worker is evaluating prepared source outputs.';
  return 'A durable refresh run exists; browser actions have not dispatched workers or fetched external data.';
}
