import type { Db } from 'mongodb';
import type {
  CommandApiHealthSummary,
  IngestionHealthSummary,
  OperationsHealthResponse,
  OperationsHealthStatus,
  OperationsHealthWarning,
  OperationsWorkerClass,
  RetryPostureSummary,
  WorkerReadinessSummary,
  WorkerSecretState
} from '../../../packages/contracts/src/index';

export const operationsHealthBoundary =
  'Operations health is read-only. It does not dispatch workers, execute retries, fetch ESI, write to EVE, mutate wallets, assets, contracts, roles, standings, access, or call external services.';

interface CommandApiConfig {
  key: CommandApiHealthSummary['key'];
  label: string;
  collection: string;
  query: Record<string, unknown>;
}

interface WorkerClassConfig {
  workerClass: OperationsWorkerClass;
  label: string;
  classSecret: string;
}

const commandApis: CommandApiConfig[] = [
  { key: 'command_brief', label: 'Command brief', collection: 'research_briefs', query: {} },
  { key: 'numbers', label: 'Numbers API', collection: 'numbers_snapshots', query: {} },
  { key: 'opportunity', label: 'Opportunity API', collection: 'research_briefs', query: {} },
  { key: 'people', label: 'People API', collection: 'member_profiles', query: {} },
  { key: 'decision_records', label: 'Decision Records API', collection: 'strategic_decisions', query: {} },
  { key: 'automation_queue', label: 'Automation Queue API', collection: 'automation_queue', query: {} },
  { key: 'esi_sync', label: 'ESI sync API', collection: 'esi_sync_requests', query: {} }
];

const workerClasses: WorkerClassConfig[] = [
  { workerClass: 'worker_handoff', label: 'Worker handoff callbacks', classSecret: 'WORKER_HANDOFF_CALLBACK_SECRET' },
  { workerClass: 'retry_worker', label: 'Retry worker callbacks', classSecret: 'RETRY_WORKER_CALLBACK_SECRET' },
  { workerClass: 'esi_sync', label: 'ESI sync worker callbacks', classSecret: 'ESI_SYNC_WORKER_CALLBACK_SECRET' },
  { workerClass: 'people_ingestion', label: 'People ingestion worker callbacks', classSecret: 'PEOPLE_INGESTION_WORKER_CALLBACK_SECRET' },
  {
    workerClass: 'opportunity_ingestion',
    label: 'Opportunity ingestion worker callbacks',
    classSecret: 'OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET'
  }
];

function isoDate(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function statusFromCount(count: number): OperationsHealthStatus {
  return count > 0 ? 'ready' : 'degraded';
}

function combineStatus(statuses: OperationsHealthStatus[]): OperationsHealthStatus {
  if (statuses.includes('blocked')) {
    return 'blocked';
  }

  if (statuses.includes('degraded')) {
    return 'degraded';
  }

  return 'ready';
}

async function latestTimestamp(db: Db, collection: string, query: Record<string, unknown>): Promise<string | null> {
  const document = await db.collection(collection).find(query).sort({ updatedAt: -1, createdAt: -1, requestedAt: -1 }).limit(1).next();
  return isoDate(document?.updatedAt) ?? isoDate(document?.createdAt) ?? isoDate(document?.requestedAt);
}

async function commandApiSummary(
  db: Db,
  corporationId: string,
  config: CommandApiConfig
): Promise<CommandApiHealthSummary> {
  try {
    const query = { ...config.query, corporationId };
    const count = await db.collection(config.collection).countDocuments(query);
    const lastUpdatedAt = await latestTimestamp(db, config.collection, query);
    return {
      key: config.key,
      label: config.label,
      status: statusFromCount(count),
      evidence: `${count} scoped ${config.collection} records found.`,
      lastUpdatedAt
    };
  } catch {
    return {
      key: config.key,
      label: config.label,
      status: 'blocked',
      evidence: `Unable to read scoped ${config.collection} records.`,
      lastUpdatedAt: null
    };
  }
}

async function countStatuses(db: Db, collection: string, corporationId: string, statuses: string[]) {
  const counts = await Promise.all(
    statuses.map(async (status) => [status, await db.collection(collection).countDocuments({ corporationId, status })] as const)
  );

  return Object.fromEntries(counts) as Record<string, number>;
}

async function ingestionSummary(
  db: Db,
  corporationId: string,
  key: IngestionHealthSummary['key'],
  label: string,
  collection: string,
  statusMap: {
    queued: string[];
    processing: string[];
    completed: string[];
    failed: string[];
  }
): Promise<IngestionHealthSummary> {
  try {
    const statuses = [...statusMap.queued, ...statusMap.processing, ...statusMap.completed, ...statusMap.failed];
    const counts = await countStatuses(db, collection, corporationId, statuses);
    const queued = statusMap.queued.reduce((total, status) => total + (counts[status] ?? 0), 0);
    const processing = statusMap.processing.reduce((total, status) => total + (counts[status] ?? 0), 0);
    const completed = statusMap.completed.reduce((total, status) => total + (counts[status] ?? 0), 0);
    const failed = statusMap.failed.reduce((total, status) => total + (counts[status] ?? 0), 0);
    const latestAt = await latestTimestamp(db, collection, { corporationId });
    const status: OperationsHealthStatus = failed > 0 ? 'degraded' : completed + queued + processing > 0 ? 'ready' : 'degraded';

    return {
      key,
      label,
      status,
      queued,
      processing,
      completed,
      failed,
      latestAt,
      evidence: `${queued} queued, ${processing} processing, ${completed} completed, ${failed} failed records.`
    };
  } catch {
    return {
      key,
      label,
      status: 'blocked',
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      latestAt: null,
      evidence: `Unable to read scoped ${collection} records.`
    };
  }
}

async function retryPosture(db: Db, corporationId: string): Promise<RetryPostureSummary> {
  try {
    const [scheduled, claimed, completed, blocked, canceled, workerHandoffTargets, esiSyncTargets] = await Promise.all([
      db.collection('retry_requests').countDocuments({ corporationId, status: 'scheduled' }),
      db.collection('retry_requests').countDocuments({ corporationId, status: 'claimed' }),
      db.collection('retry_requests').countDocuments({ corporationId, status: 'completed' }),
      db.collection('retry_requests').countDocuments({ corporationId, status: 'blocked' }),
      db.collection('retry_requests').countDocuments({ corporationId, status: 'canceled' }),
      db.collection('retry_requests').countDocuments({ corporationId, targetType: 'worker_handoff' }),
      db.collection('retry_requests').countDocuments({ corporationId, targetType: 'esi_sync_request' })
    ]);

    return {
      scheduled,
      claimed,
      completed,
      blocked,
      canceled,
      workerHandoffTargets,
      esiSyncTargets,
      evidence: `${scheduled} scheduled retries, ${blocked} blocked retries, ${workerHandoffTargets} worker handoff targets, ${esiSyncTargets} ESI sync targets.`
    };
  } catch {
    return {
      scheduled: 0,
      claimed: 0,
      completed: 0,
      blocked: 0,
      canceled: 0,
      workerHandoffTargets: 0,
      esiSyncTargets: 0,
      evidence: 'Unable to read scoped retry records.'
    };
  }
}

export function summarizeWorkerReadiness(env: NodeJS.ProcessEnv = process.env): WorkerReadinessSummary[] {
  const hasFallback = Boolean(env.WORKER_CALLBACK_SECRET);

  return workerClasses.map((config) => {
    const hasClassSecret = Boolean(env[config.classSecret]);
    const secretState: WorkerSecretState = hasClassSecret ? 'configured' : hasFallback ? 'fallback' : 'missing';
    const status: OperationsHealthStatus = secretState === 'configured' ? 'ready' : secretState === 'fallback' ? 'degraded' : 'blocked';
    const evidence =
      secretState === 'configured'
        ? `${config.classSecret} is configured for this worker class.`
        : secretState === 'fallback'
          ? `Using shared WORKER_CALLBACK_SECRET fallback for ${config.classSecret}.`
          : `No class-specific secret or shared fallback is configured for ${config.classSecret}.`;

    return {
      workerClass: config.workerClass,
      label: config.label,
      secretState,
      status,
      evidence
    };
  });
}

function configurationWarnings(env: NodeJS.ProcessEnv, workerReadiness: WorkerReadinessSummary[]): OperationsHealthWarning[] {
  const warnings: OperationsHealthWarning[] = [];

  for (const name of ['EVE_SESSION_SECRET', 'ESI_TOKEN_VAULT_SEALING_KEY', 'EVE_SSO_CLIENT_ID', 'EVE_SSO_CLIENT_SECRET', 'EVE_SSO_REDIRECT_URI']) {
    if (!env[name]) {
      warnings.push({
        key: `missing_${name.toLowerCase()}`,
        severity: 'warning',
        message: `${name} is not configured in this runtime.`
      });
    }
  }

  if (env.EVE_SSO_TEST_IDENTITY_JSON) {
    warnings.push({
      key: 'test_identity_configured',
      severity: 'critical',
      message: 'EVE_SSO_TEST_IDENTITY_JSON is configured and must be absent from production.'
    });
  }

  for (const worker of workerReadiness) {
    if (worker.secretState === 'missing') {
      warnings.push({
        key: `missing_${worker.workerClass}_secret`,
        severity: 'warning',
        message: `${worker.label} has no class-specific secret or shared fallback configured.`
      });
    }
  }

  warnings.push({
    key: 'production_evidence_external',
    severity: 'info',
    message: 'Live Netlify, EVE SSO provider, MongoDB backup/index/access, and monitoring evidence must be verified with the M46 production operations runbook.'
  });

  return warnings;
}

export function deriveOverallStatus(
  commandApis: CommandApiHealthSummary[],
  ingestion: IngestionHealthSummary[],
  workerReadiness: WorkerReadinessSummary[],
  warnings: OperationsHealthWarning[]
): OperationsHealthStatus {
  return combineStatus([
    ...commandApis.map((item) => item.status),
    ...ingestion.map((item) => item.status),
    ...workerReadiness.map((item) => item.status),
    ...warnings.map((warning) => (warning.severity === 'critical' ? 'blocked' : warning.severity === 'warning' ? 'degraded' : 'ready'))
  ]);
}

export async function buildOperationsHealthResponse(
  db: Db,
  corporationId: string,
  env: NodeJS.ProcessEnv = process.env,
  now = new Date()
): Promise<OperationsHealthResponse> {
  const commandApiSummaries = await Promise.all(commandApis.map((config) => commandApiSummary(db, corporationId, config)));
  const ingestion = await Promise.all([
    ingestionSummary(db, corporationId, 'numbers_esi_sync', 'Numbers ESI sync', 'esi_sync_requests', {
      queued: ['queued'],
      processing: ['claimed'],
      completed: ['completed'],
      failed: ['failed', 'cancelled']
    }),
    ingestionSummary(db, corporationId, 'people_ingestion', 'People ingestion', 'people_ingestion_requests', {
      queued: ['queued'],
      processing: ['claimed'],
      completed: ['completed'],
      failed: ['failed']
    }),
    ingestionSummary(db, corporationId, 'opportunity_ingestion', 'Opportunity ingestion', 'research_requests', {
      queued: ['queued'],
      processing: ['processing'],
      completed: ['processed'],
      failed: ['failed']
    })
  ]);
  const workerReadiness = summarizeWorkerReadiness(env);
  const warnings = configurationWarnings(env, workerReadiness);

  return {
    generatedAt: now.toISOString(),
    corporationId,
    overallStatus: deriveOverallStatus(commandApiSummaries, ingestion, workerReadiness, warnings),
    commandApis: commandApiSummaries,
    ingestion,
    retryPosture: await retryPosture(db, corporationId),
    workerReadiness,
    warnings,
    boundary: operationsHealthBoundary
  };
}
