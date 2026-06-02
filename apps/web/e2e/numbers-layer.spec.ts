import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('renders numbers operating layer with health sections and provenance', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'Numbers operating layer');
  await expectVisibleText(page, 'Wallet runway is stable.');
  await expectVisibleText(page, 'Doctrine stock is below threshold.');
  await expectVisibleText(page, 'processed-numbers-v1');
  await expectVisibleText(page, 'numbers-snapshot-v1');
  await expectVisibleText(page, 'Latest Numbers snapshot was produced by a completed read-only ESI sync.');
  await expectVisibleText(page, 'sync-request-completed');
  await expectVisibleText(page, 'Read-only provenance. No ESI write, worker dispatch, retry, wallet, asset, contract, role, or external-service action was performed.');
  await assertNoBrowserDiagnostics();
});

test('renders stale and missing numbers sections explicitly', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expect(page.getByLabel('Numbers sections').getByText('Market', { exact: true })).toBeVisible();
  await expectVisibleText(page, 'Market data is older than the accepted freshness window.');
  await expect(page.getByLabel('Numbers sections').getByText('Activity', { exact: true })).toBeVisible();
  await expectVisibleText(page, 'Activity data is not available in the processed snapshot.');
  await assertNoBrowserDiagnostics();
});

test('renders follow-up candidates as planning-only recommendations', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectVisibleText(page, 'Review logistics stockout risk');
  await expectVisibleText(page, 'Player-impacting: explicit approval is required later.');
  await expectVisibleText(page, 'Numbers findings are read-only recommendations.');
  await assertNoBrowserDiagnostics();
});
