import { buildDecisionRecordListQuery } from '../../../../netlify/functions/_shared/decision-record-store';

describe('decision record store filters', () => {
  it('builds bounded query filters for decision status and source domains', () => {
    expect(buildDecisionRecordListQuery('917701062', { status: 'approved', source: 'people' })).toEqual({
      corporationId: '917701062',
      status: 'approved',
      'sourceContext.sourceType': 'people_follow_up'
    });

    expect(buildDecisionRecordListQuery('917701062', { source: 'numbers' })).toEqual({
      corporationId: '917701062',
      'sourceContext.sourceType': 'numbers_follow_up'
    });
  });

  it('keeps legacy brief decisions in the Opportunity source filter', () => {
    expect(buildDecisionRecordListQuery('917701062', { source: 'opportunity', sourceBriefId: 'brief-1' })).toEqual({
      corporationId: '917701062',
      $and: [
        {
          $or: [{ sourceBriefId: 'brief-1' }, { researchBriefId: 'brief-1' }]
        },
        {
          $or: [
            { sourceContext: { $exists: false } },
            { 'sourceContext.sourceType': { $exists: false } },
            { 'sourceContext.sourceType': 'research_brief' }
          ]
        }
      ]
    });
  });
});
