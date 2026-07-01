import type { BrainModelOutput } from '../../../packages/contracts/src/index';
import { brainPromptVersion } from '../../../packages/contracts/src/index';
import { readOpenRouterEnv, type OpenRouterEnv } from './env';
import { brainOutputJsonSchema, parseBrainModelOutput } from './brain-output';
import type { BrainPromptContext } from './brain-context';
import { buildBrainMessages } from './brain-context';

interface OpenRouterChoice {
  message?: {
    content?: string;
  };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  model?: string;
}

export interface BrainProviderResult {
  output: BrainModelOutput;
  model: string;
  provider: 'openrouter';
  promptVersion: string;
}

export async function runOpenRouterBrain(
  context: BrainPromptContext,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch
): Promise<BrainProviderResult> {
  const config = readOpenRouterEnv(env);
  const response = await fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
    config,
    context,
    fetchImpl
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Brain provider returned an empty response');
  }

  return {
    output: parseBrainModelOutput(content),
    model: response.model ?? config.model,
    provider: 'openrouter',
    promptVersion: brainPromptVersion
  };
}

async function fetchWithTimeout(input: string, options: { config: OpenRouterEnv; context: BrainPromptContext; fetchImpl: typeof fetch }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.config.timeoutMs);

  try {
    const response = await options.fetchImpl(input, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${options.config.apiKey}`,
        'content-type': 'application/json',
        ...(options.config.appUrl ? { 'HTTP-Referer': options.config.appUrl } : {}),
        ...(options.config.appTitle ? { 'X-OpenRouter-Title': options.config.appTitle } : {})
      },
      body: JSON.stringify({
        model: options.config.model,
        messages: buildBrainMessages(options.context),
        stream: false,
        max_completion_tokens: options.config.maxCompletionTokens,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'gryyk_47_brain_output',
            strict: true,
            schema: brainOutputJsonSchema
          }
        },
        provider: {
          require_parameters: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Brain provider request failed with status ${response.status}`);
    }

    return (await response.json()) as OpenRouterResponse;
  } finally {
    clearTimeout(timeout);
  }
}
