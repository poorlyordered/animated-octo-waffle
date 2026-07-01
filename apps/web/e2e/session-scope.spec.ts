import { expect, test } from '@playwright/test';
import { installCommandSurfaceApiFixtures, installSessionApiFixture } from './fixtures/api-fixtures';
import { installBrowserDiagnostics } from './support/diagnostics';
import { expectVisibleText } from './support/surface-assertions';

test('shows login gate when command scope is not backed by a signed session', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);
  await installCommandSurfaceApiFixtures(page, {
    sessionState: {
      signedIn: false,
      scopeSource: 'fallback',
      corporationId: '917701062'
    }
  });

  await page.goto('/');

  await expectVisibleText(page, 'EVE Online corporation command operating system');
  await expect(page.getByRole('link', { name: 'Sign in with EVE' })).toBeVisible();
  await assertNoBrowserDiagnostics();
});

test('shows signed-in command scope and clears it on sign-out', async ({ page }, testInfo) => {
  const assertNoBrowserDiagnostics = installBrowserDiagnostics(page, testInfo);
  await installCommandSurfaceApiFixtures(page);
  await installSessionApiFixture(page, {
    signedIn: true,
    scopeSource: 'session',
    characterId: '2110000001',
    characterName: 'Ari Voss',
    corporationId: '123456789',
    corporationName: 'Session Corp',
    expiresAt: '2099-06-01T00:00:00.000Z'
  });

  await page.goto('/');

  await expectVisibleText(page, 'Signed in');
  await expectVisibleText(page, 'Ari Voss');
  await expectVisibleText(page, 'Session Corp');

  await page.getByRole('button', { name: 'Sign out' }).click();

  await expectVisibleText(page, 'EVE Online corporation command operating system');
  await expect(page.getByRole('link', { name: 'Sign in with EVE' })).toBeVisible();
  await assertNoBrowserDiagnostics();
});
