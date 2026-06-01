import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('test runner contract', () => {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const jestConfig = readFileSync(join(process.cwd(), 'jest.config.cjs'), 'utf8');

  it('keeps npm test on Jest in Node without a browser runner', () => {
    expect(packageJson.scripts.test).toContain('jest');
    expect(packageJson.scripts.test).not.toContain('playwright');
    expect(jestConfig).toContain("testEnvironment: 'node'");
  });

  it('exposes browser smoke validation as a separate command', () => {
    expect(packageJson.scripts['test:e2e']).toBe('playwright test');
    expect(packageJson.devDependencies['@playwright/test']).toBeTruthy();
  });

  it('does not depend on jsdom or Vitest for default validation', () => {
    expect(packageJson.devDependencies.jsdom).toBeUndefined();
    expect(packageJson.devDependencies.vitest).toBeUndefined();
  });
});
