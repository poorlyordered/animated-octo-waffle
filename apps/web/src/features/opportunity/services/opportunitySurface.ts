import type {
  AutomationQueueItem,
  CommandBriefViewModel,
  CoverageState,
  DecisionRecord,
  DisplayState,
  OperatingLegCoverage,
  OpportunityIngestionProvenance,
  SourceReference,
  WorkerHandoffSummary
} from '@gryyk/contracts';

export interface OpportunitySurfaceViewModel {
  displayState: DisplayState;
  summary: string;
  strategicImpacts: string[];
  recommendedActions: string[];
  watchlist: string[];
  sourceReferences: SourceReference[];
  sourceCount: number;
  confidence: number | null;
  createdAt: string | null;
  model: string | null;
  promptVersion: string | null;
  coverageState: CoverageState;
  missingReasons: string[];
  provenance: OpportunityIngestionProvenance | null;
  boundary: string;
}

export interface OpportunityDecisionHandoff {
  decisionId: string;
  decisionStatus: DecisionRecord['status'];
  approvalRequired: boolean;
  queueReady: boolean;
  queueItemId?: string;
  queueStatus?: AutomationQueueItem['status'];
  sourceBriefId: string;
  sourceRecommendation: string;
  sourceCount: number;
  focus: string;
  provenanceMode: OpportunityIngestionProvenance['mode'] | 'unavailable';
  message: string;
  boundary: string;
}

export interface OpportunityQueuedWorkHandoff {
  queueItemId: string;
  queueStatus: AutomationQueueItem['status'];
  taskIntent: string;
  expectedOutput: string;
  attempts: number;
  handoffId?: string;
  handoffStatus?: WorkerHandoffSummary['status'];
  handoffCreatedAt?: string;
  message: string;
  boundary: string;
}

const readOnlyBoundary =
  'Opportunity surface is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, move wallets or assets, change contracts or roles, or execute external services.';

const decisionHandoffBoundary =
  'Opportunity decision handoff only. Approval, queueing, research scheduling, worker dispatch, ESI fetch, EVE writes, wallet or asset movement, contract or role changes, and external execution remain separate workflows.';

const approvalHandoffBoundary =
  'Opportunity approval handoff only. No queued work, research scheduling, worker dispatch, ESI fetch, EVE write, wallet action, asset action, contract action, role change, or external execution was performed.';

const queueHandoffBoundary =
  'Opportunity queued work handoff only. No worker was dispatched, no handoff was prepared, and no EVE or external-service action was performed.';

const workerHandoffBoundary =
  'Opportunity worker handoff preparation creates a durable record only. It does not dispatch, claim, retry, execute, fetch ESI, write to EVE, mutate wallets, assets, contracts, roles, or call external services.';

const unavailableCoverage: OperatingLegCoverage = {
  numbers: 'missing',
  opportunity: 'missing',
  people: 'missing',
  missingReasons: ['No processed Opportunity command brief is available for this corporation scope.']
};

export function deriveOpportunitySurface(viewModel: CommandBriefViewModel): OpportunitySurfaceViewModel {
  const brief = viewModel.brief;
  const coverage = brief?.coverage ?? unavailableCoverage;
  const provenance = viewModel.opportunityProvenance ?? null;

  return {
    displayState: viewModel.displayState,
    summary:
      brief?.executiveSummary ||
      provenance?.message ||
      'No processed Opportunity context is available for this corporation scope.',
    strategicImpacts: brief?.strategicImpacts ?? [],
    recommendedActions: brief?.recommendedActions ?? [],
    watchlist: brief?.watchlist ?? [],
    sourceReferences: brief?.sourceReferences ?? [],
    sourceCount: brief?.sourceCount ?? provenance?.sourceCount ?? 0,
    confidence: brief?.confidence ?? null,
    createdAt: brief?.createdAt ?? null,
    model: brief?.model ?? null,
    promptVersion: brief?.promptVersion ?? null,
    coverageState: coverage.opportunity,
    missingReasons: coverage.missingReasons,
    provenance,
    boundary: readOnlyBoundary
  };
}

export function deriveOpportunityDecisionHandoff(
  decision: DecisionRecord,
  opportunity: OpportunitySurfaceViewModel,
  queueItem?: AutomationQueueItem
): OpportunityDecisionHandoff {
  const queueReady = decision.status === 'approved';
  const approvalRequired = decision.status === 'proposed';
  const queueDescription = queueItem
    ? `Queued work ${queueItem.id} is linked to approved Opportunity decision ${decision.id}.`
    : queueReady
      ? `Decision ${decision.id} is approved and ready for queued work.`
      : decision.status === 'rejected'
        ? `Decision ${decision.id} was rejected; queued work cannot be created.`
        : `Decision ${decision.id} requires approval before queued work.`;

  return {
    decisionId: decision.id,
    decisionStatus: decision.status,
    approvalRequired,
    queueReady,
    queueItemId: queueItem?.id,
    queueStatus: queueItem?.status,
    sourceBriefId: decision.sourceBriefId,
    sourceRecommendation: decision.sourceRecommendation,
    sourceCount: opportunity.sourceCount,
    focus: opportunity.provenance?.focus ?? decision.sourceProvenance.focus,
    provenanceMode: opportunity.provenance?.mode ?? 'unavailable',
    message: `Decision ${decision.id} was recorded from Opportunity recommendation "${decision.sourceRecommendation}" as ${decision.status}. ${queueDescription}`,
    boundary: queueItem ? queueHandoffBoundary : queueReady || decision.status === 'rejected' ? approvalHandoffBoundary : decisionHandoffBoundary
  };
}

export function deriveOpportunityQueuedWorkHandoff(
  queueItem: AutomationQueueItem,
  handoff?: WorkerHandoffSummary
): OpportunityQueuedWorkHandoff {
  const summary: OpportunityQueuedWorkHandoff = {
    queueItemId: queueItem.id,
    queueStatus: queueItem.status,
    taskIntent: queueItem.taskIntent,
    expectedOutput: queueItem.expectedOutput,
    attempts: queueItem.attempts,
    message: handoff
      ? `Worker handoff ${handoff.id} is ${handoff.status} for Opportunity queued work ${queueItem.id}.`
      : `Opportunity queued work ${queueItem.id} is ready for explicit worker handoff preparation.`,
    boundary: workerHandoffBoundary
  };

  if (handoff) {
    summary.handoffId = handoff.id;
    summary.handoffStatus = handoff.status;
    summary.handoffCreatedAt = handoff.createdAt;
  }

  return summary;
}
