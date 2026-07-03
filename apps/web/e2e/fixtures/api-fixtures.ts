import type { Page, Route } from '@playwright/test';
import type { RetryRequestSummary, SessionStateResponse } from '@gryyk/contracts';
import { commandSurfaceFixtures } from './command-surfaces';

function browserDecisionSource(decision: (typeof commandSurfaceFixtures.decisionRecords.decisions)[number]) {
  if (decision.sourceContext?.sourceType === 'numbers_follow_up') {
    return 'numbers';
  }

  if (decision.sourceContext?.sourceType === 'people_follow_up') {
    return 'people';
  }

  return 'opportunity';
}

function decisionPagination(totalItems: number, requestedPage: number, pageSize: 3 | 5 | 10) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  return { endIndex, page, pageSize, startIndex, totalItems, totalPages };
}

function browserDecisionPageSize(value: string | null): 3 | 5 | 10 {
  return value === '3' || value === '10' ? Number(value) as 3 | 10 : 5;
}

async function json(route: Route, body: unknown) {
  await route.fulfill({
    body: JSON.stringify(body),
    contentType: 'application/json',
    status: 200
  });
}

interface CommandSurfaceApiFixtureOptions {
  sessionState?: SessionStateResponse;
}

const signedInBrowserSession: SessionStateResponse = {
  signedIn: true,
  scopeSource: 'session',
  characterId: '2110000001',
  characterName: 'Browser Smoke Commander',
  corporationId: '917701062',
  corporationName: 'Gryyk-47',
  expiresAt: '2099-06-01T00:00:00.000Z'
};

export async function installCommandSurfaceApiFixtures(page: Page, options: CommandSurfaceApiFixtureOptions = {}) {
  const sessionState = options.sessionState ?? signedInBrowserSession;
  let workerHandoffRetryOverride: RetryRequestSummary | null = null;
  let opportunityProvenance = commandSurfaceFixtures.commandBrief.opportunityProvenance;
  let peopleDecisionStatus: 'none' | 'proposed' | 'approved' | 'rejected' = 'none';
  let peopleQueueLinked = false;
  let peopleIngestionProvenance = commandSurfaceFixtures.people.ingestionProvenance;
  let intelligenceRefreshRuns = [commandSurfaceFixtures.intelligenceRefresh.completed];

  function browserPeopleFollowUps() {
    return commandSurfaceFixtures.people.followUps.map((followUp) =>
      followUp.id === 'follow-up-browser-open' && peopleDecisionStatus !== 'none'
        ? {
            ...followUp,
            sourceDecisionId: commandSurfaceFixtures.people.decision.id,
            sourceQueueItemId: peopleQueueLinked ? commandSurfaceFixtures.people.queueItem.id : undefined,
            sourceContext: {
              ...followUp.sourceContext,
              decisionId: commandSurfaceFixtures.people.decision.id,
              decisionStatus: peopleDecisionStatus,
              queueItemId: peopleQueueLinked ? commandSurfaceFixtures.people.queueItem.id : undefined,
              queueStatus: peopleQueueLinked ? commandSurfaceFixtures.people.queueItem.status : undefined
            }
          }
        : followUp
    );
  }

  function browserPeopleHandoffs() {
    const followUp = browserPeopleFollowUps().find((item) => item.id === 'follow-up-browser-open');
    if (!followUp || peopleDecisionStatus === 'none') {
      return {};
    }

    const decision =
      peopleDecisionStatus === 'approved'
        ? commandSurfaceFixtures.people.approvedDecision
        : peopleDecisionStatus === 'rejected'
          ? commandSurfaceFixtures.people.rejectedDecision
          : commandSurfaceFixtures.people.decision;

    return {
      [followUp.id]: {
        followUpId: followUp.id,
        memberProfileId: followUp.memberProfileId,
        memberDisplayName: followUp.memberDisplayName,
        decisionId: decision.id,
        decisionStatus: decision.status,
        approvalRequired: decision.status === 'proposed',
        queueReady: decision.status === 'approved',
        queueItemId: peopleQueueLinked ? commandSurfaceFixtures.people.queueItem.id : undefined,
        queueStatus: peopleQueueLinked ? commandSurfaceFixtures.people.queueItem.status : undefined,
        message: peopleQueueLinked
          ? `Queued work is linked to approved People decision ${decision.id}.`
          : decision.status === 'approved'
            ? `Decision ${decision.id} is approved and ready for separate queued work.`
            : decision.status === 'rejected'
              ? `Decision ${decision.id} is rejected. Queued work cannot be created from this People follow-up.`
              : `Decision ${decision.id} is proposed. Approval is required before queued work can be created.`,
        boundary: peopleQueueLinked
          ? 'People queued work handoff only. No worker was dispatched, no handoff was prepared, and no EVE role/access or external-service change occurred.'
          : 'People follow-up handoff only. No queued work, worker dispatch, EVE role/access change, retry, or external execution occurred.',
        missingLinkReasons: []
      }
    };
  }

  await page.route('**/api/eve-session**', (route) => {
    if (route.request().method() === 'POST') {
      return json(route, {
        signedIn: false,
        scopeSource: 'missing'
      });
    }

    return json(route, sessionState);
  });

  await page.route('**/api/command-brief**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/opportunity/prepare')) {
      opportunityProvenance = {
        ...commandSurfaceFixtures.commandBrief.preparedOpportunityIngestion.provenance,
        message: 'Opportunity context is available from historical browser command brief records.'
      };
      return json(route, {
        ...commandSurfaceFixtures.commandBrief.preparedOpportunityIngestion,
        provenance: opportunityProvenance
      });
    }

    return json(route, {
      ...commandSurfaceFixtures.commandBrief,
      opportunityProvenance
    });
  });
  await page.route('**/api/research-status**', (route) => json(route, commandSurfaceFixtures.researchStatus));
  await page.route('**/api/operations-health**', (route) => json(route, commandSurfaceFixtures.operationsHealth));
  await page.route('**/api/production-evidence**', (route) => json(route, commandSurfaceFixtures.productionEvidence));
  await page.route('**/api/intelligence-refresh**', (route) => {
    const url = new URL(route.request().url());
    const detailMatch = url.pathname.match(/\/api\/intelligence-refresh\/([^/]+)$/);
    const retryMatch = url.pathname.match(/\/api\/intelligence-refresh\/([^/]+)\/steps\/([^/]+)\/retry$/);
    const skipMatch = url.pathname.match(/\/api\/intelligence-refresh\/([^/]+)\/steps\/([^/]+)\/skip$/);

    if (url.pathname.endsWith('/readiness')) {
      return json(route, commandSurfaceFixtures.intelligenceRefresh.readiness);
    }

    if (retryMatch) {
      const run =
        intelligenceRefreshRuns.find((item) => item.id === decodeURIComponent(retryMatch[1])) ??
        commandSurfaceFixtures.intelligenceRefresh.completed;
      return json(route, {
        run,
        event: {
          ...commandSurfaceFixtures.intelligenceRefresh.events[1],
          id: 'event-browser-retry',
          runId: run.id,
          eventType: 'step_retry_requested',
          actor: 'session:Browser Smoke Commander',
          message: 'Commander recorded retry intent.'
        },
        boundary: run.boundary
      });
    }

    if (skipMatch) {
      const run =
        intelligenceRefreshRuns.find((item) => item.id === decodeURIComponent(skipMatch[1])) ??
        commandSurfaceFixtures.intelligenceRefresh.completed;
      return json(route, {
        run,
        event: {
          ...commandSurfaceFixtures.intelligenceRefresh.events[1],
          id: 'event-browser-skip',
          runId: run.id,
          eventType: 'step_skipped',
          actor: 'session:Browser Smoke Commander',
          message: 'Commander skipped step.'
        },
        boundary: run.boundary
      });
    }

    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { mode?: string } | null;
      const created = {
        ...commandSurfaceFixtures.intelligenceRefresh.queued,
        id: 'refresh-browser-created',
        mode: body?.mode ?? 'full_refresh',
        createdAt: '2026-07-03T00:10:00.000Z',
        updatedAt: '2026-07-03T00:10:00.000Z',
        requestedBy: 'session:Browser Smoke Commander'
      };
      intelligenceRefreshRuns = [created, ...intelligenceRefreshRuns];
      return json(route, { run: created, duplicate: false });
    }

    if (detailMatch) {
      const run =
        intelligenceRefreshRuns.find((item) => item.id === decodeURIComponent(detailMatch[1])) ??
        commandSurfaceFixtures.intelligenceRefresh.completed;
      return json(route, {
        run,
        timeline: commandSurfaceFixtures.intelligenceRefresh.timeline,
        events: commandSurfaceFixtures.intelligenceRefresh.events.map((event) => ({ ...event, runId: run.id })),
        boundary: run.boundary
      });
    }

    return json(route, { runs: intelligenceRefreshRuns });
  });
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
      const body = route.request().postDataJSON() as { domain?: string } | null;
      const response =
        body?.domain === 'people'
          ? commandSurfaceFixtures.esiSync.preparePeople
          : body?.domain === 'opportunity'
            ? commandSurfaceFixtures.esiSync.prepareOpportunity
            : preparedOnce
              ? commandSurfaceFixtures.esiSync.duplicatePrepare
              : commandSurfaceFixtures.esiSync.prepare;
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

    const url = new URL(route.request().url());
    const source = url.searchParams.get('source');
    const status = url.searchParams.get('status');
    const pageSize = browserDecisionPageSize(url.searchParams.get('pageSize'));
    const requestedPage = Number(url.searchParams.get('page') ?? '1');
    const decisions = commandSurfaceFixtures.decisionRecords.decisions.filter((decision) => {
      const sourceMatches = !source || browserDecisionSource(decision) === source;
      const statusMatches = !status || decision.status === status;

      return sourceMatches && statusMatches;
    });
    const pagination = decisionPagination(decisions.length, requestedPage, pageSize);

    return json(route, {
      decisions: decisions.slice(pagination.startIndex === 0 ? 0 : pagination.startIndex - 1, pagination.endIndex),
      pagination
    });
  });

  await page.route('**/api/automation-queue**', (route) => {
    const url = new URL(route.request().url());
    const detailMatch = url.pathname.match(/\/api\/automation-queue\/([^/]+)$/);
    const handoffMatch = url.pathname.match(/\/api\/automation-queue\/([^/]+)\/handoff$/);

    if (handoffMatch) {
      const queueItem = commandSurfaceFixtures.automationQueue.queueItems.find((item) => item.id === handoffMatch[1]);
      const opportunityHandoff =
        handoffMatch[1] === 'queue-browser-opportunity'
          ? commandSurfaceFixtures.automationQueue.handoffs.find((item) => item.id === 'handoff-browser-opportunity-failed')
          : null;
      const peopleHandoff =
        handoffMatch[1] === 'queue-people-follow-up'
          ? commandSurfaceFixtures.automationQueue.handoffs.find((item) => item.id === 'handoff-browser-people-failed')
          : null;
      return json(route, {
        handoff: {
          ...(peopleHandoff ?? opportunityHandoff ?? commandSurfaceFixtures.automationQueue.handoffs[0]),
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
    const body = route.request().postDataJSON() as { reason?: string } | null;
    workerHandoffRetryOverride = {
      ...commandSurfaceFixtures.retries.handoff.retry,
      reason: body?.reason ?? commandSurfaceFixtures.retries.handoff.retry.reason
    };
    return json(route, {
      ...commandSurfaceFixtures.retries.handoff,
      retry: workerHandoffRetryOverride
    });
  });

  await page.route('**/api/people/ingestion/prepare', (route) => {
    peopleIngestionProvenance = {
      ...commandSurfaceFixtures.people.preparedIngestion.provenance,
      message: 'People profiles are available from historical browser profile records.'
    };
    return json(route, {
      ...commandSurfaceFixtures.people.preparedIngestion,
      provenance: peopleIngestionProvenance
    });
  });

  await page.route('**/api/people/members/*', (route) => {
    const member = commandSurfaceFixtures.people.members[0];
    const followUps = browserPeopleFollowUps().filter((followUp) => followUp.memberProfileId === member.id);
    return json(route, {
      followUps,
      handoffByFollowUpId: browserPeopleHandoffs(),
      member
    });
  });
  await page.route('**/api/people/members**', (route) =>
    json(route, {
      ingestionProvenance: peopleIngestionProvenance,
      members: commandSurfaceFixtures.people.members
    })
  );
  await page.route('**/api/people/follow-ups**', (route) => {
    const url = new URL(route.request().url());
    const actionMatch = url.pathname.match(/\/api\/people\/follow-ups\/([^/]+)\/(decision\/status|decision|queue)$/);

    if (actionMatch) {
      const followUpId = decodeURIComponent(actionMatch[1]);
      const sourceFollowUp =
        commandSurfaceFixtures.people.followUps.find((followUp) => followUp.id === followUpId) ??
        commandSurfaceFixtures.people.followUps[0];
      const decision =
        actionMatch[2] === 'decision/status'
          ? (route.request().postDataJSON() as { status?: string } | null)?.status === 'rejected'
            ? commandSurfaceFixtures.people.rejectedDecision
            : commandSurfaceFixtures.people.approvedDecision
          : commandSurfaceFixtures.people.decision;
      peopleDecisionStatus = decision.status === 'approved' || decision.status === 'rejected' ? decision.status : 'proposed';
      const queueItem = {
        ...commandSurfaceFixtures.people.queueItem,
        sourceDecisionId: decision.id
      };
      const linkedFollowUp = {
        ...sourceFollowUp,
        sourceDecisionId: decision.id,
        sourceQueueItemId: peopleQueueLinked || actionMatch[2] === 'queue' ? queueItem.id : undefined,
        sourceContext: {
          ...sourceFollowUp.sourceContext,
          decisionId: decision.id,
          decisionStatus: decision.status,
          queueItemId: peopleQueueLinked || actionMatch[2] === 'queue' ? queueItem.id : undefined,
          queueStatus: peopleQueueLinked || actionMatch[2] === 'queue' ? queueItem.status : undefined
        }
      };

      if (actionMatch[2] === 'queue') {
        peopleQueueLinked = true;
        return json(route, {
          followUp: linkedFollowUp,
          queueItem,
          handoff: {
            followUpId: linkedFollowUp.id,
            memberProfileId: linkedFollowUp.memberProfileId,
            memberDisplayName: linkedFollowUp.memberDisplayName,
            decisionId: decision.id,
            decisionStatus: 'approved',
            approvalRequired: false,
            queueReady: true,
            queueItemId: queueItem.id,
            queueStatus: queueItem.status,
            message: `Queued work is linked to approved People decision ${decision.id}.`,
            boundary:
              'People queued work handoff only. No worker was dispatched, no handoff was prepared, and no EVE role/access or external-service change occurred.',
            missingLinkReasons: []
          },
          message: 'People queued work created.'
        });
      }

      return json(route, {
        followUp: linkedFollowUp,
        decision,
        handoff: {
          followUpId: linkedFollowUp.id,
          memberProfileId: linkedFollowUp.memberProfileId,
          memberDisplayName: linkedFollowUp.memberDisplayName,
          decisionId: decision.id,
          decisionStatus: decision.status,
          approvalRequired: decision.status === 'proposed',
          queueReady: decision.status === 'approved',
          message:
            decision.status === 'approved'
              ? `Decision ${decision.id} is approved and ready for separate queued work.`
              : decision.status === 'rejected'
                ? `Decision ${decision.id} is rejected. Queued work cannot be created from this People follow-up.`
                : `Decision ${decision.id} is proposed. Approval is required before queued work can be created.`,
          boundary:
            'People follow-up handoff only. No queued work, worker dispatch, EVE role/access change, retry, or external execution occurred.',
          missingLinkReasons: []
        },
        message:
          decision.status === 'approved'
            ? 'People follow-up decision approved.'
            : decision.status === 'rejected'
              ? 'People follow-up decision rejected.'
              : 'People follow-up decision recorded.'
      });
    }

    if (route.request().method() !== 'GET') {
      return json(route, { followUp: commandSurfaceFixtures.people.followUps[0] });
    }

    return json(route, {
      followUps: browserPeopleFollowUps(),
      handoffByFollowUpId: browserPeopleHandoffs()
    });
  });
}

export async function installSessionApiFixture(page: Page, session: SessionStateResponse) {
  let currentSession = session;

  await page.route('**/api/eve-session**', (route) => {
    if (route.request().method() === 'POST') {
      currentSession = {
        signedIn: false,
        scopeSource: 'missing'
      };
    }

    return json(route, currentSession);
  });
}
