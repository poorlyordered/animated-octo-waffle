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
  await expectVisibleText(page, 'Retry history');
  await expectVisibleText(page, 'canceled: Commander approved retry scheduling for failed worker handoff.');
  await expectVisibleText(page, 'Reason: Commander canceled retry after policy review.');
  const workerRetryHistory = page.getByLabel('Worker handoff retry history');
  await expectVisibleText(page, 'Showing 3 of 3 retry attempts.');
  await workerRetryHistory.getByLabel('Retry status').selectOption('completed');
  await expectVisibleText(page, 'Showing 1 of 3 retry attempts.');
  await expect(workerRetryHistory.getByText('Replacement handoff-browser-retry-ready is ready.')).toBeVisible();
  await expect(workerRetryHistory.getByText('Reason: Commander canceled retry after policy review.')).toHaveCount(0);
  await workerRetryHistory.getByLabel('Retry status').selectOption('canceled');
  await expect(workerRetryHistory.getByText('Reason: Commander canceled retry after policy review.')).toBeVisible();
  await workerRetryHistory.getByLabel('Retry status').selectOption('blocked');
  await expectVisibleText(page, 'No retry attempts match the selected status.');
  await workerRetryHistory.getByLabel('Retry status').selectOption('all');
  await expectVisibleText(page, 'Retry history is read-only. This view does not dispatch, execute, or reschedule work.');
  await expectVisibleText(page, 'Retry policy: one active scheduled retry is allowed per target.');
  await page.getByLabel('Worker handoff').getByRole('button', { name: 'Schedule retry', exact: true }).click();
  await expectVisibleText(page, 'Retry scheduled only. No worker was dispatched and no execution occurred.');
  await page.getByLabel('Worker handoff').getByRole('button', { name: 'Reschedule retry' }).click();
  await expectVisibleText(page, 'Retry status: scheduled. Not before:');
  await expectVisibleText(page, 'Retry policy controls update scheduled retry timing only. They do not dispatch, claim, or execute work.');
  await page.getByLabel('Worker handoff retry policy controls').getByRole('button', { name: 'Defer 6 hours' }).click();
  await expectVisibleText(page, 'Commander applied retry policy control "Defer 6 hours"');
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
