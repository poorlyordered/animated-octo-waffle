import { jest } from '@jest/globals';
import {
  assertValueFreeProductionEvidence,
  createProductionEvidenceRecord,
  listProductionEvidenceRecords
} from '../../../../netlify/functions/_shared/production-evidence-store';

describe('production evidence store', () => {
  it('rejects unsafe evidence keys and value material before storage', () => {
    expect(() =>
      assertValueFreeProductionEvidence({
        commitSha: 'abcdef1',
        refreshToken: 'unsafe'
      })
    ).toThrow('not allowed');

    expect(() =>
      assertValueFreeProductionEvidence({
        commitSha: 'abcdef1',
        checks: [{ key: 'mongodb', status: 'verified', evidence: 'mongodb+srv://user:pass@example/db' }]
      })
    ).toThrow('unsafe value');
  });

  it('creates scoped value-free records and lists newest records first', async () => {
    const documents: Record<string, unknown>[] = [];
    const collection = {
      insertOne: jest.fn(async (document: Record<string, unknown>) => {
        documents.push({ ...document, _id: { toString: () => 'inserted-id' } });
        return { insertedId: { toString: () => 'inserted-id' } };
      }),
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          limit: jest.fn(() => ({
            toArray: jest.fn(async () => documents)
          }))
        }))
      }))
    };
    const db = { collection: jest.fn(() => collection) };

    const created = await createProductionEvidenceRecord(db as never, '917701062', 'session:Ari Voss', {
      environment: 'production',
      decision: 'controlled_staging',
      commitSha: 'abcdef1',
      pullRequestUrl: null,
      deployId: 'deploy-1',
      rollbackTarget: 'deploy-0',
      checks: [{ key: 'validation', status: 'verified', evidence: 'Validation passed.' }]
    });

    expect(created).toMatchObject({
      corporationId: '917701062',
      recordedBy: 'session:Ari Voss',
      deployId: 'deploy-1'
    });
    expect(JSON.stringify(created)).not.toContain('client_secret');
    expect(JSON.stringify(created)).not.toContain('mongodb+srv://');

    const listed = await listProductionEvidenceRecords(db as never, '917701062');

    expect(listed.records).toHaveLength(1);
    expect(db.collection).toHaveBeenCalledWith('production_evidence_records');
  });
});
