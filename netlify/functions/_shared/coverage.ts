import type { CommandBrief, OperatingLegCoverage } from '../../../packages/contracts/src/index';

interface CoverageInput {
  sourceCount: number;
  strategicImpacts: string[];
  recommendedActions: string[];
  numbersPresent?: boolean;
  peoplePresent?: boolean;
}

export function deriveOperatingLegCoverage(input: CoverageInput): OperatingLegCoverage {
  const opportunityPresent =
    input.sourceCount > 0 || input.strategicImpacts.length > 0 || input.recommendedActions.length > 0;
  const missingReasons: string[] = [];

  if (!input.numbersPresent) {
    missingReasons.push('Numbers data is not part of this processed brief.');
  }

  if (!opportunityPresent) {
    missingReasons.push('Opportunity data is not part of this processed brief.');
  }

  if (!input.peoplePresent) {
    missingReasons.push('People data is not part of this processed brief.');
  }

  return {
    numbers: input.numbersPresent ? 'present' : 'missing',
    opportunity: opportunityPresent ? 'present' : 'missing',
    people: input.peoplePresent ? 'present' : 'missing',
    missingReasons
  };
}

export function withDerivedCoverage(brief: Omit<CommandBrief, 'coverage'>): CommandBrief {
  return {
    ...brief,
    coverage: deriveOperatingLegCoverage(brief)
  };
}
