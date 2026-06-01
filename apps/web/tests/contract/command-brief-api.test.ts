import { commandBriefResponseSchema } from '@gryyk/contracts';
import { processedBrief } from '../fixtures/commandBrief';

describe('GET /api/command-brief contract', () => {
  it('accepts a processed command brief response with provenance metadata', () => {
    const parsed = commandBriefResponseSchema.parse({ brief: processedBrief });

    expect(parsed.brief?.promptVersion).toBe('official-news-brief-v1');
    expect(parsed.brief?.sourceReferences).toHaveLength(1);
  });

  it('accepts an empty command brief response', () => {
    expect(commandBriefResponseSchema.parse({ brief: null })).toEqual({ brief: null });
  });
});
