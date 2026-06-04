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

test('renders dedicated opportunity surface with provenance and read-only boundaries', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  await expectHeading(page, 'Opportunity operating layer');
  await expectVisibleText(page, 'Browser smoke brief confirms the command surface renders with deterministic opportunity context.');
  await expectVisibleText(page, 'Browser smoke impact validates opportunity context.');
  await expectVisibleText(page, 'Browser smoke recommendation for command validation.');
  await expectVisibleText(page, 'Browser smoke watchlist item');
  await expectVisibleText(page, 'Latest Opportunity context is linked to processed browser research history.');
  await expectVisibleText(page, 'Opportunity surface is read-only.');
  await expect(page.getByLabel('Opportunity section status')).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('records an Opportunity decision handoff without queueing or execution', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  const recommendations = page.getByLabel('Opportunity recommendations');
  await recommendations.getByRole('button', { name: 'Record decision' }).first().click();
  await page.getByLabel('Create decision record').getByLabel('Rationale').fill('Commander reviewed the Opportunity recommendation.');
  await page.getByLabel('Create decision record').getByLabel('Expected result').fill('Opportunity decision is tracked for later approval review.');
  await page.getByLabel('Create decision record').getByRole('button', { name: 'Record decision' }).click();

  await expectVisibleText(page, 'Opportunity decision handoff');
  await expectVisibleText(page, 'was recorded from Opportunity recommendation');
  await expectVisibleText(page, 'Approval, queueing, research scheduling, worker dispatch, ESI fetch, EVE writes');
  await expect(page.getByLabel('Opportunity decision handoff').getByText('proposed').first()).toBeVisible();
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

test('filters decision records by status and source', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  const decisionRecords = page.getByLabel('Decision records');
  const filters = page.getByLabel('Decision filters');

  await expectVisibleText(page, 'Browser smoke decision record recommendation.');
  await expectVisibleText(page, 'Browser smoke Numbers follow-up decision.');
  await expectVisibleText(page, 'Decision filters organize records only.');

  await filters.getByLabel('Status').selectOption('rejected');
  await expectVisibleText(page, 'Browser smoke rejected decision.');
  await expect(decisionRecords.getByText('Browser smoke decision record recommendation.')).toHaveCount(0);

  await filters.getByLabel('Status').selectOption('all');
  await filters.getByLabel('Source').selectOption('numbers');
  await expectVisibleText(page, 'Browser smoke Numbers follow-up decision.');
  await expectVisibleText(page, 'Source: Numbers follow-up');
  await expect(decisionRecords.getByText('Browser smoke approved decision for queue links.')).toHaveCount(0);

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
