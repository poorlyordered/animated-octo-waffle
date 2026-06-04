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

test('shows claimed completed and failed worker callback metadata', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await page.getByRole('button', { name: /Browser smoke claimed callback work item/ }).click();
  await expect(page.getByLabel('Worker handoff').getByText('claimed', { exact: true }).first()).toBeVisible();
  await expectVisibleText(page, 'overnightdesk-worker-1');
  await expectVisibleText(page, 'Fetched source documents.');

  await page.getByRole('button', { name: /Browser smoke callback completed work item/ }).click();
  await expect(page.getByLabel('Worker handoff').getByText('completed', { exact: true }).first()).toBeVisible();
  await expectVisibleText(page, 'Prepared safe output summary.');

  await page.getByRole('button', { name: /Browser smoke callback failed work item/ }).click();
  await expect(page.getByLabel('Worker handoff').getByText('failed', { exact: true }).first()).toBeVisible();
  await expectVisibleText(page, 'Source data unavailable.');
  await expectVisibleText(page, 'Retry');
  await expectVisibleText(page, 'completed: Commander approved retry scheduling for failed worker handoff.');
  await expectVisibleText(page, 'Replacement handoff-browser-retry-ready is ready.');
  await expectVisibleText(page, 'Retry policy: one active scheduled retry is allowed per target.');
  await page.getByLabel('Worker handoff').getByRole('button', { name: 'Schedule retry' }).click();
  await expectVisibleText(page, 'Retry scheduled only. No worker was dispatched and no execution occurred.');
  await page.getByLabel('Worker handoff').getByRole('button', { name: 'Cancel retry' }).click();
  await expectVisibleText(page, 'Retry canceled by commander. No worker was dispatched and no execution occurred.');

  await assertNoBrowserDiagnostics();
});

test('does not present handoff as execution', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expect(page.getByText(/Preparing handoff creates a durable record only/)).toBeVisible();
  await expect(page.getByText(/It does not dispatch, retry, or execute work/)).toBeVisible();
  await assertNoBrowserDiagnostics();
});
