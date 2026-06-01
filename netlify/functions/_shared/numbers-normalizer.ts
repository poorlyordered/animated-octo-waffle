import type {
  NumbersFollowUpCandidate,
  NumbersMetric,
  NumbersMetricSeverity,
  NumbersMetricTrend,
  NumbersProvenance,
  NumbersSection,
  NumbersSectionKey,
  NumbersSectionStatus,
  NumbersSnapshot
} from '../../../packages/contracts/src/index';
import {
  numbersMetricSeverities,
  numbersMetricTrends,
  numbersSectionKeys,
  numbersSectionStatuses,
  numbersSnapshotSchema
} from '../../../packages/contracts/src/index';

export type NumbersDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
  sections?: unknown;
  provenance?: Record<string, unknown>;
};

const sectionLabels: Record<NumbersSectionKey, string> = {
  wallet: 'Wallet',
  assets: 'Assets',
  logistics: 'Logistics',
  market: 'Market',
  activity: 'Activity'
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

function optionalIsoDate(value: unknown): string | undefined {
  return value ? isoDate(value) : undefined;
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeStatus(value: unknown, fallback: NumbersSectionStatus = 'healthy'): NumbersSectionStatus {
  return numbersSectionStatuses.includes(value as NumbersSectionStatus) ? (value as NumbersSectionStatus) : fallback;
}

function normalizeTrend(value: unknown): NumbersMetricTrend | undefined {
  return numbersMetricTrends.includes(value as NumbersMetricTrend) ? (value as NumbersMetricTrend) : undefined;
}

function normalizeSeverity(value: unknown): NumbersMetricSeverity | undefined {
  return numbersMetricSeverities.includes(value as NumbersMetricSeverity) ? (value as NumbersMetricSeverity) : undefined;
}

function normalizeMetric(value: unknown): NumbersMetric | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const label = stringValue(record.label);
  const metricValue = stringValue(record.value);

  if (!label || !metricValue) {
    return null;
  }

  return {
    label,
    value: metricValue,
    unit: typeof record.unit === 'string' ? record.unit : undefined,
    trend: normalizeTrend(record.trend),
    severity: normalizeSeverity(record.severity)
  };
}

function normalizeSection(key: NumbersSectionKey, value: unknown): NumbersSection {
  if (!value || typeof value !== 'object') {
    return missingSection(key);
  }

  const record = value as Record<string, unknown>;
  const status = normalizeStatus(record.status);
  const metrics = Array.isArray(record.metrics) ? record.metrics.flatMap((item) => normalizeMetric(item) ?? []) : [];
  const staleReason = typeof record.staleReason === 'string' ? record.staleReason : undefined;
  const missingReason = typeof record.missingReason === 'string' ? record.missingReason : undefined;

  if (status === 'missing') {
    return {
      key,
      label: stringValue(record.label, sectionLabels[key]),
      status,
      summary: stringValue(record.summary, `${sectionLabels[key]} data is missing.`),
      metrics: [],
      missingReason: missingReason ?? `${sectionLabels[key]} data is not available in the processed snapshot.`
    };
  }

  if (status === 'stale') {
    return {
      key,
      label: stringValue(record.label, sectionLabels[key]),
      status,
      summary: stringValue(record.summary, `${sectionLabels[key]} data is stale.`),
      metrics,
      updatedAt: optionalIsoDate(record.updatedAt),
      staleReason: staleReason ?? `${sectionLabels[key]} data is older than the accepted freshness window.`
    };
  }

  return {
    key,
    label: stringValue(record.label, sectionLabels[key]),
    status,
    summary: stringValue(record.summary, `${sectionLabels[key]} data is available.`),
    metrics,
    updatedAt: optionalIsoDate(record.updatedAt)
  };
}

function missingSection(key: NumbersSectionKey): NumbersSection {
  return {
    key,
    label: sectionLabels[key],
    status: 'missing',
    summary: `${sectionLabels[key]} data is missing.`,
    metrics: [],
    missingReason: `${sectionLabels[key]} data is not available in the processed snapshot.`
  };
}

function sectionRecord(document: NumbersDocument): Record<string, unknown> {
  return document.sections && typeof document.sections === 'object' ? (document.sections as Record<string, unknown>) : {};
}

function sourceReferences(value: unknown): NumbersProvenance['sourceReferences'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title : undefined;

    if (!title) {
      return [];
    }

    const reference: NumbersProvenance['sourceReferences'][number] = { title };
    if (typeof record.url === 'string') {
      reference.url = record.url;
    }
    if (typeof record.sourceId === 'string') {
      reference.sourceId = record.sourceId;
    }

    return [reference];
  });
}

function normalizeProvenance(document: NumbersDocument): NumbersProvenance {
  const provenance = document.provenance ?? {};
  const confidence =
    typeof provenance.confidence === 'number' ? Math.min(Math.max(provenance.confidence, 0), 1) : undefined;

  return {
    sourceCount: Math.max(0, Math.trunc(typeof provenance.sourceCount === 'number' ? provenance.sourceCount : 0)),
    sourceReferences: sourceReferences(provenance.sourceReferences),
    confidence,
    model: typeof provenance.model === 'string' ? provenance.model : undefined,
    promptVersion: typeof provenance.promptVersion === 'string' ? provenance.promptVersion : undefined,
    createdAt: isoDate(provenance.createdAt ?? document.createdAt)
  };
}

function normalizeFollowUps(value: unknown): NumbersFollowUpCandidate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const title = stringValue(record.title);
    const rationale = stringValue(record.rationale);

    if (!title || !rationale) {
      return [];
    }

    const relatedSection = numbersSectionKeys.includes(record.relatedSection as NumbersSectionKey)
      ? (record.relatedSection as NumbersSectionKey)
      : undefined;

    return [
      {
        id: stringValue(record.id, `numbers-follow-up-${index + 1}`),
        title,
        rationale,
        suggestedPath: record.suggestedPath === 'queue' ? 'queue' : 'decision',
        isPlayerImpacting: typeof record.isPlayerImpacting === 'boolean' ? record.isPlayerImpacting : false,
        relatedSection
      } satisfies NumbersFollowUpCandidate
    ];
  });
}

export function normalizeNumbersDocument(document: NumbersDocument): NumbersSnapshot {
  const sections = sectionRecord(document);
  const createdAt = isoDate(document.createdAt);
  const updatedAt = isoDate(document.updatedAt ?? document.createdAt);

  return numbersSnapshotSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: stringValue(document.corporationId),
    focus: stringValue(document.focus, 'corporation'),
    sections: numbersSectionKeys.map((key) => normalizeSection(key, sections[key])),
    observations: stringArray(document.observations),
    risks: stringArray(document.risks),
    opportunities: stringArray(document.opportunities),
    followUps: normalizeFollowUps(document.followUps),
    provenance: normalizeProvenance(document),
    coverage: document.coverage && typeof document.coverage === 'object' ? document.coverage : undefined,
    createdAt,
    updatedAt
  });
}
