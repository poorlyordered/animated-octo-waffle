import type { CommandBrief, OperatingLegCoverage } from '@gryyk/contracts';

export function deriveCoverage(brief: Pick<CommandBrief, 'sourceCount' | 'strategicImpacts' | 'recommendedActions'>): OperatingLegCoverage {
  const opportunityPresent =
    brief.sourceCount > 0 || brief.strategicImpacts.length > 0 || brief.recommendedActions.length > 0;
  const missingReasons: string[] = [];

  missingReasons.push('Numbers data is not part of this processed brief.');

  if (!opportunityPresent) {
    missingReasons.push('Opportunity data is not part of this processed brief.');
  }

  missingReasons.push('People data is not part of this processed brief.');

  return {
    numbers: 'missing',
    opportunity: opportunityPresent ? 'present' : 'missing',
    people: 'missing',
    missingReasons
  };
}
