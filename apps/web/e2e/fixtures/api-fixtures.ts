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

  await page.route('**/api/decision-records**', (route) => {
    if (route.request().method() !== 'GET') {
      return json(route, { decision: commandSurfaceFixtures.decisionRecords.decisions[0] });
    }

    return json(route, commandSurfaceFixtures.decisionRecords);
  });

  await page.route('**/api/automation-queue**', (route) => {
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
