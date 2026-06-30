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

  await page.getByLabel('Opportunity decision approval controls').getByRole('button', { name: 'Approve decision' }).click();
  await expectVisibleText(page, 'Decision approved. Queue creation remains a separate commander action.');
  await expectVisibleText(page, 'approved and ready for queued work');
  await expectVisibleText(page, 'Opportunity approval handoff only. No queued work, research scheduling, worker dispatch');

  await page.getByLabel('Opportunity queue controls').getByRole('button', { name: 'Create queued work' }).click();
  await expectVisibleText(page, 'Queued work created.');
  await expectVisibleText(page, 'Queued work queue-browser-opportunity is linked to approved Opportunity decision');
  await expectVisibleText(page, 'Opportunity queued work handoff only. No worker was dispatched');
  await expectVisibleText(page, 'Opportunity queued work queue-browser-opportunity is ready for explicit worker handoff preparation.');
  await page.getByLabel('Opportunity queued work detail').getByRole('button', { name: 'Prepare worker handoff' }).click();
  await expectVisibleText(page, 'Worker handoff prepared.');
  await expectVisibleText(page, 'Worker handoff handoff-browser-opportunity-failed is failed for Opportunity queued work queue-browser-opportunity.');
  await expectVisibleText(page, 'Opportunity worker handoff preparation creates a durable record only.');
  await expectVisibleText(page, 'Failed: Source data unavailable.');
  await page.getByLabel('Opportunity queued work detail').getByRole('button', { name: 'Schedule handoff retry' }).click();
  await expectVisibleText(page, 'Retry scheduled only. No worker was dispatched and no execution occurred.');
  await expectVisibleText(page, 'Retry scheduled: Commander approved retry scheduling for failed Opportunity worker handoff.');
  await page.getByLabel('Opportunity queued work detail').getByRole('button', { name: 'Reschedule handoff retry' }).click();
  await expectVisibleText(page, 'Retry status: scheduled. Not before:');
  await page.getByLabel('Opportunity worker handoff retry policy controls').getByRole('button', { name: 'Defer 6 hours' }).click();
  await expectVisibleText(page, 'Commander applied retry policy control "Defer 6 hours"');
  await page.getByLabel('Opportunity queued work detail').getByRole('button', { name: 'Cancel handoff retry' }).click();
  await expectVisibleText(page, 'Retry canceled by commander. No worker was dispatched and no execution occurred.');
  await assertNoBrowserDiagnostics();
});

test('rejects an Opportunity decision without queueing work', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await page.goto('/');

  const recommendations = page.getByLabel('Opportunity recommendations');
  await recommendations.getByRole('button', { name: 'Record decision' }).first().click();
  await page.getByLabel('Create decision record').getByLabel('Rationale').fill('Commander rejects the Opportunity recommendation after review.');
  await page.getByLabel('Create decision record').getByLabel('Expected result').fill('Opportunity decision is closed without queued work.');
  await page.getByLabel('Create decision record').getByRole('button', { name: 'Record decision' }).click();

  await page.getByLabel('Opportunity decision approval controls').getByRole('button', { name: 'Reject decision' }).click();
  await expectVisibleText(page, 'Decision rejected. No queued work was created.');
  await expectVisibleText(page, 'was rejected; queued work cannot be created');
  await expect(page.getByLabel('Opportunity queue controls')).toHaveCount(0);
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
  const pagination = page.getByLabel('Decision pagination');
  const statusFilter = filters.locator('#decision-status-filter');
  const sourceFilter = filters.locator('#decision-source-filter');
  const pageSizeFilter = filters.locator('#decision-page-size-filter');
  const savedViewFilter = filters.locator('#decision-saved-view-filter');

  await expectVisibleText(page, 'Browser smoke decision record recommendation.');
  await expectVisibleText(page, 'Browser smoke Numbers follow-up decision.');
  await expectVisibleText(page, 'Decision filters organize records only.');
  await pageSizeFilter.selectOption('3');
  await expectVisibleText(page, 'Page 1 of 3. Showing 1-3 of 8.');
  await expect(decisionRecords.getByText('Browser smoke rejected decision.')).toHaveCount(0);
  await pagination.getByRole('button', { name: 'Next' }).click();
  await expectVisibleText(page, 'Page 2 of 3. Showing 4-6 of 8.');
  await expectVisibleText(page, 'Browser smoke rejected decision.');
  await pagination.getByRole('button', { name: 'Previous' }).click();
  await expectVisibleText(page, 'Page 1 of 3. Showing 1-3 of 8.');

  await statusFilter.selectOption('rejected');
  await expectVisibleText(page, 'Page 1 of 1. Showing 1-1 of 1.');
  await expectVisibleText(page, 'Browser smoke rejected decision.');
  await expect(decisionRecords.getByText('Browser smoke decision record recommendation.')).toHaveCount(0);
  await filters.getByRole('button', { name: 'Save view' }).click();
  await expect(savedViewFilter).toHaveValue('rejected:all:3');

  await statusFilter.selectOption('all');
  await sourceFilter.selectOption('numbers');
  await expectVisibleText(page, 'Browser smoke Numbers follow-up decision.');
  await expectVisibleText(page, 'Source: Numbers follow-up');
  await expect(decisionRecords.getByText('Browser smoke approved decision for queue links.')).toHaveCount(0);
  await savedViewFilter.selectOption('rejected:all:3');
  await expect(statusFilter).toHaveValue('rejected');
  await expect(sourceFilter).toHaveValue('all');
  await expectVisibleText(page, 'Browser smoke rejected decision.');
  await filters.getByRole('button', { name: 'Delete view' }).click();
  await expect(savedViewFilter).toHaveValue('');

  await statusFilter.selectOption('all');
  await sourceFilter.selectOption('numbers');
  await page.reload();
  const reloadedFilters = page.getByLabel('Decision filters');
  const reloadedSourceFilter = reloadedFilters.locator('#decision-source-filter');
  const reloadedPageSizeFilter = reloadedFilters.locator('#decision-page-size-filter');
  await expect(reloadedSourceFilter).toHaveValue('numbers');
  await expect(reloadedPageSizeFilter).toHaveValue('3');
  await expectVisibleText(page, 'Browser smoke Numbers follow-up decision.');

  await reloadedSourceFilter.selectOption('people');
  await expectVisibleText(page, 'No decisions match the selected filters.');
  await expect(reloadedSourceFilter).toHaveValue('people');

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
  await page.getByRole('button', { name: 'Prepare ingestion' }).click();
  await expectVisibleText(page, 'People ingestion prepared for worker pickup.');
  await expectVisibleText(page, 'queued');
  await expectVisibleText(page, 'No worker was dispatched, no ESI data was fetched, and no EVE role/access or external-service change occurred.');
  await expectVisibleText(page, 'Browser smoke member profile renders leadership context.');
  await expectVisibleText(page, 'Browser smoke leadership follow-up.');
  const followUps = page.getByLabel('Leadership follow-ups');
  await followUps.getByRole('button', { name: 'Record decision' }).first().click();
  await expectVisibleText(page, 'People follow-up decision recorded.');
  await expectVisibleText(page, 'Approval is required before queued work can be created.');
  await followUps.getByLabel('People decision approval controls for Browser Smoke Pilot').getByRole('button', { name: 'Approve decision' }).click();
  await expectVisibleText(page, 'People follow-up decision approved. Queue creation remains separate.');
  await expectVisibleText(page, 'approved and ready for separate queued work.');
  await followUps.getByRole('button', { name: 'Create queued work' }).first().click();
  await expectVisibleText(page, 'People queued work created.');
  await expectVisibleText(page, 'Queued work is linked to approved People decision');
  await expectVisibleText(page, 'No worker was dispatched, no handoff was prepared, and no EVE role/access or external-service change occurred.');
  await expectVisibleText(page, 'People queued work queue-people-follow-up is ready for explicit worker handoff preparation.');
  await followUps
    .getByLabel('People queued work detail for Browser Smoke Pilot')
    .first()
    .getByRole('button', { name: 'Prepare worker handoff' })
    .click();
  await expectVisibleText(page, 'People worker handoff prepared.');
  await expectVisibleText(page, 'Worker handoff handoff-browser-people-failed is failed for People queued work queue-people-follow-up.');
  await expectVisibleText(page, 'People worker handoff preparation creates a durable record only.');
  await expectVisibleText(page, 'Failed: Source data unavailable.');
  await followUps.getByLabel('People queued work detail for Browser Smoke Pilot').first().getByRole('button', { name: 'Schedule handoff retry' }).click();
  await expectVisibleText(page, 'People handoff retry scheduled.');
  await expectVisibleText(page, 'Retry scheduled: Commander approved retry scheduling for failed People worker handoff.');
  await followUps.getByLabel('People queued work detail for Browser Smoke Pilot').first().getByRole('button', { name: 'Reschedule handoff retry' }).click();
  await expectVisibleText(page, 'People handoff retry rescheduled.');
  await followUps
    .getByLabel('People worker handoff retry policy controls for Browser Smoke Pilot')
    .first()
    .getByRole('button', { name: 'Defer 6 hours' })
    .click();
  await expectVisibleText(page, 'Commander applied retry policy control "Defer 6 hours" for scheduled People worker handoff retry.');
  await followUps.getByLabel('People queued work detail for Browser Smoke Pilot').first().getByRole('button', { name: 'Cancel handoff retry' }).click();
  await expectVisibleText(page, 'People handoff retry canceled.');
  await expectVisibleText(page, 'Retry canceled');
  await assertNoBrowserDiagnostics();
});
