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
