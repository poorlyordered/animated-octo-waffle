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
  await expectVisibleText(page, 'Decision status: proposed.');
  await expect(page.getByText('move ISK')).toBeVisible();
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
