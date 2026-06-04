import type {
  CommandBriefViewModel,
  CoverageState,
  DecisionRecord,
  DisplayState,
  OperatingLegCoverage,
  OpportunityIngestionProvenance,
  SourceReference
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
  sourceBriefId: string;
  sourceRecommendation: string;
  sourceCount: number;
  focus: string;
  provenanceMode: OpportunityIngestionProvenance['mode'] | 'unavailable';
  message: string;
  boundary: string;
}

const readOnlyBoundary =
  'Opportunity surface is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, move wallets or assets, change contracts or roles, or execute external services.';

const decisionHandoffBoundary =
  'Opportunity decision handoff only. Approval, queueing, research scheduling, worker dispatch, ESI fetch, EVE writes, wallet or asset movement, contract or role changes, and external execution remain separate workflows.';

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
  opportunity: OpportunitySurfaceViewModel
): OpportunityDecisionHandoff {
  return {
    decisionId: decision.id,
    decisionStatus: decision.status,
    sourceBriefId: decision.sourceBriefId,
    sourceRecommendation: decision.sourceRecommendation,
    sourceCount: opportunity.sourceCount,
    focus: opportunity.provenance?.focus ?? decision.sourceProvenance.focus,
    provenanceMode: opportunity.provenance?.mode ?? 'unavailable',
    message: `Decision ${decision.id} was recorded from Opportunity recommendation "${decision.sourceRecommendation}" as ${decision.status}.`,
    boundary: decisionHandoffBoundary
  };
}
