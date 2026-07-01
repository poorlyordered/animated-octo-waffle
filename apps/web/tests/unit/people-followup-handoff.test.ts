import type { Db } from 'mongodb';
import { peopleFollowUpHandoff, assertNoUnsafePeopleFollowUpFields, assertNoUnsafePeopleFollowUpStatusFields } from '../../../../netlify/functions/_shared/people-rules';
import { buildPeopleFollowUpHandoffs, createQueueItemFromPeopleFollowUp } from '../../../../netlify/functions/_shared/people-store';
import {
  approvedPeopleFollowUp,
  approvedPeopleFollowUpDecision,
  openFollowUp,
  peopleFollowUpDecision,
  peopleFollowUpQueueItem
} from '../fixtures/people';
import { approvedDecision } from '../fixtures/decisionRecords';
import { queuedItem } from '../fixtures/automationQueue';
import { failedHandoffWithCompletedRetry, readyHandoff } from '../fixtures/workerHandoff';

describe('People follow-up handoff rules', () => {
  it('marks proposed People decisions as approval required and queue blocked', () => {
    const handoff = peopleFollowUpHandoff(openFollowUp, { decision: peopleFollowUpDecision });

    expect(handoff.approvalRequired).toBe(true);
    expect(handoff.queueReady).toBe(false);
    expect(handoff.message).toContain('Approval is required');
  });

  it('marks approved People decisions as queue ready', () => {
    const handoff = peopleFollowUpHandoff(approvedPeopleFollowUp, { decision: approvedPeopleFollowUpDecision });

    expect(handoff.approvalRequired).toBe(false);
    expect(handoff.queueReady).toBe(true);
    expect(handoff.boundary).toContain('No queued work');
  });

  it('does not mark approved non-People decisions as queue ready', () => {
    const handoff = peopleFollowUpHandoff(
      {
        ...approvedPeopleFollowUp,
        sourceDecisionId: approvedDecision.id,
        sourceContext: {
          ...approvedPeopleFollowUp.sourceContext,
          decisionId: approvedDecision.id,
          decisionStatus: 'approved'
        }
      },
      { decision: approvedDecision }
    );

    expect(handoff.queueReady).toBe(false);
    expect(handoff.approvalRequired).toBe(false);
    expect(handoff.message).toContain('does not match this People follow-up');
  });

  it('links queued work without implying execution', () => {
    const handoff = peopleFollowUpHandoff(approvedPeopleFollowUp, {
      decision: approvedPeopleFollowUpDecision,
      queueItem: peopleFollowUpQueueItem
    });

    expect(handoff.queueItemId).toBe(peopleFollowUpQueueItem.id);
    expect(handoff.queueStatus).toBe('queued');
    expect(handoff.boundary).toContain('No worker was dispatched');
  });

  it('uses existing worker handoff contract state for People queued work', () => {
    expect(readyHandoff.status).toBe('ready');
    expect(readyHandoff.queueItemId).toBeTruthy();
    expect(JSON.stringify(readyHandoff)).not.toContain('executeNow');
  });

  it('uses existing retry metadata for failed People handoffs', () => {
    expect(failedHandoffWithCompletedRetry.status).toBe('failed');
    expect(failedHandoffWithCompletedRetry.retryHistory?.[0].status).toBe('completed');
    expect(failedHandoffWithCompletedRetry.retry?.policy.delayOptions.map((option) => option.label)).toContain('Defer 6 hours');
  });

  it('rejects browser-controlled execution and handoff fields', () => {
    expect(() => assertNoUnsafePeopleFollowUpFields({ dispatch: true })).toThrow('Unsafe People follow-up action field rejected');
    expect(() => assertNoUnsafePeopleFollowUpStatusFields({ queueStatus: 'queued' })).toThrow(
      'Unsafe People follow-up status field rejected'
    );
    expect(() => assertNoUnsafePeopleFollowUpStatusFields({ approvalText: 'Approved.' })).not.toThrow();
  });

  it('does not treat unrelated linked queue items as People queue duplicates', async () => {
    const followUp = {
      ...approvedPeopleFollowUp,
      sourceQueueItemId: queuedItem.id,
      sourceContext: {
        ...approvedPeopleFollowUp.sourceContext,
        queueItemId: queuedItem.id,
        queueStatus: queuedItem.status
      }
    };
    const createdQueueItem = {
      ...peopleFollowUpQueueItem,
      id: 'queue-created-for-people-decision'
    };
    const collections = createPeopleQueueDb({
      followUps: [followUp],
      decisions: [approvedPeopleFollowUpDecision],
      queueItems: [queuedItem],
      createdQueueItem
    });

    const result = await createQueueItemFromPeopleFollowUp(collections.db, approvedPeopleFollowUp.corporationId, followUp.id, {
      title: createdQueueItem.taskIntent,
      inputSummary: createdQueueItem.inputSummary,
      expectedOutput: createdQueueItem.expectedOutput
    });

    expect(result.duplicate).toBe(false);
    expect(result.queueItem.id).toBe(createdQueueItem.id);
    expect(result.queueItem.sourceDecisionId).toBe(approvedPeopleFollowUpDecision.id);
    expect(collections.insertedQueueItems).toHaveLength(1);
  });

  it('builds validated handoffs for listed People follow-ups after reload', async () => {
    const collections = createPeopleQueueDb({
      followUps: [approvedPeopleFollowUp],
      decisions: [approvedPeopleFollowUpDecision],
      queueItems: [peopleFollowUpQueueItem],
      createdQueueItem: peopleFollowUpQueueItem
    });

    const handoffByFollowUpId = await buildPeopleFollowUpHandoffs(collections.db, approvedPeopleFollowUp.corporationId, [
      approvedPeopleFollowUp
    ]);

    expect(handoffByFollowUpId[approvedPeopleFollowUp.id]).toMatchObject({
      decisionId: approvedPeopleFollowUpDecision.id,
      queueReady: true,
      queueItemId: peopleFollowUpQueueItem.id,
      queueStatus: 'queued'
    });
  });
});

function createPeopleQueueDb({
  followUps,
  decisions,
  queueItems,
  createdQueueItem
}: {
  followUps: unknown[];
  decisions: unknown[];
  queueItems: unknown[];
  createdQueueItem: Record<string, unknown>;
}) {
  const insertedQueueItems: Array<Record<string, unknown>> = [];
  const followUpDocuments = followUps as Array<Record<string, unknown>>;
  const decisionDocuments = decisions as Array<Record<string, unknown>>;
  const queueDocuments = queueItems as Array<Record<string, unknown>>;

  const collections: Record<string, unknown> = {
    leadership_followups: {
      findOne: async (filter: Record<string, unknown>) => followUpDocuments.find((item) => matchesFilter(item, filter)) ?? null,
      updateOne: async (filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }) => {
        const item = followUpDocuments.find((candidate) => matchesFilter(candidate, filter));
        if (item && update.$set) {
          Object.assign(item, update.$set);
        }
        return { matchedCount: item ? 1 : 0 };
      }
    },
    strategic_decisions: {
      findOne: async (filter: Record<string, unknown>) => decisionDocuments.find((item) => matchesFilter(item, filter)) ?? null
    },
    automation_queue: {
      findOne: async (filter: Record<string, unknown>) => queueDocuments.find((item) => matchesFilter(item, filter)) ?? null,
      find: (filter: Record<string, unknown>) => ({
        sort: () => ({
          toArray: async () => queueDocuments.filter((item) => matchesFilter(item, filter))
        })
      }),
      insertOne: async (document: Record<string, unknown>) => {
        const inserted = { ...createdQueueItem, ...document, id: createdQueueItem.id };
        queueDocuments.push(inserted);
        insertedQueueItems.push(inserted);
        return { insertedId: { toString: () => createdQueueItem.id } };
      }
    }
  };

  return {
    db: { collection: (name: string) => collections[name] } as unknown as Db,
    insertedQueueItems
  };
}

function matchesFilter(document: Record<string, unknown>, filter: Record<string, unknown>) {
  return Object.entries(filter).every(([key, value]) => document[key] === value);
}
