import { ObjectId, type Db } from 'mongodb';
import type { NumbersFollowUpCandidate, NumbersFollowUpOrigin, NumbersSnapshot } from '../../../packages/contracts/src/index';
import { normalizeNumbersDocument, type NumbersDocument } from './numbers-normalizer';

const collectionName = 'numbers_snapshots';

export async function findLatestNumbersSnapshot(
  db: Db,
  corporationId: string,
  focus = 'corporation'
): Promise<NumbersSnapshot | null> {
  const document = await db
    .collection(collectionName)
    .find({ corporationId, focus })
    .sort({ createdAt: -1, updatedAt: -1 })
    .limit(1)
    .next();

  return document ? normalizeNumbersDocument(document as NumbersDocument) : null;
}

export interface NumbersFollowUpSelection {
  snapshot: NumbersSnapshot;
  candidate: NumbersFollowUpCandidate;
  origin: NumbersFollowUpOrigin;
}

export async function findNumbersFollowUpCandidate(
  db: Db,
  corporationId: string,
  snapshotId: string,
  candidateId: string
): Promise<NumbersFollowUpSelection | null> {
  const snapshotFilters = ObjectId.isValid(snapshotId)
    ? [{ id: snapshotId }, { _id: new ObjectId(snapshotId) }]
    : [{ id: snapshotId }];
  const document = await db.collection(collectionName).findOne({
    corporationId,
    $or: snapshotFilters
  });

  if (!document) {
    return null;
  }

  const snapshot = normalizeNumbersDocument(document as NumbersDocument);
  const candidate = snapshot.followUps.find((item) => item.id === candidateId);

  if (!candidate) {
    return null;
  }

  const origin: NumbersFollowUpOrigin = {
    sourceType: 'numbers_follow_up',
    snapshotId: snapshot.id,
    candidateId: candidate.id,
    suggestedPath: candidate.suggestedPath
  };

  if (candidate.relatedSection) {
    origin.relatedSection = candidate.relatedSection;
  }

  return { snapshot, candidate, origin };
}
