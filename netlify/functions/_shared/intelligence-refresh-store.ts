import { ObjectId, type Db } from 'mongodb';
import type {
  IntelligenceRefreshDomain,
  IntelligenceRefreshDomainStep,
  IntelligenceRefreshEvaluation,
  IntelligenceRefreshMode,
  IntelligenceRefreshRunDetailResponse,
  IntelligenceRefreshRunEvent,
  IntelligenceRefreshRunStatus,
  IntelligenceRefreshRunSummary,
  IntelligenceRefreshTimelineItem,
  IntelligenceRefreshStepResult
} from '../../../packages/contracts/src/index';
import { findActiveOrLatestVault } from './esi-token-vault-store';
import { missingScopes, requiredScopesForDomain } from './esi-token-vault';
import { createOrFindQueuedSyncRequest } from './esi-sync-request-store';
import { createOrFindQueuedPeopleIngestionRequest } from './people-ingestion-history';
import { createOrFindQueuedOpportunityIngestionRequest } from './opportunity-ingestion-history';
import {
  activeRefreshRunStatuses,
  canRetryRefreshStep,
  canSkipRefreshStep,
  defaultRefreshStep,
  deriveRefreshRunStatus,
  intelligenceRefreshBoundary,
  normalizeRefreshDomains,
  refreshEventId,
  refreshCompletedStatus,
  refreshDomainSetKey,
  refreshEvaluationReady,
  refreshRunCreatedEvent,
  refreshStepStatusLabel,
  refreshStepStatusTone,
  refreshSourceSummary
} from './intelligence-refresh-rules';

const collectionName = 'intelligence_refresh_runs';
const defaultAllowPartialEvaluation = true;

export interface IntelligenceRefreshRunDocument extends Omit<IntelligenceRefreshRunSummary, 'id' | 'mode'> {
  _id?: { toString(): string };
  id?: string;
  activeRunKey?: string;
  domainSetKey: string;
  mode?: IntelligenceRefreshMode;
  reason?: string;
  creationToken?: string;
  events?: IntelligenceRefreshRunEvent[];
}

export interface CreateRefreshRunInput {
  corporationId: string;
  requestedBy: string;
  domains: IntelligenceRefreshDomain[];
  mode?: IntelligenceRefreshMode;
  reason?: string;
}

export interface CompleteRefreshEvaluationInput {
  brainRunId: string;
  commandBriefId?: string;
  model: string;
  provider: string;
  promptVersion: string;
  confidence?: number;
}

export function refreshRunIdFilter(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
}

export function refreshRunSummary(document: IntelligenceRefreshRunDocument): IntelligenceRefreshRunSummary {
  const id = document.id ?? document._id?.toString() ?? 'unknown';
  return {
    id,
    corporationId: document.corporationId,
    requestedBy: document.requestedBy,
    mode: document.mode ?? 'full_refresh',
    requestedDomains: normalizeRefreshDomains(document.requestedDomains),
    status: document.status,
    steps: document.steps.map((step) => ({
      ...step,
      sectionStatuses: step.sectionStatuses ?? [],
      warnings: step.warnings ?? []
    })),
    evaluation: {
      status: document.evaluation?.status ?? 'not_ready',
      brainRunId: document.evaluation?.brainRunId,
      commandBriefId: document.evaluation?.commandBriefId,
      model: document.evaluation?.model,
      provider: document.evaluation?.provider,
      promptVersion: document.evaluation?.promptVersion,
      confidence: document.evaluation?.confidence,
      sourceSummary: document.evaluation?.sourceSummary ?? [],
      createdAt: document.evaluation?.createdAt,
      completedAt: document.evaluation?.completedAt,
      failedAt: document.evaluation?.failedAt,
      failure: document.evaluation?.failure
    },
    duplicateOf: document.duplicateOf,
    policy: document.policy ?? {
      allowPartialEvaluation: defaultAllowPartialEvaluation,
      boundary: intelligenceRefreshBoundary
    },
    createdAt: dateString(document.createdAt),
    updatedAt: dateString(document.updatedAt),
    completedAt: optionalDateString(document.completedAt),
    failedAt: optionalDateString(document.failedAt),
    cancelledAt: optionalDateString(document.cancelledAt),
    failure: document.failure,
    warnings: document.warnings ?? [],
    boundary: document.boundary ?? intelligenceRefreshBoundary
  };
}

export async function createOrFindActiveRefreshRun(
  db: Db,
  input: CreateRefreshRunInput
): Promise<{ run: IntelligenceRefreshRunSummary; duplicate: boolean }> {
  const domains = normalizeRefreshDomains(input.domains);
  if (domains.length === 0) {
    throw new Error('At least one intelligence refresh domain is required');
  }

  const domainSetKey = refreshDomainSetKey(domains);
  const mode = input.mode ?? 'full_refresh';
  const activeRunKey = `${input.corporationId}:${mode}:${domainSetKey}`;
  await ensureRefreshRunIndexes(db);
  const existing = await db.collection(collectionName).findOne({ activeRunKey });
  if (existing) {
    return { run: refreshRunSummary(existing as unknown as IntelligenceRefreshRunDocument), duplicate: true };
  }

  const now = new Date().toISOString();
  const id = new ObjectId();
  const creationToken = new ObjectId().toHexString();
  const prepared = await prepareRefreshSteps(db, {
    corporationId: input.corporationId,
    requestedBy: input.requestedBy,
    domains,
    mode,
    reason: input.reason
  });
  const status = deriveRefreshRunStatus(prepared.steps);
  const document: IntelligenceRefreshRunDocument = {
    _id: id,
    id: id.toHexString(),
    activeRunKey,
    corporationId: input.corporationId,
    requestedBy: input.requestedBy,
    mode,
    requestedDomains: domains,
    domainSetKey,
    status,
    steps: prepared.steps,
    evaluation: initialEvaluation(prepared.steps),
    policy: {
      allowPartialEvaluation: defaultAllowPartialEvaluation,
      boundary: intelligenceRefreshBoundary
    },
    reason: input.reason,
    createdAt: now,
    updatedAt: now,
    warnings: prepared.warnings,
    creationToken,
    events: [
      refreshRunCreatedEvent({
        runId: id.toHexString(),
        corporationId: input.corporationId,
        actor: input.requestedBy,
        domains,
        mode,
        createdAt: now
      })
    ],
    boundary: intelligenceRefreshBoundary
  };

  const result = await upsertActiveRefreshRun(db, activeRunKey, document);
  const run = refreshRunSummary(result as unknown as IntelligenceRefreshRunDocument);

  return {
    run,
    duplicate: (result as unknown as IntelligenceRefreshRunDocument).creationToken !== creationToken
  };
}

export async function listRecentRefreshRuns(db: Db, corporationId: string, limit = 8): Promise<IntelligenceRefreshRunSummary[]> {
  const documents = await db
    .collection(collectionName)
    .find({ corporationId })
    .sort({ createdAt: -1, updatedAt: -1 })
    .limit(Math.min(Math.max(Math.trunc(limit) || 8, 1), 25))
    .toArray();

  return documents.map((document) => refreshRunSummary(document as unknown as IntelligenceRefreshRunDocument));
}

export async function findRefreshRun(
  db: Db,
  id: string,
  corporationId?: string
): Promise<IntelligenceRefreshRunSummary | null> {
  const filter: Record<string, unknown> = refreshRunIdFilter(id);
  if (corporationId) {
    filter.corporationId = corporationId;
  }
  const document = await db.collection(collectionName).findOne(filter);
  if (!document) return null;

  const runDocument = document as unknown as IntelligenceRefreshRunDocument;
  const summary = refreshRunSummary(runDocument) as IntelligenceRefreshRunSummary & { events?: IntelligenceRefreshRunEvent[] };
  summary.events = runDocument.events ?? [];
  return summary;
}

export async function findRefreshRunDetail(
  db: Db,
  id: string,
  corporationId?: string
): Promise<IntelligenceRefreshRunDetailResponse | null> {
  const filter: Record<string, unknown> = refreshRunIdFilter(id);
  if (corporationId) {
    filter.corporationId = corporationId;
  }
  const document = await db.collection(collectionName).findOne(filter);
  if (!document) return null;

  const runDocument = document as unknown as IntelligenceRefreshRunDocument;
  const run = refreshRunSummary(runDocument);
  return {
    run,
    timeline: refreshRunTimeline(run),
    events: refreshRunEvents(runDocument, run),
    boundary: intelligenceRefreshBoundary
  };
}

export async function listClaimableRefreshSteps(
  db: Db,
  domain?: IntelligenceRefreshDomain
): Promise<Array<{ runId: string; step: IntelligenceRefreshDomainStep }>> {
  const documents = await db
    .collection(collectionName)
    .find({ status: { $in: ['queued', 'running', 'waiting_for_evaluation'] } })
    .sort({ createdAt: 1 })
    .limit(25)
    .toArray();

  return documents
    .map((document) => refreshRunSummary(document as unknown as IntelligenceRefreshRunDocument))
    .flatMap((run) =>
      run.steps
        .filter((step) => step.status === 'queued' || step.status === 'prepared')
        .filter((step) => !domain || step.domain === domain)
        .map((step) => ({ runId: run.id, step }))
    );
}

export async function claimRefreshStep(
  db: Db,
  runId: string,
  stepId: string,
  workerId: string
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || (step.status !== 'queued' && step.status !== 'prepared')) {
    return null;
  }

  const now = new Date().toISOString();
  const steps = run.steps.map((item) =>
    item.id === stepId
      ? {
          ...item,
          status: 'running' as const,
          claimedBy: workerId,
          claimedAt: now
        }
      : item
  );

  const event = refreshStepEvent(run, stepId, 'step_claimed', `Worker ${workerId} claimed ${step.domain} step.`, workerId, now);
  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: { $in: ['queued', 'prepared'] } } }
  });
}

export async function completeRefreshStep(
  db: Db,
  runId: string,
  stepId: string,
  workerId: string,
  result: IntelligenceRefreshStepResult
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || step.status !== 'running' || step.claimedBy !== workerId) {
    return null;
  }

  const now = new Date().toISOString();
  const steps = run.steps.map((item) =>
    item.id === stepId
      ? {
          ...item,
          status: 'completed' as const,
          completedAt: now,
          sourceCount: result.sourceCount,
          sectionStatuses: result.sectionStatuses,
          preparedRequest: result.linkedRequest ?? item.preparedRequest,
          warnings: result.warnings
        }
      : item
  );

  const event = refreshStepEvent(run, stepId, 'step_completed', `${step.domain} step completed.`, `worker:${workerId}`, now, [
    `Sources: ${result.sourceCount}`
  ]);
  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: 'running', claimedBy: workerId } }
  });
}

export async function failRefreshStep(
  db: Db,
  runId: string,
  stepId: string,
  workerId: string,
  reason: string
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || step.status !== 'running' || step.claimedBy !== workerId) {
    return null;
  }

  const now = new Date().toISOString();
  const steps = run.steps.map((item) =>
    item.id === stepId
      ? {
          ...item,
          status: 'failed' as const,
          failedAt: now,
          failure: { reason: reason.slice(0, 500), failedAt: now }
        }
      : item
  );

  const event = refreshStepEvent(run, stepId, 'step_failed', `${step.domain} step failed.`, `worker:${workerId}`, now, [
    reason.slice(0, 500)
  ]);
  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: 'running', claimedBy: workerId } }
  });
}

export async function skipRefreshStep(
  db: Db,
  runId: string,
  stepId: string,
  workerId: string,
  reason: string
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || step.status !== 'running' || step.claimedBy !== workerId) {
    return null;
  }

  const now = new Date().toISOString();
  const steps = run.steps.map((item) =>
    item.id === stepId
      ? {
          ...item,
          status: 'skipped' as const,
          skippedAt: now,
          failure: { reason: reason.slice(0, 500), failedAt: now },
          warnings: [...item.warnings, `Skipped: ${reason.slice(0, 500)}`]
        }
      : item
  );

  const event = refreshStepEvent(run, stepId, 'step_skipped', `${step.domain} step skipped.`, `worker:${workerId}`, now, [
    reason.slice(0, 500)
  ]);
  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: 'running', claimedBy: workerId } }
  });
}

export async function markRefreshEvaluationRunning(
  db: Db,
  runId: string,
  workerId: string,
  allowPartial: boolean,
  reason?: string
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run || !refreshEvaluationReady(run.steps, allowPartial)) {
    return null;
  }

  const now = new Date().toISOString();
  return replaceRunState(db, run.id, {
    status: 'evaluating',
    evaluation: {
      ...run.evaluation,
      status: 'running',
      createdAt: now,
      sourceSummary: refreshSourceSummary(run.steps)
    },
    events: [
      ...eventsForRun(run),
      {
        id: refreshEventId(),
        runId: run.id,
        corporationId: run.corporationId,
        eventType: 'evaluation_started',
        actor: `worker:${workerId}`,
        message: 'Brain evaluation started for refresh run.',
        safeDetails: reason ? [reason.slice(0, 500)] : [],
        artifactLinks: [],
        createdAt: now
      }
    ],
    updatedAt: now,
    warnings: reason ? [...run.warnings, `Evaluation requested by ${workerId}: ${reason}`] : run.warnings
  }, {
    status: run.status
  });
}

export async function completeRefreshEvaluation(
  db: Db,
  runId: string,
  input: CompleteRefreshEvaluationInput
): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run || run.status !== 'evaluating') {
    return null;
  }

  const now = new Date().toISOString();
  return replaceRunState(db, run.id, {
    status: refreshCompletedStatus(run.steps),
    evaluation: {
      ...run.evaluation,
      status: 'completed',
      brainRunId: input.brainRunId,
      commandBriefId: input.commandBriefId,
      model: input.model,
      provider: input.provider,
      promptVersion: input.promptVersion,
      confidence: input.confidence,
      completedAt: now,
      sourceSummary: refreshSourceSummary(run.steps)
    },
    events: [
      ...eventsForRun(run),
      {
        id: refreshEventId(),
        runId: run.id,
        corporationId: run.corporationId,
        eventType: 'evaluation_completed',
        actor: 'worker:brain',
        message: 'Brain evaluation completed for refresh run.',
        safeDetails: [`Model: ${input.model}`, `Prompt: ${input.promptVersion}`],
        artifactLinks: [
          { label: 'Brain run', type: 'brain_run', id: input.brainRunId },
          ...(input.commandBriefId ? [{ label: 'Command brief', type: 'command_brief' as const, id: input.commandBriefId }] : [])
        ],
        createdAt: now
      }
    ],
    completedAt: now,
    updatedAt: now
  });
}

export async function failRefreshEvaluation(db: Db, runId: string, reason: string): Promise<IntelligenceRefreshRunSummary | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run) return null;

  const now = new Date().toISOString();
  return replaceRunState(db, run.id, {
    status: 'failed',
    evaluation: {
      ...run.evaluation,
      status: 'failed',
      failedAt: now,
      failure: reason.slice(0, 500),
      sourceSummary: refreshSourceSummary(run.steps)
    },
    events: [
      ...eventsForRun(run),
      {
        id: refreshEventId(),
        runId: run.id,
        corporationId: run.corporationId,
        eventType: 'evaluation_failed',
        actor: 'worker:brain',
        message: 'Brain evaluation failed for refresh run.',
        safeDetails: [reason.slice(0, 500)],
        artifactLinks: [],
        createdAt: now
      }
    ],
    failedAt: now,
    failure: { reason: reason.slice(0, 500), failedAt: now },
    updatedAt: now
  });
}

export async function recordRefreshStepRetryIntent(
  db: Db,
  runId: string,
  stepId: string,
  actor: string,
  reason: string,
  corporationId?: string
): Promise<{ run: IntelligenceRefreshRunSummary; event: IntelligenceRefreshRunEvent } | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run || (corporationId && run.corporationId !== corporationId)) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || !canRetryRefreshStep(step)) return null;

  const now = new Date().toISOString();
  const event = refreshStepEvent(run, stepId, 'step_retry_requested', `Commander recorded retry intent for ${step.domain}.`, actor, now, [
    reason.slice(0, 500),
    'No worker was dispatched and no external service was executed.'
  ]);
  const updated = await replaceRunState(db, run.id, {
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: { $in: ['failed', 'blocked'] } } }
  });

  return updated ? { run: updated, event } : null;
}

export async function recordRefreshStepSkipIntent(
  db: Db,
  runId: string,
  stepId: string,
  actor: string,
  reason: string,
  corporationId?: string
): Promise<{ run: IntelligenceRefreshRunSummary; event: IntelligenceRefreshRunEvent } | null> {
  const run = await loadRefreshRunForTransition(db, runId);
  if (!run || (corporationId && run.corporationId !== corporationId)) return null;

  const step = run.steps.find((item) => item.id === stepId);
  if (!step || !canSkipRefreshStep(step, run.policy.allowPartialEvaluation)) return null;

  const now = new Date().toISOString();
  const steps = run.steps.map((item) =>
    item.id === stepId
      ? {
          ...item,
          status: 'skipped' as const,
          skippedAt: now,
          failure: { reason: reason.slice(0, 500), failedAt: now },
          warnings: [...item.warnings, `Commander skipped step: ${reason.slice(0, 500)}`]
        }
      : item
  );
  const event = refreshStepEvent(run, stepId, 'step_skipped', `Commander skipped ${step.domain} step.`, actor, now, [
    reason.slice(0, 500),
    'Downstream outputs for this step remain missing.'
  ]);
  const updated = await replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    events: [...eventsForRun(run), event],
    updatedAt: now
  }, {
    steps: { $elemMatch: { id: stepId, status: { $in: ['failed', 'blocked', 'prepared'] } } }
  });

  return updated ? { run: updated, event } : null;
}

async function prepareRefreshSteps(
  db: Db,
  input: {
    corporationId: string;
    requestedBy: string;
    domains: IntelligenceRefreshDomain[];
    mode?: IntelligenceRefreshMode;
    reason?: string;
  }
): Promise<{ steps: IntelligenceRefreshDomainStep[]; warnings: string[] }> {
  const steps: IntelligenceRefreshDomainStep[] = [];
  const warnings: string[] = [];

  for (const domain of input.domains) {
    const step = defaultRefreshStep(domain);

    if (input.mode === 'evaluate_existing') {
      const stepWarnings = [`${domain} will use existing command data; no fresh source pull was prepared.`];
      steps.push({
        ...step,
        status: 'completed',
        completedAt: new Date().toISOString(),
        sourceCount: 0,
        freshness: 'existing command data',
        warnings: stepWarnings
      });
      warnings.push(...stepWarnings);
      continue;
    }

    if (domain === 'numbers') {
      const vault = await findActiveOrLatestVault(db, input.corporationId);
      if (!vault || vault.status !== 'active') {
        const stepWarnings = ['Numbers preparation blocked until ESI consent is active.'];
        steps.push({
          ...step,
          status: 'blocked',
          failure: { reason: 'Explicit active ESI read-sync consent is required for Numbers.', failedAt: new Date().toISOString() },
          warnings: stepWarnings
        });
        warnings.push(...stepWarnings);
        continue;
      }

      const requiredScopes = requiredScopesForDomain('numbers');
      const missing = missingScopes(vault.grantedScopes, requiredScopes);
      if (missing.length > 0) {
        const stepWarnings = [`Missing scopes: ${missing.join(', ')}`];
        steps.push({
          ...step,
          status: 'blocked',
          failure: { reason: 'Numbers ESI consent is missing required read scopes.', failedAt: new Date().toISOString() },
          warnings: stepWarnings
        });
        warnings.push(...stepWarnings);
        continue;
      }

      const { syncRequest, duplicate } = await createOrFindQueuedSyncRequest(db, vault, 'numbers', requiredScopes);
      const stepWarnings = duplicate ? ['Existing active Numbers ESI sync request linked.'] : [];
      steps.push({
        ...step,
        status: 'prepared',
        preparedRequest: { type: 'esi_sync_request', id: syncRequest.id ?? syncRequest._id?.toString() ?? 'unknown' },
        warnings: stepWarnings
      });
      warnings.push(...stepWarnings);
      continue;
    }

    if (domain === 'people') {
      const { request, duplicate } = await createOrFindQueuedPeopleIngestionRequest(
        db,
        input.corporationId,
        input.requestedBy,
        input.reason
      );
      const stepWarnings = duplicate ? ['Existing active People ingestion request linked.'] : [];
      steps.push({
        ...step,
        status: 'prepared',
        preparedRequest: { type: 'people_ingestion_request', id: request.id ?? request._id?.toString() ?? 'unknown' },
        warnings: stepWarnings
      });
      warnings.push(...stepWarnings);
      continue;
    }

    const { request, duplicate } = await createOrFindQueuedOpportunityIngestionRequest(
      db,
      input.corporationId,
      'command-brief',
      input.requestedBy,
      input.reason
    );
    const stepWarnings = duplicate ? ['Existing active Opportunity ingestion request linked.'] : [];
    steps.push({
      ...step,
      status: 'prepared',
      preparedRequest: { type: 'opportunity_ingestion_request', id: request.id ?? request._id?.toString() ?? 'unknown' },
      warnings: stepWarnings
    });
    warnings.push(...stepWarnings);
  }

  return { steps, warnings };
}

function initialEvaluation(steps: IntelligenceRefreshDomainStep[]): IntelligenceRefreshEvaluation {
  return evaluationForSteps(steps, {
    status: 'not_ready',
    sourceSummary: []
  });
}

function evaluationForSteps(
  steps: IntelligenceRefreshDomainStep[],
  current: IntelligenceRefreshEvaluation
): IntelligenceRefreshEvaluation {
  if (current.status === 'running' || current.status === 'completed' || current.status === 'failed') {
    return current;
  }

  return {
    ...current,
    status: refreshEvaluationReady(steps, defaultAllowPartialEvaluation) ? 'ready' : 'not_ready',
    sourceSummary: refreshSourceSummary(steps)
  };
}

async function loadRefreshRunForTransition(db: Db, runId: string): Promise<IntelligenceRefreshRunSummary | null> {
  return findRefreshRun(db, runId);
}

function refreshRunTimeline(run: IntelligenceRefreshRunSummary): IntelligenceRefreshTimelineItem[] {
  return run.steps.map((step) => ({
    stepId: step.id,
    domain: step.domain,
    technicalStatus: step.status,
    statusLabel: refreshStepStatusLabel(step),
    statusTone: refreshStepStatusTone(step),
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
    canRetry: canRetryRefreshStep(step),
    canSkip: canSkipRefreshStep(step, run.policy.allowPartialEvaluation),
    nextAction: nextActionForStep(step, run.policy.allowPartialEvaluation)
  }));
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

function refreshRunEvents(
  document: IntelligenceRefreshRunDocument,
  run: IntelligenceRefreshRunSummary
): IntelligenceRefreshRunEvent[] {
  return (document.events ?? []).slice(-50).map((event) => ({
    ...event,
    runId: event.runId || run.id,
    corporationId: event.corporationId || run.corporationId,
    safeDetails: event.safeDetails ?? [],
    artifactLinks: event.artifactLinks ?? []
  }));
}

function eventsForRun(run: IntelligenceRefreshRunSummary): IntelligenceRefreshRunEvent[] {
  const maybeRun = run as IntelligenceRefreshRunSummary & { events?: IntelligenceRefreshRunEvent[] };
  return maybeRun.events ?? [];
}

function refreshStepEvent(
  run: IntelligenceRefreshRunSummary,
  stepId: string,
  eventType: IntelligenceRefreshRunEvent['eventType'],
  message: string,
  actor: string,
  createdAt: string,
  safeDetails: string[] = []
): IntelligenceRefreshRunEvent {
  const step = run.steps.find((item) => item.id === stepId);
  return {
    id: refreshEventId(),
    runId: run.id,
    corporationId: run.corporationId,
    eventType,
    actor,
    stepId,
    domain: step?.domain,
    message,
    safeDetails,
    artifactLinks: step?.preparedRequest
      ? [{ label: step.preparedRequest.type.replaceAll('_', ' '), type: step.preparedRequest.type, id: step.preparedRequest.id }]
      : [],
    createdAt
  };
}

async function replaceRunState(
  db: Db,
  runId: string,
  set: Partial<IntelligenceRefreshRunSummary> & { events?: IntelligenceRefreshRunEvent[] },
  precondition: Record<string, unknown> = {}
): Promise<IntelligenceRefreshRunSummary | null> {
  const { events, ...stateUpdate } = set;
  const update: Partial<IntelligenceRefreshRunSummary> & { status?: IntelligenceRefreshRunStatus } = stateUpdate;
  const unset = update.status && !activeRefreshRunStatuses.includes(update.status) ? { activeRunKey: '' } : undefined;
  const eventToAppend = events?.at(-1);
  const mutation: Record<string, unknown> = { $set: update };
  if (unset) {
    mutation.$unset = unset;
  }
  if (eventToAppend) {
    mutation.$push = {
      events: {
        $each: [eventToAppend],
        $slice: -50
      }
    };
  }

  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...refreshRunIdFilter(runId),
      ...precondition
    },
    mutation,
    { returnDocument: 'after' }
  );

  return result ? refreshRunSummary(result as unknown as IntelligenceRefreshRunDocument) : null;
}

async function ensureRefreshRunIndexes(db: Db): Promise<void> {
  await db.collection(collectionName).createIndex(
    { activeRunKey: 1 },
    {
      name: 'unique_active_intelligence_refresh_run',
      unique: true,
      partialFilterExpression: { activeRunKey: { $exists: true } }
    }
  );
}

async function upsertActiveRefreshRun(
  db: Db,
  activeRunKey: string,
  document: IntelligenceRefreshRunDocument
): Promise<unknown> {
  try {
    return await db.collection(collectionName).findOneAndUpdate(
      { activeRunKey },
      { $setOnInsert: document },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const existing = await db.collection(collectionName).findOne({ activeRunKey });
      if (existing) {
        return existing;
      }
    }

    throw error;
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000);
}

function dateString(value: unknown): string {
  return optionalDateString(value) ?? new Date(0).toISOString();
}

function optionalDateString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  return undefined;
}
