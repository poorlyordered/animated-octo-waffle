import {
  filterProductionEvidenceRecords,
  productionEvidenceFilterCounts
} from '../../src/features/production-evidence/services/productionEvidenceFilters';
import {
  productionEvidenceGoRecord,
  productionEvidenceListResponse,
  productionEvidenceNoGoRecord,
  productionEvidenceRecord
} from '../fixtures/productionEvidence';

describe('production evidence filters', () => {
  const records = productionEvidenceListResponse.records;

  it('filters production evidence by environment and decision', () => {
    expect(
      filterProductionEvidenceRecords(records, {
        checkStatus: 'all',
        decision: 'controlled_staging',
        environment: 'production'
      })
    ).toEqual([productionEvidenceRecord]);

    expect(
      filterProductionEvidenceRecords(records, {
        checkStatus: 'all',
        decision: 'no_go',
        environment: 'staging'
      })
    ).toEqual([productionEvidenceNoGoRecord]);
  });

  it('filters production evidence by any check status on the record', () => {
    expect(
      filterProductionEvidenceRecords(records, {
        checkStatus: 'blocked',
        decision: 'all',
        environment: 'all'
      })
    ).toEqual([productionEvidenceNoGoRecord]);

    expect(
      filterProductionEvidenceRecords(records, {
        checkStatus: 'not_applicable',
        decision: 'all',
        environment: 'all'
      })
    ).toEqual([productionEvidenceGoRecord]);
  });

  it('counts visible records against total browser-visible records', () => {
    const visible = filterProductionEvidenceRecords(records, {
      checkStatus: 'verified',
      decision: 'go',
      environment: 'controlled_staging'
    });

    expect(productionEvidenceFilterCounts(records, visible)).toEqual({
      totalRecords: 3,
      visibleRecords: 1
    });
  });
});
