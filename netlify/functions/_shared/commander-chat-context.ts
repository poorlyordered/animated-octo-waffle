import type { Db } from 'mongodb';
import type { CommanderChatCitation, CommanderChatMessage } from '../../../packages/contracts/src/index';
import type { CommanderChatEnv } from './env';
import { normalizeCommandBriefDocument } from './command-brief-normalizer';
import { normalizeNumbersDocument } from './numbers-normalizer';
import { normalizeCommanderChatMessage } from './commander-chat-store';
import { normalizeDecisionRecordDocument } from './decision-record-normalizer';
import { refreshRunSummary, type IntelligenceRefreshRunDocument } from './intelligence-refresh-store';

export interface CommanderChatContext {
  summary: string;
  citations: CommanderChatCitation[];
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function buildCommanderChatContext(input: {
  db: Db;
  corporationId: string;
  history: CommanderChatMessage[];
  env: Pick<CommanderChatEnv, 'maxContextChars' | 'maxHistoryMessages'>;
}): Promise<CommanderChatContext> {
  const citations: CommanderChatCitation[] = [];
  const sections: string[] = [];

  await addCommandBrief(input.db, input.corporationId, citations, sections);
  await addLatestRefresh(input.db, input.corporationId, citations, sections);
  await addNumbers(input.db, input.corporationId, citations, sections);
  await addDecisions(input.db, input.corporationId, citations, sections);
  await addOperations(input.db, input.corporationId, citations, sections);

  if (citations.length === 0) {
    citations.push({
      sourceType: 'missing_data',
      label: 'Missing command context',
      summary: 'No current command records were available for this chat response.',
      freshness: 'missing'
    });
    sections.push('Missing command context: no current command records were available.');
  }

  const history = input.history
    .slice(-input.env.maxHistoryMessages)
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content.slice(0, 2000) }));

  return {
    summary: sections.join('\n').slice(0, input.env.maxContextChars),
    citations: citations.slice(0, 20),
    history
  };
}

async function addCommandBrief(db: Db, corporationId: string, citations: CommanderChatCitation[], sections: string[]) {
  const document = await db.collection('research_briefs').findOne({ corporationId }, { sort: { createdAt: -1, timestamp: -1 } });
  if (!document) {
    sections.push('Command brief: missing.');
    return;
  }
  const brief = normalizeCommandBriefDocument(document);
  citations.push({
    sourceType: 'command_brief',
    sourceId: brief.id,
    label: `Command brief ${brief.focus}`,
    summary: brief.executiveSummary,
    createdAt: brief.createdAt,
    freshness: 'current'
  });
  sections.push(`Command brief (${brief.createdAt}): ${brief.executiveSummary}`);
  if (brief.recommendedActions.length > 0) {
    sections.push(`Recommendations: ${brief.recommendedActions.join('; ')}`);
  }
  if (brief.watchlist.length > 0) {
    sections.push(`Watchlist: ${brief.watchlist.join('; ')}`);
  }
}

async function addLatestRefresh(db: Db, corporationId: string, citations: CommanderChatCitation[], sections: string[]) {
  const document = await db.collection('intelligence_refresh_runs').findOne({ corporationId }, { sort: { createdAt: -1 } });
  if (!document) {
    sections.push('Intelligence refresh: missing.');
    return;
  }
  const run = refreshRunSummary(document as unknown as IntelligenceRefreshRunDocument);
  citations.push({
    sourceType: 'intelligence_refresh_run',
    sourceId: run.id,
    label: `Refresh run ${run.status}`,
    summary: `Domains ${run.requestedDomains.join(', ')} are ${run.status}.`,
    createdAt: run.createdAt,
    freshness: run.status === 'completed' || run.status === 'completed_with_warnings' ? 'current' : 'unknown'
  });
  sections.push(`Latest refresh ${run.id}: ${run.status}; domains ${run.requestedDomains.join(', ')}.`);
}

async function addNumbers(db: Db, corporationId: string, citations: CommanderChatCitation[], sections: string[]) {
  const document = await db.collection('numbers_snapshots').findOne({ corporationId }, { sort: { createdAt: -1 } });
  if (!document) {
    sections.push('Numbers snapshot: missing.');
    return;
  }
  const snapshot = normalizeNumbersDocument(document);
  const summary = [
    ...snapshot.observations.slice(0, 2),
    ...snapshot.risks.slice(0, 1),
    ...snapshot.opportunities.slice(0, 1)
  ].join(' ') || `Numbers snapshot ${snapshot.focus}`;
  citations.push({
    sourceType: 'numbers_snapshot',
    sourceId: snapshot.id,
    label: 'Latest Numbers snapshot',
    summary,
    createdAt: snapshot.createdAt,
    freshness: 'current'
  });
  sections.push(`Numbers: ${summary}`);
}

async function addDecisions(db: Db, corporationId: string, citations: CommanderChatCitation[], sections: string[]) {
  const documents = await db.collection('strategic_decisions').find({ corporationId }).sort({ updatedAt: -1 }).limit(5).toArray();
  if (documents.length === 0) {
    sections.push('Decision records: none found.');
    return;
  }
  const decisions = documents.map((document) => normalizeDecisionRecordDocument(document));
  citations.push({
    sourceType: 'decision_record',
    sourceId: decisions[0]?.id,
    label: 'Recent Decision Records',
    summary: `${decisions.length} recent decision records loaded.`,
    createdAt: decisions[0]?.updatedAt,
    freshness: 'current'
  });
  sections.push(`Recent decisions: ${decisions.map((decision) => `${decision.status}: ${decision.sourceRecommendation}`).join('; ')}`);
}

async function addOperations(db: Db, corporationId: string, citations: CommanderChatCitation[], sections: string[]) {
  const retryCount = await db.collection('retry_requests').countDocuments({ corporationId, status: { $in: ['scheduled', 'blocked'] } });
  const queueCount = await db.collection('automation_queue').countDocuments({ corporationId, status: { $in: ['queued', 'approved'] } });
  citations.push({
    sourceType: 'operations_health',
    label: 'Operations posture',
    summary: `${queueCount} queued/approved automation items and ${retryCount} scheduled/blocked retries.`,
    freshness: 'current'
  });
  sections.push(`Operations: ${queueCount} queued/approved automation items; ${retryCount} scheduled/blocked retries.`);
}

export function safeHistoryFromDocuments(documents: unknown[]): CommanderChatMessage[] {
  return documents.map((document) => normalizeCommanderChatMessage(document as Parameters<typeof normalizeCommanderChatMessage>[0]));
}
