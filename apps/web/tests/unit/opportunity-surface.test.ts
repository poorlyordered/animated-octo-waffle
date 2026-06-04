import type { CommandBriefViewModel } from '@gryyk/contracts';
import { deriveOpportunityDecisionHandoff, deriveOpportunitySurface } from '../../src/features/opportunity/services/opportunitySurface';
import { opportunityIngestionProvenance, processedBrief, processedRequest } from '../fixtures/commandBrief';
import { proposedDecision } from '../fixtures/decisionRecords';

describe('Opportunity surface view model', () => {
  it('derives first-class Opportunity sections from processed command brief state', () => {
    const viewModel: CommandBriefViewModel = {
      brief: processedBrief,
      request: processedRequest,
      opportunityProvenance: opportunityIngestionProvenance,
      displayState: 'processed'
    };

    const opportunity = deriveOpportunitySurface(viewModel);

    expect(opportunity.summary).toBe(processedBrief.executiveSummary);
    expect(opportunity.strategicImpacts).toEqual(processedBrief.strategicImpacts);
    expect(opportunity.recommendedActions).toEqual(processedBrief.recommendedActions);
    expect(opportunity.watchlist).toEqual(processedBrief.watchlist);
    expect(opportunity.coverageState).toBe('present');
    expect(opportunity.provenance?.mode).toBe('latest_research');
    expect(opportunity.boundary).toContain('does not schedule research pulls');
  });

  it('derives a read-only unavailable state when no brief exists', () => {
    const viewModel: CommandBriefViewModel = {
      brief: null,
      request: null,
      opportunityProvenance: null,
      displayState: 'empty'
    };

    const opportunity = deriveOpportunitySurface(viewModel);

    expect(opportunity.summary).toContain('No processed Opportunity context');
    expect(opportunity.sourceCount).toBe(0);
    expect(opportunity.coverageState).toBe('missing');
    expect(opportunity.boundary).toContain('does not schedule research pulls');
    expect(JSON.stringify(opportunity)).not.toContain('token');
    expect(JSON.stringify(opportunity)).not.toContain('dispatchTarget');
  });

  it('derives Opportunity decision handoff metadata with provenance context', () => {
    const opportunity = deriveOpportunitySurface({
      brief: processedBrief,
      request: processedRequest,
      opportunityProvenance: opportunityIngestionProvenance,
      displayState: 'processed'
    });

    const handoff = deriveOpportunityDecisionHandoff(
      {
        ...proposedDecision,
        id: 'decision-opportunity-1',
        sourceBriefId: processedBrief.id,
        sourceRecommendation: processedBrief.recommendedActions[0],
        sourceProvenance: {
          ...proposedDecision.sourceProvenance,
          briefId: processedBrief.id,
          focus: processedBrief.focus,
          sourceCount: processedBrief.sourceCount
        }
      },
      opportunity
    );

    expect(handoff.decisionStatus).toBe('proposed');
    expect(handoff.sourceBriefId).toBe(processedBrief.id);
    expect(handoff.provenanceMode).toBe('latest_research');
    expect(handoff.focus).toBe(processedBrief.focus);
    expect(handoff.boundary).toContain('Approval, queueing');
    expect(JSON.stringify(handoff)).not.toContain('dispatchTarget');
  });

  it('derives Opportunity decision handoff metadata without provenance', () => {
    const opportunity = deriveOpportunitySurface({
      brief: processedBrief,
      request: null,
      opportunityProvenance: null,
      displayState: 'processed'
    });

    const handoff = deriveOpportunityDecisionHandoff(
      {
        ...proposedDecision,
        sourceBriefId: processedBrief.id,
        sourceRecommendation: processedBrief.recommendedActions[0],
        sourceProvenance: {
          ...proposedDecision.sourceProvenance,
          briefId: processedBrief.id,
          focus: processedBrief.focus
        }
      },
      opportunity
    );

    expect(handoff.provenanceMode).toBe('unavailable');
    expect(handoff.focus).toBe(processedBrief.focus);
  });
});
