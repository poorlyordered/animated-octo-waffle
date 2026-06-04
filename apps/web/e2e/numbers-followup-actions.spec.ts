import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('creates a proposed decision from a Numbers follow-up candidate', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'Numbers operating layer');
  await page.getByLabel('Numbers follow-ups').getByRole('button', { name: 'Record decision' }).first().click();

  await expectVisibleText(page, 'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.');
  await expectVisibleText(page, 'Approval is required before queued work can be created.');
  await expectVisibleText(page, 'Approval handoff only. No worker was dispatched and no execution occurred.');
  await expect(page.getByText('move ISK')).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('approves a Numbers follow-up decision before separate queue creation', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.route('**/api/numbers/follow-ups/numbers-follow-up-2/decision', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }

    const { commandSurfaceFixtures } = await import('./fixtures/command-surfaces');
    const response = commandSurfaceFixtures.numbersFollowUpActions.decision;

    return route.fulfill({
      body: JSON.stringify({
        ...response,
        decision: {
          ...response.decision,
          id: 'decision-numbers-follow-up-2',
          sourceRecommendation: 'Approve asset repositioning plan',
          sourceContext: {
            ...response.decision.sourceContext,
            candidateId: 'numbers-follow-up-2',
            relatedSection: 'assets',
            suggestedPath: 'queue'
          }
        },
        origin: {
          ...response.origin,
          candidateId: 'numbers-follow-up-2',
          relatedSection: 'assets',
          suggestedPath: 'queue'
        },
        approvalHandoff: {
          ...response.approvalHandoff,
          candidateId: 'numbers-follow-up-2',
          decisionId: 'decision-numbers-follow-up-2'
        }
      }),
      contentType: 'application/json',
      status: 201
    });
  });

  await page.goto('/');

  const followUps = page.getByLabel('Numbers follow-ups');
  await followUps.getByRole('button', { name: 'Record decision' }).nth(1).click();

  await expect(followUps.getByRole('button', { name: 'Create queued work' })).toHaveCount(0);
  await followUps.getByRole('button', { name: 'Approve decision' }).click();

  await expectVisibleText(page, 'Decision approved. Queue creation remains a separate commander action');
  await expectVisibleText(page, 'approved and ready for queued work');
  await expectVisibleText(page, 'Approval handoff only. No worker was dispatched and no execution occurred.');

  await followUps.getByRole('button', { name: 'Create queued work' }).click();

  await expectVisibleText(page, 'Queued work created.');
  await expectVisibleText(page, 'Queued work handoff only. No worker was dispatched and no execution occurred.');
  await assertNoBrowserDiagnostics();
});

test('rejects a Numbers follow-up decision without queueing work', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  const followUps = page.getByLabel('Numbers follow-ups');
  await followUps.getByRole('button', { name: 'Record decision' }).first().click();
  await followUps.getByRole('button', { name: 'Reject decision' }).click();

  await expectVisibleText(page, 'Decision rejected. No queued work, worker dispatch, EVE action, wallet action, asset action, or external execution was performed.');
  await expectVisibleText(page, 'Queued work cannot be created from this decision.');
  await expect(followUps.getByRole('button', { name: 'Create queued work' })).toHaveCount(0);
  await assertNoBrowserDiagnostics();
});

test('shows approved Numbers handoff into queued work', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  const followUps = page.getByLabel('Numbers follow-ups');
  await followUps.getByRole('button', { name: 'Record decision' }).nth(1).click();

  await expectVisibleText(page, 'approved and ready for queued work');
  await expectVisibleText(page, 'Approval handoff only. No worker was dispatched and no execution occurred.');

  await followUps.getByRole('button', { name: 'Create queued work' }).click();

  await expectVisibleText(page, 'Queued work created.');
  await expectVisibleText(page, 'Queued work is linked to approved Numbers decision');
  await expectVisibleText(page, 'Queued work handoff only. No worker was dispatched and no execution occurred.');
  await assertNoBrowserDiagnostics();
});

test('surfaces duplicate Numbers follow-up decisions without creating another record', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.route('**/api/numbers**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/decision')) {
      const { commandSurfaceFixtures } = await import('./fixtures/command-surfaces');
      return route.fulfill({
        body: JSON.stringify({
          ...commandSurfaceFixtures.numbersFollowUpActions.decision,
          duplicate: true,
          approvalHandoff: {
            ...commandSurfaceFixtures.numbersFollowUpActions.decision.approvalHandoff,
            duplicate: true
          },
          message: 'Existing decision surfaced. No duplicate was created.'
        }),
        contentType: 'application/json',
        status: 200
      });
    }

    return route.fallback();
  });

  await page.goto('/');

  await page.getByLabel('Numbers follow-ups').getByRole('button', { name: 'Record decision' }).first().click();

  await expectVisibleText(page, 'Existing decision surfaced. No duplicate was created.');
  await assertNoBrowserDiagnostics();
});
