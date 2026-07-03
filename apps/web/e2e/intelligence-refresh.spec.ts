import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectNonBlankSurface, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('renders intelligence refresh runs and creates a browser-safe refresh record', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectNonBlankSurface(page, 'intelligence refresh');
  await expectHeading(page, 'Refresh runs');
  await expectVisibleText(page, 'Refresh Console');
  await expectVisibleText(page, /Readiness:/);
  await expectVisibleText(page, 'Brain run: brain-1');
  await expectVisibleText(page, 'Command brief: brief-1');
  await expectVisibleText(page, 'Completed with missing or stale outputs');
  await expectVisibleText(page, 'Refresh runs prepare and evaluate intelligence only.');
  await page.getByRole('button', { name: 'Inspect run' }).first().click();
  await expectVisibleText(page, 'Run detail');
  await expectVisibleText(page, 'Failed: People ESI worker unavailable.');
  await expectVisibleText(page, 'Event log');
  await page.getByRole('button', { name: 'Record retry intent' }).click();
  await expectVisibleText(page, 'Retry intent recorded. No worker was dispatched and no external service was executed.');
  await page.getByLabel('Refresh run controls').getByRole('button', { name: 'Start full refresh' }).click();
  await expectVisibleText(page, 'Intelligence refresh run created.');
  await expectVisibleText(page, 'session:Browser Smoke Commander');
  await expect(page.getByLabel('Recent intelligence refresh runs').getByText('prepared').first()).toBeVisible();
  await assertNoBrowserDiagnostics();
});
