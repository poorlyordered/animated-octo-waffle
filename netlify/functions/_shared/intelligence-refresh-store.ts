import { ObjectId, type Db } from 'mongodb';
import type {
  IntelligenceRefreshDomain,
  IntelligenceRefreshDomainStep,
  IntelligenceRefreshEvaluation,
  IntelligenceRefreshRunStatus,
  IntelligenceRefreshRunSummary,
  IntelligenceRefreshStepResult
} from '../../../packages/contracts/src/index';
import { findActiveOrLatestVault } from './esi-token-vault-store';
import { missingScopes, requiredScopesForDomain } from './esi-token-vault';
import { createOrFindQueuedSyncRequest } from './esi-sync-request-store';
import { createOrFindQueuedPeopleIngestionRequest } from './people-ingestion-history';
import { createOrFindQueuedOpportunityIngestionRequest } from './opportunity-ingestion-history';
import {
  activeRefreshRunStatuses,
  defaultRefreshStep,
  deriveRefreshRunStatus,
  intelligenceRefreshBoundary,
  normalizeRefreshDomains,
  refreshCompletedStatus,
  refreshDomainSetKey,
  refreshEvaluationReady,
  refreshSourceSummary
} from './intelligence-refresh-rules';

const collectionName = 'intelligence_refresh_runs';
const defaultAllowPartialEvaluation = true;

export interface IntelligenceRefreshRunDocument extends Omit<IntelligenceRefreshRunSummary, 'id'> {
  _id?: { toString(): string };
  id?: string;
  domainSetKey: string;
  reason?: string;
}

export interface CreateRefreshRunInput {
  corporationId: string;
  requestedBy: string;
  domains: IntelligenceRefreshDomain[];
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
  const existing = await db.collection(collectionName).findOne({
    corporationId: input.corporationId,
    domainSetKey,
    status: { $in: activeRefreshRunStatuses }
  });

  if (existing) {
    return { run: refreshRunSummary(existing as unknown as IntelligenceRefreshRunDocument), duplicate: true };
  }

  const now = new Date().toISOString();
  const prepared = await prepareRefreshSteps(db, {
    corporationId: input.corporationId,
    requestedBy: input.requestedBy,
    domains,
    reason: input.reason
  });
  const status = deriveRefreshRunStatus(prepared.steps);
  const document: Omit<IntelligenceRefreshRunDocument, '_id' | 'id'> = {
    corporationId: input.corporationId,
    requestedBy: input.requestedBy,
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
    boundary: intelligenceRefreshBoundary
  };

  const result = await db.collection(collectionName).insertOne(document);
  return {
    run: refreshRunSummary({ ...document, _id: result.insertedId } as IntelligenceRefreshRunDocument),
    duplicate: false
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
  return document ? refreshRunSummary(document as unknown as IntelligenceRefreshRunDocument) : null;
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

  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    updatedAt: now
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

  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    updatedAt: now
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

  return replaceRunState(db, run.id, {
    steps,
    status: deriveRefreshRunStatus(steps),
    evaluation: evaluationForSteps(steps, run.evaluation),
    updatedAt: now
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
    updatedAt: now,
    warnings: reason ? [...run.warnings, `Evaluation requested by ${workerId}: ${reason}`] : run.warnings
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
    failedAt: now,
    failure: { reason: reason.slice(0, 500), failedAt: now },
    updatedAt: now
  });
}

async function prepareRefreshSteps(
  db: Db,
  input: { corporationId: string; requestedBy: string; domains: IntelligenceRefreshDomain[]; reason?: string }
): Promise<{ steps: IntelligenceRefreshDomainStep[]; warnings: string[] }> {
  const steps: IntelligenceRefreshDomainStep[] = [];
  const warnings: string[] = [];

  for (const domain of input.domains) {
    const step = defaultRefreshStep(domain);

    if (domain === 'numbers') {
      const vault = await findActiveOrLatestVault(db, input.corporationId);
      if (!vault || vault.status !== 'active') {
        steps.push({
          ...step,
          status: 'blocked',
          failure: { reason: 'Explicit active ESI read-sync consent is required for Numbers.', failedAt: new Date().toISOString() },
          warnings: ['Numbers preparation blocked until ESI consent is active.']
        });
        continue;
      }

      const requiredScopes = requiredScopesForDomain('numbers');
      const missing = missingScopes(vault.grantedScopes, requiredScopes);
      if (missing.length > 0) {
        steps.push({
          ...step,
          status: 'blocked',
          failure: { reason: 'Numbers ESI consent is missing required read scopes.', failedAt: new Date().toISOString() },
          warnings: [`Missing scopes: ${missing.join(', ')}`]
        });
        continue;
      }

      const { syncRequest, duplicate } = await createOrFindQueuedSyncRequest(db, vault, 'numbers', requiredScopes);
      steps.push({
        ...step,
        status: 'prepared',
        preparedRequest: { type: 'esi_sync_request', id: syncRequest.id ?? syncRequest._id?.toString() ?? 'unknown' },
        warnings: duplicate ? ['Existing active Numbers ESI sync request linked.'] : []
      });
      continue;
    }

    if (domain === 'people') {
      const { request, duplicate } = await createOrFindQueuedPeopleIngestionRequest(
        db,
        input.corporationId,
        input.requestedBy,
        input.reason
      );
      steps.push({
        ...step,
        status: 'prepared',
        preparedRequest: { type: 'people_ingestion_request', id: request.id ?? request._id?.toString() ?? 'unknown' },
        warnings: duplicate ? ['Existing active People ingestion request linked.'] : []
      });
      continue;
    }

    const { request, duplicate } = await createOrFindQueuedOpportunityIngestionRequest(
      db,
      input.corporationId,
      'command-brief',
      input.requestedBy,
      input.reason
    );
    steps.push({
      ...step,
      status: 'prepared',
      preparedRequest: { type: 'opportunity_ingestion_request', id: request.id ?? request._id?.toString() ?? 'unknown' },
      warnings: duplicate ? ['Existing active Opportunity ingestion request linked.'] : []
    });
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

async function replaceRunState(
  db: Db,
  runId: string,
  set: Partial<IntelligenceRefreshRunSummary>
): Promise<IntelligenceRefreshRunSummary | null> {
  const update: Partial<IntelligenceRefreshRunSummary> & { status?: IntelligenceRefreshRunStatus } = set;
  const result = await db.collection(collectionName).findOneAndUpdate(
    refreshRunIdFilter(runId),
    { $set: update },
    { returnDocument: 'after' }
  );

  return result ? refreshRunSummary(result as unknown as IntelligenceRefreshRunDocument) : null;
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
