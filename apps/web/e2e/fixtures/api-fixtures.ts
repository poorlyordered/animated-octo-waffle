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
    if (url.pathname.endsWith('/decision')) {
      return json(route, commandSurfaceFixtures.numbersFollowUpActions.decision);
    }
    if (url.pathname.endsWith('/queue')) {
      return json(route, commandSurfaceFixtures.numbersFollowUpActions.queue);
    }

    return json(route, commandSurfaceFixtures.numbers);
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
              failure: handoff.failure
            }
          : undefined
      });
    }

    if (route.request().method() !== 'GET') {
      return json(route, { queueItem: commandSurfaceFixtures.automationQueue.queueItems[0] });
    }

    return json(route, commandSurfaceFixtures.automationQueue);
  });

  await page.route('**/api/people/members/*', (route) => {
    const member = commandSurfaceFixtures.people.members[0];
    return json(route, {
      followUps: commandSurfaceFixtures.people.followUps.filter((followUp) => followUp.memberProfileId === member.id),
      member
    });
  });
  await page.route('**/api/people/members**', (route) => json(route, { members: commandSurfaceFixtures.people.members }));
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
