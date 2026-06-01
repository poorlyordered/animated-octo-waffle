import type { ResearchRequest, ResearchStatus } from '../../../packages/contracts/src/index';
import { defaultResearchFocus, researchRequestSchema, researchStatuses } from '../../../packages/contracts/src/index';

type RequestDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
};

function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function normalizeStatus(value: unknown): ResearchStatus {
  return researchStatuses.includes(value as ResearchStatus) ? (value as ResearchStatus) : 'failed';
}

export function normalizeResearchRequestDocument(document: RequestDocument): ResearchRequest {
  const request = {
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: String(document.corporationId ?? ''),
    focus: String(document.focus ?? defaultResearchFocus),
    status: normalizeStatus(document.status),
    createdAt: isoDate(document.createdAt),
    updatedAt: isoDate(document.updatedAt ?? document.createdAt),
    requestedBy: typeof document.requestedBy === 'string' ? document.requestedBy : undefined,
    errorMessage: typeof document.errorMessage === 'string' ? document.errorMessage : null
  };

  return researchRequestSchema.parse(request);
}
