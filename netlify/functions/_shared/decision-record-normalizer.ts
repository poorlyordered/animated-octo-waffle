import type {
  CommandBrief,
  DecisionRecord,
  DecisionStatus,
  SourceProvenanceSnapshot
} from '../../../packages/contracts/src/index';
import { decisionRecordSchema, decisionStatuses } from '../../../packages/contracts/src/index';
import { normalizeCommandBriefDocument } from './command-brief-normalizer';
import { deriveOperatingLegCoverage } from './coverage';

export type DecisionDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
  sourceProvenance?: Record<string, unknown> | SourceProvenanceSnapshot;
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

function normalizeStatus(value: unknown): DecisionStatus {
  return decisionStatuses.includes(value as DecisionStatus) ? (value as DecisionStatus) : 'proposed';
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function boolValue(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

export function sourceProvenanceFromBrief(brief: CommandBrief): SourceProvenanceSnapshot {
  return {
    briefId: brief.id,
    briefCreatedAt: brief.createdAt,
    focus: brief.focus,
    model: brief.model,
    promptVersion: brief.promptVersion,
    confidence: brief.confidence,
    sourceCount: brief.sourceCount,
    sourceReferences: brief.sourceReferences,
    coverage: brief.coverage
  };
}

function normalizeSourceProvenance(document: DecisionDocument): SourceProvenanceSnapshot {
  const source = document.sourceProvenance ?? {};
  const sourceCount = typeof source.sourceCount === 'number' ? source.sourceCount : 0;

  return {
    briefId: stringValue(source.briefId, stringValue(document.sourceBriefId ?? document.researchBriefId, 'unknown')),
    briefCreatedAt: isoDate(source.briefCreatedAt ?? document.createdAt ?? document.timestamp),
    focus: stringValue(source.focus, 'unknown'),
    model: stringValue(source.model, 'unknown'),
    promptVersion: stringValue(source.promptVersion, 'unknown'),
    confidence: typeof source.confidence === 'number' ? Math.min(Math.max(source.confidence, 0), 1) : 0,
    sourceCount,
    sourceReferences: Array.isArray(source.sourceReferences) ? source.sourceReferences : [],
    coverage:
      source.coverage && typeof source.coverage === 'object'
        ? (source.coverage as SourceProvenanceSnapshot['coverage'])
        : deriveOperatingLegCoverage({
            sourceCount,
            strategicImpacts: [],
            recommendedActions: []
          })
  };
}

export function normalizeDecisionRecordDocument(document: DecisionDocument): DecisionRecord {
  const status = normalizeStatus(document.status);
  const createdAt = isoDate(document.createdAt ?? document.timestamp);
  const updatedAt = isoDate(document.updatedAt ?? document.createdAt ?? document.timestamp);
  const sourceBriefId = stringValue(document.sourceBriefId ?? document.researchBriefId, 'unknown');
  const sourceRecommendation = stringValue(
    document.sourceRecommendation ?? document.finalDecision ?? document.gryykSynthesis,
    'Existing strategic decision'
  );
  const rationale = stringValue(document.rationale ?? document.decisionContext, sourceRecommendation);
  const expectedResult = stringValue(document.expectedResult ?? document.finalDecision, sourceRecommendation);
  const statusHistory = Array.isArray(document.statusHistory)
    ? document.statusHistory
    : [
        {
          toStatus: status,
          changedAt: createdAt
        }
      ];

  return decisionRecordSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: String(document.corporationId ?? ''),
    sourceBriefId,
    sourceRecommendation,
    sourceProvenance: normalizeSourceProvenance(document),
    status,
    rationale,
    expectedResult,
    isPlayerImpacting: boolValue(document.isPlayerImpacting),
    approval: document.approval ?? null,
    statusHistory,
    createdAt,
    updatedAt
  });
}

export function normalizeSourceBriefDocument(document: Record<string, unknown>): CommandBrief {
  return normalizeCommandBriefDocument(document);
}
