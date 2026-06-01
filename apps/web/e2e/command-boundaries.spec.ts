import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectForbiddenTextAbsent, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('shows player-impacting decision approval boundary', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');
  await page.getByRole('button', { name: /Browser smoke player-impacting decision/ }).click();

  await expectVisibleText(page, 'Player-impacting: explicit approval is required before action-like progression.');
  await expect(page.getByLabel('Approval text')).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('keeps automation queue visible as queued work rather than execution', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectVisibleText(page, 'Queued work is not execution. This view does not retry, dispatch, or perform EVE actions.');
  await expectVisibleText(page, 'Preparing handoff creates a durable record only. It does not dispatch, retry, or execute work.');
  await expectForbiddenTextAbsent(page);
  await assertNoBrowserDiagnostics();
});

test('keeps people follow-ups visible as records rather than role or EVE mutations', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectVisibleText(page, 'Follow-ups do not change roles, access, queue status, or EVE state.');
  await expectVisibleText(page, 'Browser smoke player-impacting follow-up.');
  await expectForbiddenTextAbsent(page);
  await assertNoBrowserDiagnostics();
});
