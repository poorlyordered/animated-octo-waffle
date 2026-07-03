import { brainWorkerRunRequestSchema, defaultBrainFocus } from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { buildBrainPromptContext } from './_shared/brain-context';
import { runOpenRouterBrain } from './_shared/brain-openrouter';
import { brainOutputToCommandBriefDocument } from './_shared/brain-output';
import { brainRunSummary, completeBrainRun, createBrainRun, failBrainRun } from './_shared/brain-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

export async function handler(event: FunctionEvent) {
  let runId: string | null = null;

  try {
    assertWorkerCallbackAuthorized(event, 'brain_worker');

    if ((event.httpMethod ?? 'GET') !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const request = brainWorkerRunRequestSchema.parse(parseJsonBody(event));
    const db = await getMongoDb();
    const run = await createBrainRun(db, request);
    runId = run.id;

    const context = await buildBrainPromptContext(db, request.corporationId, request.focus ?? defaultBrainFocus);
    const providerResult = await runOpenRouterBrain(context);
    const createdAt = new Date();
    const briefDocument = brainOutputToCommandBriefDocument({
      output: providerResult.output,
      corporationId: request.corporationId,
      focus: request.focus ?? defaultBrainFocus,
      model: providerResult.model,
      provider: providerResult.provider,
      createdAt,
      sourceReferences: context.sourceReferences,
      refreshRunId: request.refreshRunId
    });
    const completedRun = await completeBrainRun(db, run.id, {
      model: providerResult.model,
      briefDocument,
      now: createdAt
    });

    return jsonResponse(201, {
      run: completedRun ?? brainRunSummary(run),
      brief: {
        id: String(briefDocument.id),
        focus: String(briefDocument.focus),
        model: String(briefDocument.model),
        promptVersion: String(briefDocument.promptVersion)
      },
      message:
        'Brain run completed and stored as command intelligence. No EVE action, queue dispatch, worker dispatch, or external mutation was executed.'
    });
  } catch (error) {
    if (runId) {
      try {
        const db = await getMongoDb();
        await failBrainRun(db, runId, error instanceof Error ? error.message : 'Brain run failed');
      } catch {
        // Preserve the safe outward error from the original failure.
      }
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'Worker callback is not authorized') {
      return safeErrorResponse('Worker callback is not authorized', 401);
    }

    if (error instanceof Error && error.message === 'OPENROUTER_API_KEY is required') {
      return safeErrorResponse('Brain provider is not configured', 500);
    }

    if (error instanceof Error && error.message === 'OPENROUTER_BASE_URL must start with https://') {
      return safeErrorResponse('Brain provider configuration is invalid', 500);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Brain worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process Brain worker request');
  }
}
