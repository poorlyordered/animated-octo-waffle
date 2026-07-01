import type { CommandBrief, ResearchStatus, SourceReference } from './command-brief.js';

export const defaultBrainFocus = 'gryyk-47-brain';
export const brainPromptVersion = 'brain-command-v1';
export const brainProviders = ['openrouter'] as const;
export type BrainProvider = (typeof brainProviders)[number];

export interface BrainWorkerRunRequest {
  corporationId: string;
  focus?: string;
  workerId: string;
  reason?: string;
}

export interface BrainRunSummary {
  id: string;
  corporationId: string;
  focus: string;
  status: ResearchStatus;
  provider: BrainProvider;
  model: string;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string | null;
}

export interface BrainWorkerRunResponse {
  run: BrainRunSummary;
  brief?: Pick<CommandBrief, 'id' | 'focus' | 'model' | 'promptVersion'>;
  message: string;
}

export interface BrainDraftOrder {
  title: string;
  rationale: string;
  approvalRequired: true;
}

export interface BrainModelOutput {
  executiveSummary: string;
  briefMarkdown: string;
  strategicImpacts: string[];
  recommendedActions: string[];
  watchlist: string[];
  memory: string[];
  missingData: string[];
  confidence: number;
  coverage: CommandBrief['coverage'];
  draftOrders: BrainDraftOrder[];
  sourceReferences: SourceReference[];
}
