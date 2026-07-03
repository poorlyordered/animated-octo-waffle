import {
  createDecisionFromCommanderChatRequestSchema,
  sendCommanderChatMessageRequestSchema
} from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { buildCommanderChatContext } from './_shared/commander-chat-context';
import {
  buildDeterministicCommanderChatResponse,
  runCommanderChat
} from './_shared/commander-chat-openrouter';
import {
  assertNoUnsafeCommanderChatMaterial,
  commanderChatBoundary,
  UnsafeCommanderChatError
} from './_shared/commander-chat-output';
import {
  appendCommanderChatMessage,
  commanderChatListPayload,
  ensureCommanderChatSession,
  findCommanderChatMessage,
  findCommanderChatSession,
  listCommanderChatMessages,
  listCommanderChatSessions
} from './_shared/commander-chat-store';
import { createDecisionRecordFromCommanderChatDraft } from './_shared/decision-record-store';
import { readCommanderChatEnv } from './_shared/env';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }
  return JSON.parse(event.body);
}

function commanderFromScope(scope: ReturnType<typeof getAuthScope>): string {
  return scope.source === 'session'
    ? `session:${scope.session?.characterName ?? scope.session?.characterId ?? 'commander'}`
    : `command-scope:${scope.corporationId}`;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const path = event.path ?? '';
    const scope = getAuthScope(event);
    if (scope.source !== 'session') {
      return safeErrorResponse('Signed EVE session is required', 401);
    }

    const db = await getMongoDb();
    const decisionMatch = path.match(/\/commander-chat\/([^/]+)\/decisions$/);
    const detailMatch = path.match(/\/commander-chat\/([^/]+)$/);

    if (method === 'GET' && detailMatch) {
      const sessionId = decodeURIComponent(detailMatch[1]);
      const session = await findCommanderChatSession(db, scope.corporationId, sessionId);
      if (!session) {
        return safeErrorResponse('Commander chat session not found', 404);
      }
      const messages = await listCommanderChatMessages(db, scope.corporationId, session.id);
      return jsonResponse(200, { session, messages, boundary: commanderChatBoundary });
    }

    if (method === 'GET') {
      return jsonResponse(200, commanderChatListPayload(await listCommanderChatSessions(db, scope.corporationId)));
    }

    if (method === 'POST' && decisionMatch) {
      const sessionId = decodeURIComponent(decisionMatch[1]);
      const requestBody = parseJsonBody(event);
      assertNoUnsafeCommanderChatMaterial(requestBody);
      const request = createDecisionFromCommanderChatRequestSchema.parse(requestBody);
      const session = await findCommanderChatSession(db, scope.corporationId, sessionId);
      if (!session) {
        return safeErrorResponse('Commander chat session not found', 404);
      }
      const message = await findCommanderChatMessage(db, scope.corporationId, session.id, request.messageId);
      const draft = message?.metadata?.draftDecision;
      if (!message || message.role !== 'assistant' || !draft || draft.id !== request.draftDecisionId) {
        return safeErrorResponse('Commander chat draft decision not found', 404);
      }
      const result = await createDecisionRecordFromCommanderChatDraft(
        db,
        scope.corporationId,
        session.id,
        message,
        draft,
        request.commanderNote
      );
      return jsonResponse(result.duplicate ? 200 : 201, {
        ...result,
        boundary: commanderChatBoundary
      });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const requestBody = parseJsonBody(event);
    assertNoUnsafeCommanderChatMaterial(requestBody);
    const request = sendCommanderChatMessageRequestSchema.parse(requestBody);
    const env = readCommanderChatEnv();
    const session = await ensureCommanderChatSession({
      db,
      corporationId: scope.corporationId,
      commander: commanderFromScope(scope),
      sessionId: request.sessionId,
      firstMessage: request.message
    });
    const userMessage = await appendCommanderChatMessage({
      db,
      corporationId: scope.corporationId,
      sessionId: session.id,
      role: 'user',
      content: request.message
    });
    const history = await listCommanderChatMessages(db, scope.corporationId, session.id);
    const context = await buildCommanderChatContext({ db, corporationId: scope.corporationId, history, env });
    const generated = process.env.COMMANDER_CHAT_TEST_MODE === 'deterministic'
      ? buildDeterministicCommanderChatResponse({ env, context, message: request.message })
      : await runCommanderChat({ env, context, message: request.message });
    const assistantMessage = await appendCommanderChatMessage({
      db,
      corporationId: scope.corporationId,
      sessionId: session.id,
      role: 'assistant',
      content: generated.content,
      metadata: generated.metadata
    });
    const updatedSession = (await findCommanderChatSession(db, scope.corporationId, session.id)) ?? session;
    const messages = [...history.filter((message) => message.id !== userMessage.id), userMessage, assistantMessage];

    return jsonResponse(201, {
      session: updatedSession,
      messages,
      assistantMessage,
      boundary: commanderChatBoundary
    });
  } catch (error) {
    const authResponse = authScopeErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }
    if (error instanceof UnsafeCommanderChatError) {
      return safeErrorResponse(error.message, 400);
    }
    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Commander chat request is invalid', 400);
    }
    if (error instanceof Error && error.message === 'OPENROUTER_API_KEY is required') {
      return safeErrorResponse('Commander chat provider is not configured', 502);
    }
    return safeErrorResponse('Unable to process commander chat request');
  }
}
