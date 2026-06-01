import { describe, expect, it } from 'vitest';
import { readScopeEnv } from '../../../../netlify/functions/_shared/env';

describe('readScopeEnv', () => {
  it('reads corporation scope from server-owned environment', () => {
    expect(readScopeEnv({ EVEONLINE_CORPORATION_ID: '917701062' }).corporationId).toBe('917701062');
  });

  it('rejects missing server-owned corporation scope', () => {
    expect(() => readScopeEnv({})).toThrow('EVEONLINE_CORPORATION_ID is required');
  });
});
