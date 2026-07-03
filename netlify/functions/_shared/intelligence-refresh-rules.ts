import {
  intelligenceRefreshDomains,
  type IntelligenceRefreshDomain,
  type IntelligenceRefreshDomainStep,
  type IntelligenceRefreshRunStatus,
  type IntelligenceRefreshStepResult
} from '../../../packages/contracts/src/index';

export const intelligenceRefreshBoundary =
  'Refresh runs prepare and evaluate intelligence only. They do not execute EVE or player-impacting actions.';

export const activeRefreshRunStatuses: IntelligenceRefreshRunStatus[] = ['queued', 'running', 'waiting_for_evaluation', 'evaluating'];

const unsafeRefreshPattern =
  /(accessToken|refreshToken|sealed|client[-_ ]?secret|authorization|bearer\s+[A-Za-z0-9._-]+|dispatchTarget|retrySchedule|walletAction|assetAction|contractAction|roleMutation|accessMutation|standingMutation|rawEsi|rawPayload|eyJ[A-Za-z0-9_-]{10,})/i;

export function normalizeRefreshDomains(domains: IntelligenceRefreshDomain[]): IntelligenceRefreshDomain[] {
  const seen = new Set<IntelligenceRefreshDomain>();
  const normalized: IntelligenceRefreshDomain[] = [];
  for (const domain of domains) {
    if (intelligenceRefreshDomains.includes(domain) && !seen.has(domain)) {
      seen.add(domain);
      normalized.push(domain);
    }
  }
  return normalized;
}

export function refreshDomainSetKey(domains: IntelligenceRefreshDomain[]): string {
  return [...normalizeRefreshDomains(domains)].sort().join('|');
}

export function defaultRefreshStep(domain: IntelligenceRefreshDomain): IntelligenceRefreshDomainStep {
  return {
    id: `step-${domain}`,
    domain,
    status: 'queued',
    sectionStatuses: [],
    warnings: []
  };
}

export function deriveRefreshRunStatus(steps: IntelligenceRefreshDomainStep[], evaluating = false): IntelligenceRefreshRunStatus {
  if (evaluating) {
    return 'evaluating';
  }

  if (steps.some((step) => step.status === 'running')) {
    return 'running';
  }

  if (steps.every((step) => step.status === 'completed')) {
    return 'waiting_for_evaluation';
  }

  const terminal = steps.every((step) => ['completed', 'failed', 'blocked', 'skipped'].includes(step.status));
  const hasCompleted = steps.some((step) => step.status === 'completed');
  if (terminal && hasCompleted) {
    return 'waiting_for_evaluation';
  }

  if (terminal) {
    return 'failed';
  }

  if (steps.some((step) => step.status === 'prepared')) {
    return 'queued';
  }

  return 'queued';
}

export function refreshEvaluationReady(steps: IntelligenceRefreshDomainStep[], allowPartial: boolean): boolean {
  if (steps.length === 0) {
    return false;
  }

  const terminal = steps.every((step) => ['completed', 'failed', 'blocked', 'skipped'].includes(step.status));
  if (!terminal) {
    return false;
  }

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  return completedCount === steps.length || (allowPartial && completedCount > 0);
}

export function refreshCompletedStatus(steps: IntelligenceRefreshDomainStep[]): IntelligenceRefreshRunStatus {
  return steps.every((step) => step.status === 'completed') ? 'completed' : 'completed_with_warnings';
}

export function refreshSourceSummary(steps: IntelligenceRefreshDomainStep[]): string[] {
  return steps.map((step) => {
    if (step.status === 'completed') {
      return `${step.domain} completed with ${step.sourceCount ?? 0} sources`;
    }
    if (step.failure) {
      return `${step.domain} ${step.status}: ${step.failure.reason}`;
    }
    return `${step.domain} ${step.status}`;
  });
}

export function assertNoUnsafeRefreshFields(value: unknown): void {
  const serialized = JSON.stringify(value ?? {});
  if (unsafeRefreshPattern.test(serialized)) {
    throw new Error('Unsafe intelligence refresh field rejected');
  }
}

export function assertSafeRefreshWorkerResult(result: IntelligenceRefreshStepResult): void {
  assertNoUnsafeRefreshFields(result);
}
