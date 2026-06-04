import type { CommandBrief, OpportunityIngestionProvenance, ResearchRequest } from '@gryyk/contracts';

export const processedBrief: CommandBrief = {
  id: 'brief-1',
  corporationId: '917701062',
  focus: 'grykk-47-eve-official-news',
  createdAt: '2026-05-31T11:47:03.120Z',
  model: 'google/gemma-4-31b-it',
  promptVersion: 'official-news-brief-v1',
  sourceCount: 1,
  sourceReferences: [
    {
      title: 'Expansion patch notes',
      url: 'https://www.eveonline.com/news/view/example'
    }
  ],
  confidence: 0.82,
  executiveSummary: 'Official news indicates near-term changes commanders should monitor.',
  briefMarkdown: '## Official EVE News Brief',
  strategicImpacts: ['Expansion changes may shift recruiting and staging priorities.'],
  recommendedActions: ['Review member readiness for the affected activity type.'],
  watchlist: ['Patch notes follow-up'],
  memory: ['Track official expansion changes as opportunity inputs.'],
  coverage: {
    numbers: 'missing',
    opportunity: 'present',
    people: 'missing',
    missingReasons: [
      'Numbers data is not part of this processed brief.',
      'People data is not part of this processed brief.'
    ]
  }
};

export const processedRequest: ResearchRequest = {
  id: 'request-1',
  corporationId: '917701062',
  focus: 'grykk-47-eve-official-news',
  status: 'processed',
  createdAt: '2026-05-31T11:46:12.603Z',
  updatedAt: '2026-05-31T11:47:01.110Z',
  requestedBy: '1793798962',
  errorMessage: null
};

export const processingRequest: ResearchRequest = {
  ...processedRequest,
  id: 'request-2',
  status: 'processing',
  createdAt: '2026-05-31T12:00:00.000Z',
  updatedAt: '2026-05-31T12:00:00.000Z'
};

export const failedRequest: ResearchRequest = {
  ...processedRequest,
  id: 'request-3',
  status: 'failed',
  createdAt: '2026-05-31T12:00:00.000Z',
  updatedAt: '2026-05-31T12:00:30.000Z',
  errorMessage: 'Processor timed out'
};

export const opportunityIngestionProvenance: OpportunityIngestionProvenance = {
  mode: 'latest_research',
  focus: processedBrief.focus,
  sourceCount: 1,
  briefCount: 1,
  sectionStatuses: [
    { key: 'sources', status: 'present' },
    { key: 'impacts', status: 'present' },
    { key: 'recommendations', status: 'present' },
    { key: 'watchlist', status: 'present' }
  ],
  history: [
    {
      id: processedRequest.id,
      status: 'processed',
      requestedAt: processedRequest.createdAt,
      updatedAt: processedRequest.updatedAt,
      requestedBy: processedRequest.requestedBy,
      sourceCount: 1,
      sectionStatuses: [
        { key: 'sources', status: 'present' },
        { key: 'impacts', status: 'present' },
        { key: 'recommendations', status: 'present' },
        { key: 'watchlist', status: 'present' }
      ],
      boundary:
        'Opportunity ingestion history is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services.'
    }
  ],
  message: 'Latest Opportunity context is linked to processed research history.',
  boundary:
    'Opportunity ingestion history is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services.'
};
