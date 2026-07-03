import type {
  CommanderChatAssistantMetadata,
  CommanderChatCitation,
  CommanderChatDraftDecision
} from '../../../packages/contracts/src/index';
import { commanderChatAssistantMetadataSchema } from '../../../packages/contracts/src/index';

export const commanderChatBoundary =
  'Commander Chat is advisory only. It can cite command data and draft proposed decisions, but it does not dispatch workers, create queued work from assistant text, fetch ESI, write to EVE, mutate roles/access/standings, move wallets/assets/contracts, deploy, roll back, or mutate external services.';

const unsafeKeyPattern =
  /(secret|token|cookie|jwt|password|connection.?string|uri|access.?key|private.?key|refresh.?token|bearer|credential|sealed|raw.?payload|dispatch|execute|eve.?write|wallet.?move|asset.?move|contract.?move|role.?change|standing|deploy|rollback)/i;
const unsafeValuePattern =
  /(mongodb(\+srv)?:\/\/|postgres(ql)?:\/\/|mysql:\/\/|Bearer\s+[A-Za-z0-9._-]+|eyJ[A-Za-z0-9_-]{10,}|BEGIN\s+(RSA|OPENSSH|PRIVATE)\s+KEY|client_secret|refresh_token|access_token)/i;

export class UnsafeCommanderChatError extends Error {
  constructor(message = 'Commander chat cannot include secrets, raw payloads, execution handles, or mutation intents') {
    super(message);
  }
}

export interface ParsedCommanderChatOutput {
  answer: string;
  citations: CommanderChatCitation[];
  missingData: string[];
  confidence?: number;
  warnings: string[];
  draftDecision?: Omit<CommanderChatDraftDecision, 'id' | 'boundary'> & { id?: string };
}

export function assertNoUnsafeCommanderChatMaterial(value: unknown, path = 'request'): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoUnsafeCommanderChatMaterial(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      if (unsafeKeyPattern.test(key)) {
        throw new UnsafeCommanderChatError(`Commander chat field "${path}.${key}" is not allowed`);
      }
      assertNoUnsafeCommanderChatMaterial(child, `${path}.${key}`);
    });
    return;
  }

  if (typeof value === 'string' && (unsafeValuePattern.test(value) || containsUrlUserinfo(value))) {
    throw new UnsafeCommanderChatError(`Commander chat field "${path}" contains unsafe value material`);
  }
}

export function parseCommanderChatModelOutput(raw: string): ParsedCommanderChatOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { answer: raw };
  }

  assertNoUnsafeCommanderChatMaterial(parsed, 'assistant');
  const record = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  const answer = stringValue(record.answer, raw).trim();
  const citations = citationArray(record.citations);
  const missingData = stringArray(record.missingData, 20, 500);
  const warnings = stringArray(record.warnings, 20, 500);
  const confidence = typeof record.confidence === 'number' && Number.isFinite(record.confidence)
    ? Math.min(Math.max(record.confidence, 0), 1)
    : undefined;
  const draftDecision = draftDecisionValue(record.draftDecision);

  return {
    answer: answer || 'No commander-chat answer was produced.',
    citations,
    missingData: citations.length === 0 && missingData.length === 0 ? ['No command source citation was available.'] : missingData,
    confidence,
    warnings,
    draftDecision
  };
}

export function buildCommanderChatMetadata(input: {
  parsed: ParsedCommanderChatOutput;
  promptVersion: string;
  provider: string;
  model: string;
  finishReason?: string;
}): CommanderChatAssistantMetadata {
  const metadata: CommanderChatAssistantMetadata = {
    promptVersion: input.promptVersion,
    provider: input.provider,
    model: input.model,
    citations: input.parsed.citations,
    confidence: input.parsed.confidence,
    missingData: input.parsed.missingData,
    draftDecision: input.parsed.draftDecision
      ? {
          ...input.parsed.draftDecision,
          id: input.parsed.draftDecision.id ?? stableDraftId(input.parsed.draftDecision.title),
          boundary: commanderChatBoundary
        }
      : undefined,
    boundary: commanderChatBoundary,
    finishReason: input.finishReason,
    warnings: input.parsed.warnings
  };

  return commanderChatAssistantMetadataSchema.parse(metadata);
}

function citationArray(value: unknown): CommanderChatCitation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const record = item as Record<string, unknown>;
    const label = stringValue(record.label).trim();
    const summary = stringValue(record.summary).trim();
    const sourceType = stringValue(record.sourceType, 'missing_data');
    if (!label || !summary) {
      return [];
    }
    return [
      {
        sourceType: isSourceType(sourceType) ? sourceType : 'missing_data',
        sourceId: stringValue(record.sourceId) || undefined,
        label: label.slice(0, 160),
        summary: summary.slice(0, 1000),
        createdAt: isoString(record.createdAt),
        freshness: isFreshness(record.freshness) ? record.freshness : 'unknown'
      }
    ];
  }).slice(0, 20);
}

function draftDecisionValue(value: unknown): ParsedCommanderChatOutput['draftDecision'] {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const title = stringValue(record.title).trim();
  const rationale = stringValue(record.rationale).trim();
  const expectedResult = stringValue(record.expectedResult).trim();
  if (!title || !rationale || !expectedResult) {
    return undefined;
  }
  return {
    id: stringValue(record.id) || undefined,
    title: title.slice(0, 160),
    rationale: rationale.slice(0, 1000),
    expectedResult: expectedResult.slice(0, 1000),
    sourceContext: stringValue(record.sourceContext, 'Commander chat draft decision').slice(0, 1000),
    playerImpacting: Boolean(record.playerImpacting),
    approvalRequired: record.approvalRequired !== false,
    citationIds: Array.isArray(record.citationIds)
      ? record.citationIds.flatMap((item) => (typeof item === 'string' && item.trim() ? [item.trim().slice(0, 200)] : [])).slice(0, 12)
      : []
  };
}

function stringArray(value: unknown, limit: number, maxLength: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => (typeof item === 'string' && item.trim() ? [item.trim().slice(0, maxLength)] : [])).slice(0, limit);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function isoString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function containsUrlUserinfo(value: string): boolean {
  const urlMatches = value.match(/[a-z][a-z0-9+.-]*:\/\/[^\s<>"']+/gi) ?? [];
  return urlMatches.some((candidate) => {
    try {
      const url = new URL(candidate);
      return Boolean(url.username || url.password);
    } catch {
      return false;
    }
  });
}

function isSourceType(value: string): value is CommanderChatCitation['sourceType'] {
  return [
    'command_brief',
    'intelligence_refresh_run',
    'numbers_snapshot',
    'opportunity',
    'people',
    'decision_record',
    'automation_queue',
    'operations_health',
    'production_evidence',
    'missing_data'
  ].includes(value);
}

function isFreshness(value: unknown): value is CommanderChatCitation['freshness'] {
  return value === 'current' || value === 'stale' || value === 'missing' || value === 'unknown';
}

function stableDraftId(title: string): string {
  return `draft-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'decision'}`;
}
