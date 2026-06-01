import type { Page, TestInfo } from '@playwright/test';

export function installBrowserDiagnostics(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? 'failed'}`);
  });

  return async function assertNoBrowserDiagnostics() {
    const diagnostics = [
      ...consoleErrors.map((message) => `console error: ${message}`),
      ...pageErrors.map((message) => `page error: ${message}`),
      ...failedRequests.map((message) => `request failed: ${message}`)
    ];

    if (diagnostics.length > 0) {
      await testInfo.attach('browser-diagnostics', {
        body: diagnostics.join('\n'),
        contentType: 'text/plain'
      });
      throw new Error(`Browser diagnostics failed:\n${diagnostics.join('\n')}`);
    }
  };
}
