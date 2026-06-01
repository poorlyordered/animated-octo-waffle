import {
  normalizeAutomationQueueDocument,
  queueProvenanceFromDecision
} from '../../../../netlify/functions/_shared/automation-queue-normalizer';
import { approvedDecision } from '../fixtures/decisionRecords';

describe('automation queue normalizer', () => {
  it('maps decision provenance into a queue snapshot', () => {
    const provenance = queueProvenanceFromDecision(approvedDecision, '2026-06-01T12:10:00.000Z');

    expect(provenance.decisionId).toBe(approvedDecision.id);
    expect(provenance.decisionStatus).toBe('approved');
    expect(provenance.coverage?.opportunity).toBe('present');
  });

  it('normalizes queued records without execution fields', () => {
    const normalized = normalizeAutomationQueueDocument({
      _id: { toString: () => 'queue-1' },
      corporationId: '917701062',
      sourceDecisionId: approvedDecision.id,
      taskIntent: 'Prepare scouting summary.',
      inputSummary: 'Use approved decision context.',
      expectedOutput: 'A commander-readable plan.',
      status: 'queued',
      isPlayerImpacting: false,
      approval: null,
      provenance: queueProvenanceFromDecision(approvedDecision, '2026-06-01T12:10:00.000Z'),
      attempts: 0,
      createdAt: '2026-06-01T12:10:00.000Z',
      updatedAt: '2026-06-01T12:10:00.000Z'
    });

    expect(normalized.status).toBe('queued');
    expect(normalized.failure).toBeUndefined();
    expect(normalized.output).toBeUndefined();
    expect(normalized.lastAttemptedAt).toBeUndefined();
  });

  it('normalizes failed and completed worker metadata', () => {
    const normalized = normalizeAutomationQueueDocument({
      _id: { toString: () => 'queue-2' },
      corporationId: '917701062',
      sourceDecisionId: approvedDecision.id,
      taskIntent: 'Prepare scouting summary.',
      inputSummary: 'Use approved decision context.',
      expectedOutput: 'A commander-readable plan.',
      status: 'failed',
      isPlayerImpacting: false,
      approval: null,
      provenance: {
        ...queueProvenanceFromDecision(approvedDecision, '2026-06-01T12:10:00.000Z'),
        sourceReferences: [{ title: 'EVE update', sourceId: null }]
      },
      attempts: 1,
      lastAttemptedAt: '2026-06-01T13:00:00.000Z',
      failure: {
        message: 'Worker unavailable.',
        failedAt: '2026-06-01T13:00:10.000Z'
      },
      output: {
        summary: 'Partial summary.'
      },
      retry: {
        eligible: true
      },
      createdAt: '2026-06-01T12:10:00.000Z',
      updatedAt: '2026-06-01T13:00:10.000Z'
    });

    expect(normalized.failure?.message).toBe('Worker unavailable.');
    expect(normalized.output?.summary).toBe('Partial summary.');
    expect(normalized.retry?.eligible).toBe(true);
    expect(normalized.provenance.sourceReferences).toEqual([{ title: 'EVE update' }]);
  });

  it('drops null optional fields from stored approval snapshots', () => {
    const normalized = normalizeAutomationQueueDocument({
      _id: { toString: () => 'queue-3' },
      corporationId: '917701062',
      sourceDecisionId: approvedDecision.id,
      taskIntent: 'Prepare scouting summary.',
      inputSummary: 'Use approved decision context.',
      expectedOutput: 'A commander-readable plan.',
      status: 'queued',
      isPlayerImpacting: true,
      approval: {
        approvedAt: '2026-06-01T12:05:00.000Z',
        approvedBy: null,
        approvalText: 'I approve this queue item.'
      },
      provenance: queueProvenanceFromDecision(approvedDecision, '2026-06-01T12:10:00.000Z'),
      attempts: 0,
      createdAt: '2026-06-01T12:10:00.000Z',
      updatedAt: '2026-06-01T12:10:00.000Z'
    });

    expect(normalized.approval).toEqual({
      approvedAt: '2026-06-01T12:05:00.000Z',
      approvalText: 'I approve this queue item.'
    });
  });
});
