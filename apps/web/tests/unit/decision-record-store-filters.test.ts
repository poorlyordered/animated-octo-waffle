import { buildDecisionRecordListQuery, buildDecisionRecordPagination } from '../../../../netlify/functions/_shared/decision-record-store';

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

  it('builds clamped backend pagination metadata', () => {
    expect(buildDecisionRecordPagination(8, 2, 3)).toEqual({
      endIndex: 6,
      page: 2,
      pageSize: 3,
      startIndex: 4,
      totalItems: 8,
      totalPages: 3
    });

    expect(buildDecisionRecordPagination(0, 99, 5)).toEqual({
      endIndex: 0,
      page: 1,
      pageSize: 5,
      startIndex: 0,
      totalItems: 0,
      totalPages: 1
    });
  });
});
