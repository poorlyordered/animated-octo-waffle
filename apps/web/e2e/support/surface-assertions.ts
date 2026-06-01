import { expect, type Page } from '@playwright/test';

export const forbiddenExecutionLanguage = [
  /roles? (changed|updated|mutated)/i,
  /access (changed|updated|granted|revoked)/i,
  /eve action (completed|executed|performed)/i,
  /queue (dispatched|executed)/i,
  /external service (updated|changed|completed)/i,
  /standings? (changed|updated)/i,
  /wallet (changed|updated|transferred)/i
];

export async function expectForbiddenTextAbsent(page: Page, patterns = forbiddenExecutionLanguage) {
  const text = await page.locator('body').innerText();

  for (const pattern of patterns) {
    expect(text, `Forbidden command execution language matched ${pattern}`).not.toMatch(pattern);
  }
}

export async function expectHeading(page: Page, name: string | RegExp) {
  await expect(page.getByRole('heading', { exact: typeof name === 'string', name })).toBeVisible();
}

export async function expectNonBlankSurface(page: Page, label: string) {
  const text = (await page.locator('body').innerText()).trim();
  expect(text, `${label} should render visible page text`).not.toHaveLength(0);
}

export async function expectVisibleText(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible();
}
