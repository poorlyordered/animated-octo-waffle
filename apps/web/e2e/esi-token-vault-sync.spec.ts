import { test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('shows active ESI vault status and prepares queued read sync', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'ESI token vault');
  await expectVisibleText(page, 'Vaulted consent can prepare read-only sync requests.');
  await expectVisibleText(page, 'Recent sync history');
  await expectVisibleText(page, 'numbers sync: completed');
  await expectVisibleText(page, 'Failed: ESI market endpoint returned a safe fixture failure.');
  await expectVisibleText(page, 'Retry scheduled: Commander approved retry scheduling for failed ESI sync.');
  await expectVisibleText(page, 'Retry blocked: Commander approved retry scheduling for failed ESI sync.');
  await expectVisibleText(page, 'Blocked: Active ESI consent is required before this sync retry can be queued.');
  await expectVisibleText(page, 'Retry history');
  await expectVisibleText(page, 'canceled: Commander approved retry scheduling for failed ESI sync.');
  await expectVisibleText(page, 'Retry history is read-only. This view does not dispatch, execute, fetch ESI, or reschedule work.');
  await expectVisibleText(page, 'Retry policy: one active scheduled retry is allowed per target.');
  await page.getByLabel('ESI sync history').getByRole('button', { name: 'Schedule retry' }).first().click();
  await expectVisibleText(page, 'Retry scheduled only. No worker was dispatched and no execution occurred.');
  await page.getByLabel('ESI sync history').getByRole('button', { name: 'Cancel retry' }).first().click();
  await expectVisibleText(page, 'Retry canceled by commander. No worker was dispatched and no execution occurred.');
  await page.getByLabel('ESI sync domains').getByRole('button', { name: 'Prepare read sync' }).click();
  await expectVisibleText(page, 'Queued for future read-only worker sync. No ESI data was fetched and no worker was dispatched.');
  await expectVisibleText(page, 'Sync status: queued.');
  await assertNoBrowserDiagnostics();
});

test('surfaces duplicate sync requests and revocation boundaries', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await page.getByLabel('ESI sync domains').getByRole('button', { name: 'Prepare read sync' }).click();
  await page.getByLabel('ESI sync domains').getByRole('button', { name: 'Prepare read sync' }).click();
  await expectVisibleText(page, 'Existing queued sync request surfaced. No duplicate was created.');

  await page.getByLabel('ESI consent controls').getByRole('button', { name: 'Revoke consent' }).click();
  await expectVisibleText(page, 'Vault status: revoked.');
  await expectVisibleText(page, 'Revoked token material cannot prepare sync requests.');
  await assertNoBrowserDiagnostics();
});
