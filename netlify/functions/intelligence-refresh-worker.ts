import {
  defaultBrainFocus,
  intelligenceRefreshDomainSchema,
  intelligenceRefreshWorkerClaimRequestSchema,
  intelligenceRefreshWorkerCompleteRequestSchema,
  intelligenceRefreshWorkerEvaluateRequestSchema,
  intelligenceRefreshWorkerFailRequestSchema,
  intelligenceRefreshWorkerSkipRequestSchema
} from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { buildBrainPromptContext } from './_shared/brain-context';
import { runOpenRouterBrain } from './_shared/brain-openrouter';
import { brainOutputToCommandBriefDocument } from './_shared/brain-output';
import { brainRunSummary, completeBrainRun, createBrainRun, failBrainRun } from './_shared/brain-store';
import { assertSafeRefreshWorkerResult } from './_shared/intelligence-refresh-rules';
import {
  claimRefreshStep,
  completeRefreshEvaluation,
  completeRefreshStep,
  failRefreshEvaluation,
  failRefreshStep,
  findRefreshRun,
  listClaimableRefreshSteps,
  markRefreshEvaluationRunning,
  skipRefreshStep
} from './_shared/intelligence-refresh-store';
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
  let refreshRunId: string | null = null;
  let brainRunId: string | null = null;

  try {
    assertWorkerCallbackAuthorized(event, 'intelligence_refresh');

    const method = event.httpMethod ?? 'GET';
    const path = event.path ?? '';
    const db = await getMongoDb();

    if (method === 'GET') {
      const domainParam = event.queryStringParameters?.domain;
      const domain = domainParam ? intelligenceRefreshDomainSchema.parse(domainParam) : undefined;
      const steps = await listClaimableRefreshSteps(db, domain);
      return jsonResponse(200, { steps });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const stepMatch = path.match(/\/intelligence-refresh-worker\/([^/]+)\/steps\/([^/]+)\/(claim|complete|fail|skip)$/);
    if (stepMatch) {
      const [, encodedRunId, encodedStepId, action] = stepMatch;
      const runId = decodeURIComponent(encodedRunId);
      const stepId = decodeURIComponent(encodedStepId);
      const body = parseJsonBody(event);

      if (action === 'claim') {
        const request = intelligenceRefreshWorkerClaimRequestSchema.parse(body);
        const run = await claimRefreshStep(db, runId, stepId, request.workerId);
        return run ? jsonResponse(200, { run }) : safeErrorResponse('Refresh step is not claimable', 409);
      }

      if (action === 'complete') {
        const request = intelligenceRefreshWorkerCompleteRequestSchema.parse(body);
        assertSafeRefreshWorkerResult(request.result);
        const run = await completeRefreshStep(db, runId, stepId, request.workerId, request.result);
        return run ? jsonResponse(200, { run }) : safeErrorResponse('Refresh step is not completable by this worker', 409);
      }

      if (action === 'fail') {
        const request = intelligenceRefreshWorkerFailRequestSchema.parse(body);
        const run = await failRefreshStep(db, runId, stepId, request.workerId, request.reason);
        return run ? jsonResponse(200, { run }) : safeErrorResponse('Refresh step is not failable by this worker', 409);
      }

      const request = intelligenceRefreshWorkerSkipRequestSchema.parse(body);
      const run = await skipRefreshStep(db, runId, stepId, request.workerId, request.reason);
      return run ? jsonResponse(200, { run }) : safeErrorResponse('Refresh step is not skippable by this worker', 409);
    }

    const evaluateMatch = path.match(/\/intelligence-refresh-worker\/([^/]+)\/evaluate$/);
    if (evaluateMatch) {
      const requestedRefreshRunId = decodeURIComponent(evaluateMatch[1]);
      const request = intelligenceRefreshWorkerEvaluateRequestSchema.parse(parseJsonBody(event));
      const runningRun = await markRefreshEvaluationRunning(
        db,
        requestedRefreshRunId,
        request.workerId,
        request.allowPartial ?? true,
        request.reason
      );
      if (!runningRun) {
        return safeErrorResponse('Refresh run is not ready for evaluation', 409);
      }
      refreshRunId = runningRun.id;

      const brainRun = await createBrainRun(db, {
        corporationId: runningRun.corporationId,
        focus: defaultBrainFocus,
        workerId: request.workerId,
        reason: request.reason,
        refreshRunId: runningRun.id
      });
      brainRunId = brainRun.id;

      const context = await buildBrainPromptContext(db, runningRun.corporationId, defaultBrainFocus);
      const providerResult = await runOpenRouterBrain(context);
      const createdAt = new Date();
      const briefDocument = brainOutputToCommandBriefDocument({
        output: providerResult.output,
        corporationId: runningRun.corporationId,
        focus: defaultBrainFocus,
        model: providerResult.model,
        provider: providerResult.provider,
        createdAt,
        sourceReferences: context.sourceReferences,
        refreshRunId: runningRun.id,
        refreshSourceSummary: runningRun.evaluation.sourceSummary
      });
      const completedBrainRun = await completeBrainRun(db, brainRun.id, {
        model: providerResult.model,
        briefDocument,
        now: createdAt
      });
      const completedRefreshRun = await completeRefreshEvaluation(db, runningRun.id, {
        brainRunId: brainRun.id,
        commandBriefId: String(briefDocument.id),
        model: providerResult.model,
        provider: providerResult.provider,
        promptVersion: String(briefDocument.promptVersion),
        confidence: Number(briefDocument.confidence)
      });

      return jsonResponse(201, {
        run: completedRefreshRun ?? (await findRefreshRun(db, runningRun.id)),
        brainRun: completedBrainRun ?? brainRunSummary(brainRun),
        brief: {
          id: String(briefDocument.id),
          focus: String(briefDocument.focus),
          model: String(briefDocument.model),
          promptVersion: String(briefDocument.promptVersion),
          refreshRunId: String(briefDocument.refreshRunId)
        }
      });
    }

    return safeErrorResponse('Worker route not found', 404);
  } catch (error) {
    if (refreshRunId) {
      try {
        const db = await getMongoDb();
        await failRefreshEvaluation(db, refreshRunId, error instanceof Error ? error.message : 'Refresh evaluation failed');
      } catch {
        // Preserve the original safe outward error.
      }
    }

    if (brainRunId) {
      try {
        const db = await getMongoDb();
        await failBrainRun(db, brainRunId, error instanceof Error ? error.message : 'Brain run failed');
      } catch {
        // Preserve the original safe outward error.
      }
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'Worker callback is not authorized') {
      return safeErrorResponse('Worker callback is not authorized', 401);
    }

    if (error instanceof Error && error.message === 'Unsafe intelligence refresh field rejected') {
      return safeErrorResponse('Unsafe intelligence refresh field rejected', 400);
    }

    if (error instanceof Error && error.message === 'OPENROUTER_API_KEY is required') {
      return safeErrorResponse('Brain provider is not configured', 500);
    }

    if (error instanceof Error && error.message === 'OPENROUTER_BASE_URL must start with https://') {
      return safeErrorResponse('Brain provider configuration is invalid', 500);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Intelligence refresh worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process intelligence refresh worker request');
  }
}
