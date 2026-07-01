import type {
  ProductionEvidenceCheckStatus,
  ProductionEvidenceDecision,
  ProductionEvidenceEnvironment,
  ProductionEvidenceRecord
} from '@gryyk/contracts';

export type ProductionEvidenceEnvironmentFilter = 'all' | ProductionEvidenceEnvironment;
export type ProductionEvidenceDecisionFilter = 'all' | ProductionEvidenceDecision;
export type ProductionEvidenceCheckStatusFilter = 'all' | ProductionEvidenceCheckStatus;

export interface ProductionEvidenceFilters {
  checkStatus: ProductionEvidenceCheckStatusFilter;
  decision: ProductionEvidenceDecisionFilter;
  environment: ProductionEvidenceEnvironmentFilter;
}

export interface ProductionEvidenceFilterCounts {
  totalRecords: number;
  visibleRecords: number;
}

export const defaultProductionEvidenceFilters: ProductionEvidenceFilters = {
  checkStatus: 'all',
  decision: 'all',
  environment: 'all'
};

export function filterProductionEvidenceRecords(
  records: ProductionEvidenceRecord[],
  filters: ProductionEvidenceFilters
): ProductionEvidenceRecord[] {
  return records.filter((record) => {
    const environmentMatches = filters.environment === 'all' || record.environment === filters.environment;
    const decisionMatches = filters.decision === 'all' || record.decision === filters.decision;
    const checkMatches = filters.checkStatus === 'all' || record.checks.some((check) => check.status === filters.checkStatus);

    return environmentMatches && decisionMatches && checkMatches;
  });
}

export function productionEvidenceFilterCounts(
  records: ProductionEvidenceRecord[],
  visibleRecords: ProductionEvidenceRecord[]
): ProductionEvidenceFilterCounts {
  return {
    totalRecords: records.length,
    visibleRecords: visibleRecords.length
  };
}
