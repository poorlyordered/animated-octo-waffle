import { describe, expect, it } from 'vitest';
import { deriveCoverage } from '../../src/features/command-brief/services/coverage';

describe('deriveCoverage', () => {
  it('marks opportunity present when source or strategic output exists', () => {
    const coverage = deriveCoverage({
      sourceCount: 1,
      strategicImpacts: [],
      recommendedActions: []
    });

    expect(coverage.opportunity).toBe('present');
    expect(coverage.numbers).toBe('missing');
    expect(coverage.people).toBe('missing');
  });

  it('marks all legs missing when no operating data exists', () => {
    const coverage = deriveCoverage({
      sourceCount: 0,
      strategicImpacts: [],
      recommendedActions: []
    });

    expect(coverage.opportunity).toBe('missing');
    expect(coverage.missingReasons).toHaveLength(3);
  });
});
