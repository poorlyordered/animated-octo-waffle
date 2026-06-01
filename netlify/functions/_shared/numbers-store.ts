import type { Db } from 'mongodb';
import type { NumbersSnapshot } from '../../../packages/contracts/src/index';
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
