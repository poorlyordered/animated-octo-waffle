import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectHeading, expectNonBlankSurface, expectVisibleText } from './support/surface-assertions';

test.beforeEach(async ({ page }) => {
  await installCommandSurfaceApiFixtures(page);
});

test('renders command brief surface with operating leg coverage', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectNonBlankSurface(page, 'command brief');
  await expectHeading(page, 'Corporation state');
  await expectVisibleText(page, 'Browser smoke brief confirms the command surface renders with deterministic opportunity context.');
  await expectVisibleText(page, 'Latest Opportunity context is linked to processed browser research history.');
  await expectVisibleText(page, 'This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services.');
  await expectVisibleText(page, 'Browser smoke recommendation for command validation.');
  await expect(page.getByLabel('Operating model coverage').first()).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('renders decision records surface with selected detail', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'Decision loop');
  await expectVisibleText(page, 'Browser smoke decision record recommendation.');
  await expectVisibleText(page, 'Browser smoke validates decision detail rendering.');
  await expect(page.getByLabel('Decision detail').getByText('proposed').first()).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('renders automation queue surface with queued work detail', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'Queued work');
  await expectVisibleText(page, 'Browser smoke queued work item.');
  await expectVisibleText(page, 'Use deterministic browser smoke decision context.');
  await expectVisibleText(page, 'Queued work is not execution. This view does not retry, dispatch, or perform EVE actions.');
  await assertNoBrowserDiagnostics();
});

test('renders people surface with member and leadership follow-up content', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'People operating layer');
  await expectVisibleText(page, 'Browser Smoke Pilot');
  await expectVisibleText(page, 'Latest People profiles are linked to completed browser ingestion history.');
  await expectVisibleText(page, 'This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.');
  await expectVisibleText(page, 'Browser smoke member profile renders leadership context.');
  await expectVisibleText(page, 'Browser smoke leadership follow-up.');
  await assertNoBrowserDiagnostics();
});
