import type { CommandBrief, SourceReference } from '../../../packages/contracts/src/index';
import { commandBriefSchema, defaultResearchFocus, operatingLegCoverageSchema } from '../../../packages/contracts/src/index';
import { withDerivedCoverage } from './coverage';

type BriefDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
  brief?: Record<string, unknown>;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function sourceReferences(value: unknown): SourceReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return { title: item };
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const title = typeof record.title === 'string' ? record.title : undefined;
        if (!title) {
          return null;
        }
        return {
          title,
          url: typeof record.url === 'string' ? record.url : undefined,
          sourceId: typeof record.sourceId === 'string' ? record.sourceId : undefined
        };
      }

      return null;
    })
    .filter((item): item is SourceReference => Boolean(item));
}

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

export function normalizeCommandBriefDocument(document: BriefDocument): CommandBrief {
  const nestedBrief = document.brief ?? {};
  const sourceRefs = sourceReferences(document.sourceReferences ?? nestedBrief.sourceReferences);
  const sourceCountValue = document.sourceCount ?? nestedBrief.sourceCount;
  const sourceCount =
    typeof sourceCountValue === 'number' ? sourceCountValue : Math.max(sourceRefs.length, 0);
  const confidenceValue = document.confidence ?? nestedBrief.confidence;
  const confidence = typeof confidenceValue === 'number' ? Math.min(Math.max(confidenceValue, 0), 1) : 0;
  const storedCoverage = operatingLegCoverageSchema.safeParse(document.coverage ?? nestedBrief.coverage);

  const brief = {
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: String(document.corporationId ?? ''),
    focus: String(document.focus ?? defaultResearchFocus),
    createdAt: isoDate(document.createdAt),
    model: String(document.model ?? nestedBrief.model ?? 'unknown'),
    promptVersion: String(document.promptVersion ?? nestedBrief.promptVersion ?? 'unknown'),
    sourceCount,
    sourceReferences: sourceRefs,
    confidence,
    executiveSummary: String(nestedBrief.executiveSummary ?? document.executiveSummary ?? ''),
    briefMarkdown: String(nestedBrief.briefMarkdown ?? document.briefMarkdown ?? ''),
    strategicImpacts: stringArray(nestedBrief.strategicImpacts ?? document.strategicImpacts),
    recommendedActions: stringArray(nestedBrief.recommendedActions ?? document.recommendedActions),
    watchlist: stringArray(nestedBrief.watchlist ?? document.watchlist),
    memory: stringArray(nestedBrief.memory ?? document.memory),
    ...(storedCoverage.success ? { coverage: storedCoverage.data } : {})
  };

  return commandBriefSchema.parse(storedCoverage.success ? brief : withDerivedCoverage(brief));
}
