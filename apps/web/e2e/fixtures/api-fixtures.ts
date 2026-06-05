import type { Page, Route } from '@playwright/test';
import type { RetryRequestSummary, SessionStateResponse } from '@gryyk/contracts';
import { commandSurfaceFixtures } from './command-surfaces';

async function json(route: Route, body: unknown) {
  await route.fulfill({
    body: JSON.stringify(body),
    contentType: 'application/json',
    status: 200
  });
}

export async function installCommandSurfaceApiFixtures(page: Page) {
  let workerHandoffRetryOverride: RetryRequestSummary | null = null;

  await page.route('**/api/eve-session**', (route) => {
    if (route.request().method() === 'POST') {
      return json(route, {
        signedIn: false,
        scopeSource: 'fallback',
        corporationId: '917701062'
      });
    }

    return json(route, {
      signedIn: false,
      scopeSource: 'fallback',
      corporationId: '917701062'
    });
  });

  await page.route('**/api/command-brief**', (route) => json(route, commandSurfaceFixtures.commandBrief));
  await page.route('**/api/research-status**', (route) => json(route, commandSurfaceFixtures.researchStatus));
  await page.route('**/api/numbers**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/decision/status')) {
      const body = route.request().postDataJSON() as { status?: string } | null;
      return json(
        route,
        body?.status === 'rejected'
          ? commandSurfaceFixtures.numbersFollowUpActions.rejectedStatus
          : commandSurfaceFixtures.numbersFollowUpActions.approvedStatus
      );
    }
    if (url.pathname.endsWith('/decision')) {
      const candidateId = decodeURIComponent(url.pathname.split('/').at(-2) ?? '');
      return json(
        route,
        candidateId === 'numbers-follow-up-2'
          ? commandSurfaceFixtures.numbersFollowUpActions.approvedDecision
          : commandSurfaceFixtures.numbersFollowUpActions.decision
      );
    }
    if (url.pathname.endsWith('/queue')) {
      return json(route, commandSurfaceFixtures.numbersFollowUpActions.queue);
    }

    return json(route, commandSurfaceFixtures.numbers);
  });

  let esiSyncStatus = commandSurfaceFixtures.esiSync.active;
  let esiSyncRetryOverride: RetryRequestSummary | null = null;
  let preparedOnce = false;
  await page.route('**/api/esi-sync/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/consent/start')) {
      esiSyncStatus = commandSurfaceFixtures.esiSync.active;
      return json(route, commandSurfaceFixtures.esiSync.startConsent);
    }

    if (url.pathname.endsWith('/revoke')) {
      esiSyncStatus = {
        ...commandSurfaceFixtures.esiSync.active,
        vault: commandSurfaceFixtures.esiSync.revoke.vault,
        domains: commandSurfaceFixtures.esiSync.missing.domains
      };
      return json(route, commandSurfaceFixtures.esiSync.revoke);
    }

    if (url.pathname.endsWith('/prepare')) {
      const response = preparedOnce ? commandSurfaceFixtures.esiSync.duplicatePrepare : commandSurfaceFixtures.esiSync.prepare;
      preparedOnce = true;
      return json(route, response);
    }

    if (url.pathname.endsWith('/retry/reschedule')) {
      const body = route.request().postDataJSON() as { reason?: string; notBefore?: string } | null;
      esiSyncRetryOverride = {
        ...commandSurfaceFixtures.retries.esiSyncReschedule.retry,
        reason: body?.reason ?? commandSurfaceFixtures.retries.esiSyncReschedule.retry.reason,
        notBefore: body?.notBefore
      };
      return json(route, {
        retry: esiSyncRetryOverride
      });
    }

    if (url.pathname.endsWith('/retry/cancel')) {
      return json(route, commandSurfaceFixtures.retries.esiSyncCancel);
    }

    if (url.pathname.endsWith('/retry')) {
      return json(route, commandSurfaceFixtures.retries.esiSync);
    }

    const statusWithRetryOverride = esiSyncRetryOverride
      ? {
          ...esiSyncStatus,
          history: esiSyncStatus.history?.map((item) =>
            item.id === 'sync-request-failed'
              ? {
                  ...item,
                  retry: esiSyncRetryOverride,
                  retryHistory: [
                    esiSyncRetryOverride,
                    ...(item.retryHistory ?? []).filter((retry) => retry.id !== esiSyncRetryOverride.id)
                  ]
                }
              : item
          )
        }
      : esiSyncStatus;
    return json(route, statusWithRetryOverride);
  });

  await page.route('**/api/decision-records**', (route) => {
    if (route.request().method() !== 'GET') {
      const url = new URL(route.request().url());
      const body = route.request().postDataJSON() as Record<string, unknown> | null;
      const decisionId = url.pathname.match(/\/api\/decision-records\/([^/]+)\/status$/)?.[1] ?? 'decision-browser-opportunity';
      const status = body?.status === 'approved' || body?.status === 'rejected' ? body.status : 'proposed';
      return json(route, {
        decision: {
          ...commandSurfaceFixtures.decisionRecords.decisions[0],
          id: decisionId,
          sourceBriefId: String(body?.sourceBriefId ?? commandSurfaceFixtures.commandBrief.brief.id),
          sourceRecommendation: String(body?.sourceRecommendation ?? 'Browser smoke recommendation for command validation.'),
          rationale: String(body?.rationale ?? 'Commander reviewed the Opportunity recommendation.'),
          expectedResult: String(body?.expectedResult ?? 'Opportunity decision is tracked for later approval review.'),
          status,
          approval:
            status === 'approved'
              ? {
                  approvedAt: '2026-06-04T19:00:00.000Z',
                  approvalText: String(body?.approvalText ?? 'Commander approves this Opportunity recommendation for queued planning.')
                }
              : null
        }
      });
    }

    return json(route, commandSurfaceFixtures.decisionRecords);
  });

  await page.route('**/api/automation-queue**', (route) => {
    const url = new URL(route.request().url());
    const detailMatch = url.pathname.match(/\/api\/automation-queue\/([^/]+)$/);
    const handoffMatch = url.pathname.match(/\/api\/automation-queue\/([^/]+)\/handoff$/);

    if (handoffMatch) {
      const queueItem = commandSurfaceFixtures.automationQueue.queueItems.find((item) => item.id === handoffMatch[1]);
      return json(route, {
        handoff: {
          ...commandSurfaceFixtures.automationQueue.handoffs[0],
          queueItemId: queueItem?.id ?? handoffMatch[1]
        }
      });
    }

    if (detailMatch) {
      const queueItem =
        commandSurfaceFixtures.automationQueue.queueItems.find((item) => item.id === detailMatch[1]) ??
        commandSurfaceFixtures.automationQueue.queueItems[0];
      const handoff = commandSurfaceFixtures.automationQueue.handoffs.find((item) => item.queueItemId === queueItem.id);
      const retry = handoff?.id === 'handoff-browser-failed' && workerHandoffRetryOverride ? workerHandoffRetryOverride : handoff?.retry;
      const retryHistory =
        handoff?.id === 'handoff-browser-failed' && workerHandoffRetryOverride
          ? [workerHandoffRetryOverride, ...(handoff.retryHistory ?? []).filter((item) => item.id !== workerHandoffRetryOverride?.id)]
          : handoff?.retryHistory;
      return json(route, {
        queueItem,
        handoff: handoff
          ? {
              id: handoff.id,
              status: handoff.status,
              createdAt: handoff.createdAt,
              updatedAt: handoff.updatedAt,
              claimedBy: handoff.claimedBy,
              claimedAt: handoff.claimedAt,
              completedAt: handoff.completedAt,
              progress: handoff.progress,
              result: handoff.result,
              failure: handoff.failure,
              retry,
              retryHistory
            }
          : undefined
      });
    }

    if (route.request().method() !== 'GET') {
      const body = route.request().postDataJSON() as Record<string, unknown> | null;
      return json(route, {
        queueItem: {
          ...commandSurfaceFixtures.automationQueue.queueItems[0],
          id: 'queue-browser-opportunity',
          sourceDecisionId: String(body?.sourceDecisionId ?? 'decision-browser-opportunity'),
          taskIntent: String(body?.taskIntent ?? 'Opportunity planning queue item.'),
          inputSummary: String(body?.inputSummary ?? 'Use Opportunity recommendation.'),
          expectedOutput: String(body?.expectedOutput ?? 'Prepare commander review options for Opportunity recommendation.')
        }
      });
    }

    return json(route, commandSurfaceFixtures.automationQueue);
  });

  await page.route('**/api/worker-handoffs/*/retry/cancel', (route) => {
    workerHandoffRetryOverride = commandSurfaceFixtures.retries.handoffCancel.retry;
    return json(route, commandSurfaceFixtures.retries.handoffCancel);
  });
  await page.route('**/api/worker-handoffs/*/retry/reschedule', (route) => {
    const body = route.request().postDataJSON() as { reason?: string; notBefore?: string } | null;
    workerHandoffRetryOverride = {
      ...commandSurfaceFixtures.retries.handoffReschedule.retry,
      reason: body?.reason ?? commandSurfaceFixtures.retries.handoffReschedule.retry.reason,
      notBefore: body?.notBefore
    };
    return json(route, { retry: workerHandoffRetryOverride });
  });
  await page.route('**/api/worker-handoffs/*/retry', (route) => {
    workerHandoffRetryOverride = commandSurfaceFixtures.retries.handoff.retry;
    return json(route, commandSurfaceFixtures.retries.handoff);
  });

  await page.route('**/api/people/members/*', (route) => {
    const member = commandSurfaceFixtures.people.members[0];
    return json(route, {
      followUps: commandSurfaceFixtures.people.followUps.filter((followUp) => followUp.memberProfileId === member.id),
      member
    });
  });
  await page.route('**/api/people/members**', (route) =>
    json(route, {
      ingestionProvenance: commandSurfaceFixtures.people.ingestionProvenance,
      members: commandSurfaceFixtures.people.members
    })
  );
  await page.route('**/api/people/follow-ups**', (route) => {
    if (route.request().method() !== 'GET') {
      return json(route, { followUp: commandSurfaceFixtures.people.followUps[0] });
    }

    return json(route, { followUps: commandSurfaceFixtures.people.followUps });
  });
}

export async function installSessionApiFixture(page: Page, session: SessionStateResponse) {
  let currentSession = session;

  await page.route('**/api/eve-session**', (route) => {
    if (route.request().method() === 'POST') {
      currentSession = {
        signedIn: false,
        scopeSource: 'fallback',
        corporationId: '917701062'
      };
    }

    return json(route, currentSession);
  });
}
