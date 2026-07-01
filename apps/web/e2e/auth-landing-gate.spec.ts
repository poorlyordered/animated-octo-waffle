import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectVisibleText } from './support/surface-assertions';

test('shows login gate without mounting command data surfaces when session is missing', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);
  const commandRequests: string[] = [];

  await installCommandSurfaceApiFixtures(page, {
    sessionState: {
      signedIn: false,
      scopeSource: 'missing'
    }
  });

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/eve-session')) {
      commandRequests.push(url.pathname);
    }
  });

  await page.goto('/');

  await expect(page.getByLabel('Gryyk-47 access gate')).toBeVisible();
  await expectVisibleText(page, 'Gryyk-47');
  await expectVisibleText(page, 'EVE Online corporation command operating system');
  await expect(page.getByRole('link', { name: 'Sign in with EVE Online' })).toHaveAttribute('href', '/api/eve-sso-start');
  await expect(page.getByText('Corporation state')).toHaveCount(0);
  expect(commandRequests).toEqual([]);
  await assertNoBrowserDiagnostics();
});

test('shows unauthorized corporation state without command data surfaces', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);

  await installCommandSurfaceApiFixtures(page, {
    sessionState: {
      signedIn: false,
      scopeSource: 'unauthorized',
      characterId: '2110000001',
      characterName: 'Ari Voss',
      corporationId: '123456789',
      corporationName: 'Other Corp',
      reason: 'Signed EVE session is not authorized for this corporation'
    }
  });

  await page.goto('/');

  await expect(page.getByLabel('Gryyk-47 access gate')).toBeVisible();
  await expectVisibleText(page, 'Other Corp is not authorized for this command scope.');
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  await expect(page.getByText('Corporation state')).toHaveCount(0);
  await assertNoBrowserDiagnostics();
});
