export const researchStatuses = ['queued', 'raw_captured', 'processing', 'processed', 'failed'] as const;
export type ResearchStatus = (typeof researchStatuses)[number];

export type CoverageState = 'present' | 'missing' | 'stale';
export type DisplayState = 'empty' | 'processing' | 'processed' | 'failed' | 'stale';

export interface SourceReference {
  title: string;
  url?: string;
  sourceId?: string;
}

export interface OperatingLegCoverage {
  numbers: CoverageState;
  opportunity: CoverageState;
  people: CoverageState;
  missingReasons: string[];
}

export const opportunityIngestionModes = ['latest_research', 'historical_brief', 'unavailable'] as const;
export type OpportunityIngestionMode = (typeof opportunityIngestionModes)[number];

export type OpportunityIngestionSectionKey = 'sources' | 'impacts' | 'recommendations' | 'watchlist';

export interface OpportunityIngestionSectionStatus {
  key: OpportunityIngestionSectionKey;
  status: CoverageState;
}

export interface OpportunityIngestionHistoryItem {
  id: string;
  status: ResearchStatus;
  requestedAt: string;
  updatedAt: string;
  requestedBy?: string;
  sourceCount?: number;
  failure?: {
    reason: string;
    failedAt: string;
  };
  sectionStatuses: OpportunityIngestionSectionStatus[];
  boundary: string;
}

export interface OpportunityIngestionProvenance {
  mode: OpportunityIngestionMode;
  focus: string;
  sourceCount: number;
  briefCount: number;
  sectionStatuses: OpportunityIngestionSectionStatus[];
  history: OpportunityIngestionHistoryItem[];
  message: string;
  boundary: string;
}

export interface CommandBrief {
  id: string;
  corporationId: string;
  focus: string;
  createdAt: string;
  model: string;
  promptVersion: string;
  sourceCount: number;
  sourceReferences: SourceReference[];
  confidence: number;
  executiveSummary: string;
  briefMarkdown: string;
  strategicImpacts: string[];
  recommendedActions: string[];
  watchlist: string[];
  memory: string[];
  coverage: OperatingLegCoverage;
}

export interface ResearchRequest {
  id: string;
  corporationId: string;
  focus: string;
  status: ResearchStatus;
  createdAt: string;
  updatedAt: string;
  requestedBy?: string;
  errorMessage?: string | null;
}

export interface CommandBriefResponse {
  brief: CommandBrief | null;
  opportunityProvenance?: OpportunityIngestionProvenance;
}

export interface ResearchStatusResponse {
  request: ResearchRequest | null;
}

export interface CommandBriefViewModel {
  brief: CommandBrief | null;
  request: ResearchRequest | null;
  opportunityProvenance?: OpportunityIngestionProvenance | null;
  displayState: DisplayState;
  staleReason?: string;
}

export const defaultResearchFocus = 'grykk-47-eve-official-news';
