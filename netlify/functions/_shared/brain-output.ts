import { ObjectId } from 'mongodb';
import {
  brainModelOutputSchema,
  brainPromptVersion,
  defaultBrainFocus,
  type BrainModelOutput,
  type CommandBrief
} from '../../../packages/contracts/src/index';

export const brainOutputJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'executiveSummary',
    'briefMarkdown',
    'strategicImpacts',
    'recommendedActions',
    'watchlist',
    'memory',
    'missingData',
    'confidence',
    'coverage',
    'draftOrders',
    'sourceReferences'
  ],
  properties: {
    executiveSummary: { type: 'string', minLength: 1, maxLength: 3000 },
    briefMarkdown: { type: 'string', minLength: 1, maxLength: 12000 },
    strategicImpacts: { type: 'array', maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 1000 } },
    recommendedActions: { type: 'array', maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 1000 } },
    watchlist: { type: 'array', maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 1000 } },
    memory: { type: 'array', maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 1000 } },
    missingData: { type: 'array', maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 500 } },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    coverage: {
      type: 'object',
      additionalProperties: false,
      required: ['numbers', 'opportunity', 'people', 'missingReasons'],
      properties: {
        numbers: { type: 'string', enum: ['present', 'missing', 'stale'] },
        opportunity: { type: 'string', enum: ['present', 'missing', 'stale'] },
        people: { type: 'string', enum: ['present', 'missing', 'stale'] },
        missingReasons: { type: 'array', items: { type: 'string' } }
      }
    },
    draftOrders: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'rationale', 'approvalRequired'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          rationale: { type: 'string', minLength: 1, maxLength: 1000 },
          approvalRequired: { type: 'boolean', const: true }
        }
      }
    },
    sourceReferences: {
      type: 'array',
      maxItems: 20,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1 },
          url: { type: 'string' },
          sourceId: { type: 'string' }
        }
      }
    }
  }
} as const;

const unsafeExecutionKeys = ['dispatchTarget', 'execute', 'executedAt', 'accessToken', 'refreshToken', 'secret', 'sealed'];

export function parseBrainModelOutput(rawContent: string): BrainModelOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('Brain model output was not valid JSON');
  }

  if (containsUnsafeExecutionKey(parsed)) {
    throw new Error('Brain model output contained unsafe execution fields');
  }

  return brainModelOutputSchema.parse(parsed);
}

function containsUnsafeExecutionKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsUnsafeExecutionKey);
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) =>
      unsafeExecutionKeys.some((unsafeKey) => key.toLowerCase() === unsafeKey.toLowerCase()) || containsUnsafeExecutionKey(nested)
  );
}

export function brainOutputToCommandBriefDocument(input: {
  output: BrainModelOutput;
  corporationId: string;
  focus?: string;
  model: string;
  provider: string;
  createdAt: Date;
  sourceReferences?: CommandBrief['sourceReferences'];
}) {
  const id = new ObjectId();
  const sourceReferences = mergeSourceReferences(input.output.sourceReferences, input.sourceReferences ?? []);

  return {
    _id: id,
    id: id.toHexString(),
    corporationId: input.corporationId,
    focus: input.focus ?? defaultBrainFocus,
    provider: input.provider,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    model: input.model,
    promptVersion: brainPromptVersion,
    sourceCount: sourceReferences.length,
    sourceReferences,
    confidence: input.output.confidence,
    executiveSummary: input.output.executiveSummary,
    briefMarkdown: input.output.briefMarkdown,
    strategicImpacts: input.output.strategicImpacts,
    recommendedActions: [
      ...input.output.recommendedActions,
      ...input.output.draftOrders.map((order) => `Draft order requiring commander approval: ${order.title} - ${order.rationale}`)
    ],
    watchlist: input.output.watchlist,
    memory: [...input.output.memory, ...input.output.missingData.map((item) => `Missing data: ${item}`)],
    coverage: input.output.coverage
  };
}

function mergeSourceReferences(
  left: CommandBrief['sourceReferences'],
  right: CommandBrief['sourceReferences']
): CommandBrief['sourceReferences'] {
  const seen = new Set<string>();
  const merged: CommandBrief['sourceReferences'] = [];

  for (const source of [...left, ...right]) {
    const key = `${source.title}|${source.url ?? ''}|${source.sourceId ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(source);
    }
  }

  return merged.slice(0, 20);
}
