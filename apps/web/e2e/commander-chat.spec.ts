import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectNonBlankSurface, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
  const sessions = [
    {
      id: 'chat-browser-1',
      corporationId: '917701062',
      commander: 'session:Browser Smoke Commander',
      title: 'Latest refresh',
      status: 'active',
      messageCount: 2,
      lastMessageAt: '2026-07-03T01:05:00.000Z',
      createdAt: '2026-07-03T01:00:00.000Z',
      updatedAt: '2026-07-03T01:05:00.000Z'
    }
  ];
  const messages = [
    {
      id: 'chat-message-1',
      sessionId: 'chat-browser-1',
      corporationId: '917701062',
      role: 'user',
      content: 'What changed after the latest intelligence refresh?',
      createdAt: '2026-07-03T01:04:00.000Z'
    },
    {
      id: 'chat-message-2',
      sessionId: 'chat-browser-1',
      corporationId: '917701062',
      role: 'assistant',
      content: 'The latest refresh completed and linked a command brief for commander review.',
      createdAt: '2026-07-03T01:05:00.000Z',
      metadata: {
        promptVersion: 'commander-chat/v1',
        provider: 'openrouter',
        model: 'openai/gpt-5.2',
        citations: [
          {
            sourceType: 'intelligence_refresh_run',
            sourceId: 'refresh-1',
            label: 'Latest refresh',
            summary: 'Refresh completed with Brain linkage.',
            freshness: 'current'
          }
        ],
        missingData: [],
        boundary: 'No execution.',
        warnings: [],
        draftDecision: {
          id: 'draft-review-refresh',
          title: 'Review refresh recommendation',
          rationale: 'The refresh produced a reviewable recommendation.',
          expectedResult: 'Commander records a proposed decision for review.',
          sourceContext: 'Latest refresh',
          playerImpacting: true,
          approvalRequired: true,
          citationIds: ['refresh-1'],
          boundary: 'No execution.'
        }
      }
    }
  ];

  await page.route('**/api/commander-chat**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/decisions')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          duplicate: false,
          decision: {
            id: 'decision-chat-1',
            corporationId: '917701062',
            sourceBriefId: 'chat-message-2',
            sourceRecommendation: 'Review refresh recommendation',
            sourceProvenance: {
              briefId: 'chat-message-2',
              briefCreatedAt: '2026-07-03T01:05:00.000Z',
              focus: 'commander-chat',
              model: 'openai/gpt-5.2',
              promptVersion: 'commander-chat/v1',
              confidence: 0.7,
              sourceCount: 1,
              sourceReferences: [{ title: 'Latest refresh', sourceId: 'refresh-1' }],
              coverage: { numbers: 'missing', opportunity: 'present', people: 'missing', missingReasons: [] }
            },
            sourceContext: {
              sourceType: 'commander_chat',
              chatSessionId: 'chat-browser-1',
              chatMessageId: 'chat-message-2',
              draftDecisionId: 'draft-review-refresh'
            },
            status: 'proposed',
            rationale: 'The refresh produced a reviewable recommendation.',
            expectedResult: 'Commander records a proposed decision for review.',
            isPlayerImpacting: true,
            approval: null,
            statusHistory: [{ toStatus: 'proposed', changedAt: '2026-07-03T01:06:00.000Z' }],
            createdAt: '2026-07-03T01:06:00.000Z',
            updatedAt: '2026-07-03T01:06:00.000Z'
          },
          boundary: 'No execution.'
        })
      });
    }

    if (route.request().method() === 'POST') {
      return route.fulfill({
        contentType: 'application/json',
        status: 201,
        body: JSON.stringify({
          session: sessions[0],
          messages,
          assistantMessage: messages[1],
          boundary: 'No execution.'
        })
      });
    }

    if (url.pathname.endsWith('/chat-browser-1')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ session: sessions[0], messages, boundary: 'No execution.' })
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ sessions, boundary: 'No execution.' })
    });
  });
});

test('renders durable commander chat with citations and draft decision controls', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectNonBlankSurface(page, 'commander chat');
  await expectHeading(page, 'Commander Chat');
  await expectVisibleText(page, 'Latest refresh');
  await page.getByRole('button', { name: /Latest refresh/ }).click();
  await expectVisibleText(page, 'Refresh completed with Brain linkage.');
  await expectVisibleText(page, 'commander-chat/v1');
  await expectVisibleText(page, 'Draft Decision');
  await page.getByRole('button', { name: 'Create Proposed Decision' }).click();
  await expect(page.getByText('Commander Chat is advisory')).toBeVisible();
  await assertNoBrowserDiagnostics();
});
