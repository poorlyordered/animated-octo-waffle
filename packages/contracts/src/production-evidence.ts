export const productionEvidenceEnvironments = ['production', 'staging', 'controlled_staging'] as const;
export type ProductionEvidenceEnvironment = (typeof productionEvidenceEnvironments)[number];

export const productionEvidenceDecisions = ['go', 'no_go', 'controlled_staging'] as const;
export type ProductionEvidenceDecision = (typeof productionEvidenceDecisions)[number];

export const productionEvidenceCheckStatuses = ['verified', 'attention', 'blocked', 'not_applicable'] as const;
export type ProductionEvidenceCheckStatus = (typeof productionEvidenceCheckStatuses)[number];

export const productionEvidenceCheckKeys = [
  'validation',
  'netlify_environment',
  'eve_sso_provider',
  'mongodb',
  'monitoring',
  'worker_secrets',
  'smoke_test',
  'rollback'
] as const;
export type ProductionEvidenceCheckKey = (typeof productionEvidenceCheckKeys)[number];

export interface ProductionEvidenceCheck {
  key: ProductionEvidenceCheckKey;
  status: ProductionEvidenceCheckStatus;
  evidence: string;
}

export interface ProductionEvidenceRecord {
  id: string;
  corporationId: string;
  environment: ProductionEvidenceEnvironment;
  decision: ProductionEvidenceDecision;
  commitSha: string;
  pullRequestUrl: string | null;
  deployId: string | null;
  rollbackTarget: string | null;
  checks: ProductionEvidenceCheck[];
  recordedBy: string;
  recordedAt: string;
  boundary: string;
}

export interface CreateProductionEvidenceRequest {
  environment: ProductionEvidenceEnvironment;
  decision: ProductionEvidenceDecision;
  commitSha: string;
  pullRequestUrl?: string | null;
  deployId?: string | null;
  rollbackTarget?: string | null;
  checks: ProductionEvidenceCheck[];
}

export interface ProductionEvidenceListResponse {
  records: ProductionEvidenceRecord[];
  boundary: string;
}

export interface ProductionEvidenceRecordResponse {
  record: ProductionEvidenceRecord;
}
