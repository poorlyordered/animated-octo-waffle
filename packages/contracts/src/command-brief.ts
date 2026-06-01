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
}

export interface ResearchStatusResponse {
  request: ResearchRequest | null;
}

export interface CommandBriefViewModel {
  brief: CommandBrief | null;
  request: ResearchRequest | null;
  displayState: DisplayState;
  staleReason?: string;
}

export const defaultResearchFocus = 'grykk-47-eve-official-news';
