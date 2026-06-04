import type { Page, Route } from '@playwright/test';
import type { SessionStateResponse } from '@gryyk/contracts';
import { commandSurfaceFixtures } from './command-surfaces';

async function json(route: Route, body: unknown) {
  await route.fulfill({
    body: JSON.stringify(body),
    contentType: 'application/json',
    status: 200
  });
}

export async function installCommandSurfaceApiFixtures(page: Page) {
  let workerHandoffRetryOverride: unknown = null;

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

    if (url.pathname.endsWith('/retry/cancel')) {
      return json(route, commandSurfaceFixtures.retries.esiSyncCancel);
    }

    if (url.pathname.endsWith('/retry')) {
      return json(route, commandSurfaceFixtures.retries.esiSync);
    }

    return json(route, esiSyncStatus);
  });

  await page.route('**/api/decision-records**', (route) => {
    if (route.request().method() !== 'GET') {
      return json(route, { decision: commandSurfaceFixtures.decisionRecords.decisions[0] });
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
              retry
            }
          : undefined
      });
    }

    if (route.request().method() !== 'GET') {
      return json(route, { queueItem: commandSurfaceFixtures.automationQueue.queueItems[0] });
    }

    return json(route, commandSurfaceFixtures.automationQueue);
  });

  await page.route('**/api/worker-handoffs/*/retry/cancel', (route) => {
    workerHandoffRetryOverride = commandSurfaceFixtures.retries.handoffCancel.retry;
    return json(route, commandSurfaceFixtures.retries.handoffCancel);
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
