import { ObjectId, type Db } from 'mongodb';
import type {
  CreateProductionEvidenceRequest,
  ProductionEvidenceRecord,
  ProductionEvidenceListResponse
} from '../../../packages/contracts/src/index';

const collectionName = 'production_evidence_records';
export const productionEvidenceBoundary =
  'Production evidence records are value-free. They store deployment posture, validation status, and operator attribution only; they do not store secrets, tokens, cookies, JWTs, connection strings, or production record exports.';

const unsafeKeyPattern =
  /(secret|token|cookie|jwt|password|connection.?string|uri|access.?key|private.?key|refresh|bearer|credential|sealed|raw|export|production.?record)/i;
const unsafeValuePattern =
  /(mongodb(\+srv)?:\/\/|postgres(ql)?:\/\/|mysql:\/\/|Bearer\s+[A-Za-z0-9._-]+|eyJ[A-Za-z0-9_-]{10,}|BEGIN\s+(RSA|OPENSSH|PRIVATE)\s+KEY|client_secret|refresh_token|access_token)/i;

export class UnsafeProductionEvidenceError extends Error {
  constructor(message = 'Production evidence cannot include secrets, tokens, connection strings, or production record values') {
    super(message);
  }
}

interface ProductionEvidenceDocument extends Omit<ProductionEvidenceRecord, 'id'> {
  _id?: ObjectId;
  id?: string;
}

function inspectUnsafeEvidence(value: unknown, path = 'request'): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectUnsafeEvidence(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      if (unsafeKeyPattern.test(key)) {
        throw new UnsafeProductionEvidenceError(`Production evidence field "${path}.${key}" is not allowed`);
      }

      inspectUnsafeEvidence(child, `${path}.${key}`);
    });
    return;
  }

  if (typeof value === 'string' && unsafeValuePattern.test(value)) {
    throw new UnsafeProductionEvidenceError(`Production evidence field "${path}" contains unsafe value material`);
  }
}

export function assertValueFreeProductionEvidence(value: unknown): void {
  inspectUnsafeEvidence(value);
}

export function normalizeProductionEvidenceDocument(document: ProductionEvidenceDocument): ProductionEvidenceRecord {
  return {
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: document.corporationId,
    environment: document.environment,
    decision: document.decision,
    commitSha: document.commitSha,
    pullRequestUrl: document.pullRequestUrl,
    deployId: document.deployId,
    rollbackTarget: document.rollbackTarget,
    checks: document.checks,
    recordedBy: document.recordedBy,
    recordedAt: document.recordedAt,
    boundary: document.boundary
  };
}

export async function listProductionEvidenceRecords(
  db: Db,
  corporationId: string,
  limit = 10
): Promise<ProductionEvidenceListResponse> {
  const documents = await db
    .collection(collectionName)
    .find({ corporationId })
    .sort({ recordedAt: -1 })
    .limit(Math.min(Math.max(Math.trunc(limit) || 10, 1), 25))
    .toArray();

  return {
    records: documents.map((document) => normalizeProductionEvidenceDocument(document as ProductionEvidenceDocument)),
    boundary: productionEvidenceBoundary
  };
}

export async function createProductionEvidenceRecord(
  db: Db,
  corporationId: string,
  recordedBy: string,
  request: CreateProductionEvidenceRequest
): Promise<ProductionEvidenceRecord> {
  assertValueFreeProductionEvidence(request);

  const now = new Date().toISOString();
  const document: Omit<ProductionEvidenceRecord, 'id'> = {
    corporationId,
    environment: request.environment,
    decision: request.decision,
    commitSha: request.commitSha.trim(),
    pullRequestUrl: request.pullRequestUrl?.trim() || null,
    deployId: request.deployId?.trim() || null,
    rollbackTarget: request.rollbackTarget?.trim() || null,
    checks: request.checks.map((check) => ({
      key: check.key,
      status: check.status,
      evidence: check.evidence.trim()
    })),
    recordedBy,
    recordedAt: now,
    boundary: productionEvidenceBoundary
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeProductionEvidenceDocument({ ...document, _id: result.insertedId });
}
