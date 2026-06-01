import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('shows worker handoff readiness after preparation', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');
  await page.getByRole('button', { name: /Browser smoke queued work item/ }).click();
  await page.getByRole('button', { name: 'Prepare handoff' }).click();

  await expectVisibleText(page, 'Worker handoff');
  await expectVisibleText(page, 'ready');
  await expectVisibleText(page, 'Preparing handoff creates a durable record only.');
  await assertNoBrowserDiagnostics();
});

test('shows blocked worker handoff failure details', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');
  await page.getByRole('button', { name: /Browser smoke failed work item/ }).click();
  await page.getByRole('button', { name: 'Prepare handoff' }).click();

  await expect(page.getByLabel('Worker handoff').getByText('blocked')).toBeVisible();
  await expectVisibleText(page, 'Worker prerequisites are missing.');
  await assertNoBrowserDiagnostics();
});

test('does not present handoff as execution', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expect(page.getByText(/Preparing handoff creates a durable record only/)).toBeVisible();
  await expect(page.getByText(/It does not dispatch, retry, or execute work/)).toBeVisible();
  await assertNoBrowserDiagnostics();
});
