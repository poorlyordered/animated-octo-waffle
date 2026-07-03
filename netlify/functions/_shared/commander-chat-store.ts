import { ObjectId, type Db } from 'mongodb';
import type {
  CommanderChatAssistantMetadata,
  CommanderChatMessage,
  CommanderChatSession
} from '../../../packages/contracts/src/index';
import {
  commanderChatMessageSchema,
  commanderChatSessionSchema
} from '../../../packages/contracts/src/index';
import { assertNoUnsafeCommanderChatMaterial, commanderChatBoundary } from './commander-chat-output';

const sessionsCollection = 'commander_chat_sessions';
const messagesCollection = 'commander_chat_messages';

interface ChatSessionDocument extends Omit<CommanderChatSession, 'id'> {
  _id?: ObjectId;
  id?: string;
}

interface ChatMessageDocument extends Omit<CommanderChatMessage, 'id'> {
  _id?: ObjectId;
  id?: string;
}

export function normalizeCommanderChatSession(document: ChatSessionDocument): CommanderChatSession {
  return commanderChatSessionSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: document.corporationId,
    commander: document.commander,
    title: document.title,
    status: document.status,
    messageCount: document.messageCount,
    lastMessageAt: isoDate(document.lastMessageAt),
    createdAt: isoDate(document.createdAt),
    updatedAt: isoDate(document.updatedAt)
  });
}

export function normalizeCommanderChatMessage(document: ChatMessageDocument): CommanderChatMessage {
  return commanderChatMessageSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    sessionId: document.sessionId,
    corporationId: document.corporationId,
    role: document.role,
    content: document.content,
    createdAt: isoDate(document.createdAt),
    metadata: document.metadata
  });
}

export async function listCommanderChatSessions(db: Db, corporationId: string, limit = 12): Promise<CommanderChatSession[]> {
  const documents = await db
    .collection(sessionsCollection)
    .find({ corporationId, status: 'active' })
    .sort({ lastMessageAt: -1 })
    .limit(Math.min(Math.max(Math.trunc(limit) || 12, 1), 25))
    .toArray();

  return documents.map((document) => normalizeCommanderChatSession(document as ChatSessionDocument));
}

export async function findCommanderChatSession(db: Db, corporationId: string, sessionId: string): Promise<CommanderChatSession | null> {
  const document = await db.collection(sessionsCollection).findOne(idFilter(sessionId, corporationId));
  return document ? normalizeCommanderChatSession(document as ChatSessionDocument) : null;
}

export async function listCommanderChatMessages(
  db: Db,
  corporationId: string,
  sessionId: string,
  limit = 40
): Promise<CommanderChatMessage[]> {
  const documents = await db
    .collection(messagesCollection)
    .find({ corporationId, sessionId })
    .sort({ createdAt: 1 })
    .limit(Math.min(Math.max(Math.trunc(limit) || 40, 1), 100))
    .toArray();

  return documents.map((document) => normalizeCommanderChatMessage(document as ChatMessageDocument));
}

export async function ensureCommanderChatSession(input: {
  db: Db;
  corporationId: string;
  commander: string;
  sessionId?: string;
  firstMessage: string;
}): Promise<CommanderChatSession> {
  if (input.sessionId) {
    const existing = await findCommanderChatSession(input.db, input.corporationId, input.sessionId);
    if (existing) {
      return existing;
    }
  }

  const now = new Date().toISOString();
  const document: ChatSessionDocument = {
    corporationId: input.corporationId,
    commander: input.commander,
    title: titleFromMessage(input.firstMessage),
    status: 'active',
    messageCount: 0,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now
  };
  const result = await input.db.collection(sessionsCollection).insertOne(document);
  return normalizeCommanderChatSession({ ...document, _id: result.insertedId });
}

export async function appendCommanderChatMessage(input: {
  db: Db;
  corporationId: string;
  sessionId: string;
  role: CommanderChatMessage['role'];
  content: string;
  metadata?: CommanderChatAssistantMetadata;
}): Promise<CommanderChatMessage> {
  assertNoUnsafeCommanderChatMaterial({ content: input.content, metadata: input.metadata }, 'message');

  const now = new Date().toISOString();
  const document: ChatMessageDocument = {
    corporationId: input.corporationId,
    sessionId: input.sessionId,
    role: input.role,
    content: input.content.trim(),
    createdAt: now,
    metadata: input.metadata
  };

  const result = await input.db.collection(messagesCollection).insertOne(document);
  await input.db.collection(sessionsCollection).updateOne(
    idFilter(input.sessionId, input.corporationId),
    {
      $inc: { messageCount: 1 },
      $set: { lastMessageAt: now, updatedAt: now }
    }
  );
  return normalizeCommanderChatMessage({ ...document, _id: result.insertedId });
}

export async function findCommanderChatMessage(
  db: Db,
  corporationId: string,
  sessionId: string,
  messageId: string
): Promise<CommanderChatMessage | null> {
  const document = await db.collection(messagesCollection).findOne({
    ...idFilter(messageId, corporationId),
    sessionId
  });
  return document ? normalizeCommanderChatMessage(document as ChatMessageDocument) : null;
}

export function commanderChatListPayload(sessions: CommanderChatSession[]) {
  return { sessions, boundary: commanderChatBoundary };
}

function idFilter(id: string, corporationId: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id), corporationId } : { id, corporationId };
}

function titleFromMessage(message: string): string {
  const normalized = message.replace(/\s+/g, ' ').trim();
  return (normalized || 'Commander chat').slice(0, 80);
}

function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date(0).toISOString();
}
