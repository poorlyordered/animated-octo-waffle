import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import type { CommanderChatAssistantMetadata } from '../../../packages/contracts/src/index';
import type { CommanderChatContext } from './commander-chat-context';
import {
  buildCommanderChatMetadata,
  commanderChatBoundary,
  parseCommanderChatModelOutput
} from './commander-chat-output';
import type { CommanderChatEnv } from './env';

export interface CommanderChatGeneration {
  content: string;
  metadata: CommanderChatAssistantMetadata;
}

export async function runCommanderChat(input: {
  env: CommanderChatEnv;
  context: CommanderChatContext;
  message: string;
}): Promise<CommanderChatGeneration> {
  const openrouter = createOpenRouter({
    apiKey: input.env.apiKey,
    baseURL: input.env.baseUrl
  });

  const result = await streamText({
    model: openrouter.chat(input.env.model),
    system: input.env.systemPrompt,
    prompt: buildPrompt(input.context, input.message),
    maxOutputTokens: input.env.maxCompletionTokens
  });

  const text = await result.text;
  const parsed = parseCommanderChatModelOutput(text);
  const metadata = buildCommanderChatMetadata({
    parsed: parsed.citations.length > 0 ? parsed : { ...parsed, citations: input.context.citations },
    promptVersion: input.env.promptVersion,
    provider: 'openrouter',
    model: input.env.model,
    finishReason: await result.finishReason
  });

  return {
    content: parsed.answer,
    metadata
  };
}

export function buildDeterministicCommanderChatResponse(input: {
  env: Pick<CommanderChatEnv, 'promptVersion' | 'model'>;
  context: CommanderChatContext;
  message: string;
}): CommanderChatGeneration {
  const wantsDecision = /draft|decision|decide|recommend/i.test(input.message);
  const firstCitation = input.context.citations[0];
  const parsed = {
    answer: `Based on current command context: ${input.context.summary.split('\n')[0] ?? 'no command context is available.'}`,
    citations: input.context.citations,
    missingData: input.context.citations.some((citation) => citation.sourceType === 'missing_data')
      ? ['Command context is incomplete.']
      : [],
    confidence: firstCitation?.freshness === 'current' ? 0.74 : 0.45,
    warnings: [],
    draftDecision: wantsDecision
      ? {
          title: 'Review latest command recommendation',
          rationale: 'Commander Chat identified a reviewable recommendation from cited command context.',
          expectedResult: 'Commander reviews the recommendation and decides whether to approve follow-up planning.',
          sourceContext: firstCitation?.label ?? 'Commander Chat',
          playerImpacting: true,
          approvalRequired: true,
          citationIds: firstCitation?.sourceId ? [firstCitation.sourceId] : []
        }
      : undefined
  };

  return {
    content: parsed.answer,
    metadata: buildCommanderChatMetadata({
      parsed,
      promptVersion: input.env.promptVersion,
      provider: 'deterministic',
      model: input.env.model,
      finishReason: 'stop'
    })
  };
}

function buildPrompt(context: CommanderChatContext, message: string): string {
  return [
    'Command context:',
    context.summary,
    '',
    'Recent chat history:',
    JSON.stringify(context.history),
    '',
    'Commander message:',
    message,
    '',
    'Return JSON only. Include citations using the provided source labels and ids. Include draftDecision only when useful.',
    `Boundary: ${commanderChatBoundary}`
  ].join('\n');
}
