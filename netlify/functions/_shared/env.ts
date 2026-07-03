export interface ServerEnv {
  mongodbUri: string;
  mongodbDb: string;
}

export interface ScopeEnv {
  corporationId: string;
  authorizedCorporationIds: string[];
}

export interface EsiTokenVaultEnv {
  sealingKey: string;
}

export interface OpenRouterEnv {
  apiKey: string;
  model: string;
  baseUrl: string;
  appUrl?: string;
  appTitle?: string;
  timeoutMs: number;
  maxCompletionTokens: number;
}

export interface CommanderChatEnv {
  apiKey: string;
  model: string;
  baseUrl: string;
  promptVersion: string;
  systemPrompt: string;
  appUrl?: string;
  appTitle?: string;
  timeoutMs: number;
  maxCompletionTokens: number;
  maxContextChars: number;
  maxHistoryMessages: number;
}

export function isProductionRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production' || env.CONTEXT === 'production';
}

export function readServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  const mongodbUri = env.MONGODB_URI;
  const mongodbDb = env.MONGODB_DB;

  if (!mongodbUri?.startsWith('mongodb://') && !mongodbUri?.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  if (!mongodbDb) {
    throw new Error('MONGODB_DB is required');
  }

  return { mongodbUri, mongodbDb };
}

export function readScopeEnv(env: NodeJS.ProcessEnv = process.env): ScopeEnv {
  const corporationId = env.EVEONLINE_CORPORATION_ID;

  if (!corporationId) {
    throw new Error('EVEONLINE_CORPORATION_ID is required');
  }

  const authorizedCorporationIds = uniqueNonEmpty([
    corporationId,
    ...csvValues(env.EVEONLINE_AUTHORIZED_CORPORATION_IDS)
  ]);

  return { corporationId, authorizedCorporationIds };
}

export function readEsiTokenVaultEnv(env: NodeJS.ProcessEnv = process.env): EsiTokenVaultEnv {
  const sealingKey = env.ESI_TOKEN_VAULT_SEALING_KEY;

  if (sealingKey) {
    return { sealingKey };
  }

  if (isProductionRuntime(env)) {
    throw new Error('ESI_TOKEN_VAULT_SEALING_KEY is required');
  }

  return { sealingKey: 'local-development-esi-token-vault-key' };
}

export function readOpenRouterEnv(env: NodeJS.ProcessEnv = process.env): OpenRouterEnv {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  const baseUrl = env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
  if (!baseUrl.startsWith('https://')) {
    throw new Error('OPENROUTER_BASE_URL must start with https://');
  }

  return {
    apiKey,
    model: env.OPENROUTER_MODEL ?? 'openai/gpt-5.2',
    baseUrl: baseUrl.replace(/\/$/, ''),
    appUrl: env.OPENROUTER_APP_URL,
    appTitle: env.OPENROUTER_APP_TITLE,
    timeoutMs: positiveInteger(env.OPENROUTER_TIMEOUT_MS, 45_000, 5_000, 55_000),
    maxCompletionTokens: positiveInteger(env.OPENROUTER_MAX_COMPLETION_TOKENS, 1_800, 256, 4_000)
  };
}

export function readCommanderChatEnv(env: NodeJS.ProcessEnv = process.env): CommanderChatEnv {
  const openRouter = readOpenRouterEnv(env);

  return {
    ...openRouter,
    model: env.COMMANDER_CHAT_MODEL ?? openRouter.model,
    promptVersion: env.COMMANDER_CHAT_PROMPT_VERSION ?? 'commander-chat/v1',
    systemPrompt: env.COMMANDER_CHAT_SYSTEM_PROMPT ?? defaultCommanderChatPrompt,
    timeoutMs: positiveInteger(env.COMMANDER_CHAT_TIMEOUT_MS, openRouter.timeoutMs, 5_000, 55_000),
    maxCompletionTokens: positiveInteger(
      env.COMMANDER_CHAT_MAX_COMPLETION_TOKENS,
      openRouter.maxCompletionTokens,
      256,
      4_000
    ),
    maxContextChars: positiveInteger(env.COMMANDER_CHAT_MAX_CONTEXT_CHARS, 12_000, 2_000, 40_000),
    maxHistoryMessages: positiveInteger(env.COMMANDER_CHAT_MAX_HISTORY_MESSAGES, 12, 2, 40)
  };
}

const defaultCommanderChatPrompt = [
  'You are the Gryyk-47 commander chat interface.',
  'Answer only from supplied command context and conversation history.',
  'Separate observations, recommendations, missing data, and draft decisions.',
  'Do not claim to execute EVE actions, dispatch workers, create queued work, fetch ESI, deploy, roll back, or mutate external services.',
  'When useful, include a draftDecision object, but it remains review-only until the commander explicitly creates a Decision Record.',
  'Return strict JSON with answer, citations, missingData, confidence, warnings, and optional draftDecision.'
].join(' ');

function positiveInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return parsed;
}

function csvValues(value: string | undefined): string[] {
  return value?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
