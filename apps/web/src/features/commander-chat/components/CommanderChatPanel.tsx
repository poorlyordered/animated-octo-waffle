import { useState } from 'react';
import type { CommanderChatMessage, CommanderChatSession } from '@gryyk/contracts';

interface CommanderChatPanelProps {
  error: string | null;
  loading: boolean;
  sending: boolean;
  sessions: CommanderChatSession[];
  activeSession: CommanderChatSession | null;
  messages: CommanderChatMessage[];
  aiSdkStatus: string;
  onOpenSession: (sessionId: string) => Promise<void>;
  onSendMessage: (message: string) => Promise<unknown>;
  onCreateDecision: (messageId: string, draftDecisionId: string) => Promise<unknown>;
}

export function CommanderChatPanel(props: CommanderChatPanelProps) {
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    setMessage('');
    await props.onSendMessage(trimmed);
  }

  return (
    <section className="command-section commander-chat" aria-labelledby="commander-chat-title">
      <div className="section-heading">
        <p className="eyebrow">M60 Commander Chat</p>
        <h2 id="commander-chat-title">Commander Chat</h2>
        <p className="section-summary">
          Ask questions over command state, inspect cited evidence, and draft proposed decisions without execution.
        </p>
      </div>

      {props.error ? <p className="error">{props.error}</p> : null}

      <div className="chat-layout">
        <aside className="chat-sessions" aria-label="Recent commander chat sessions">
          <h3>Recent Chats</h3>
          {props.loading ? <p className="muted">Loading chats...</p> : null}
          {props.sessions.length === 0 && !props.loading ? <p className="muted">No commander chats recorded yet.</p> : null}
          <div className="stack">
            {props.sessions.map((session) => (
              <button
                className={props.activeSession?.id === session.id ? 'session-button active' : 'session-button'}
                key={session.id}
                onClick={() => void props.onOpenSession(session.id)}
                type="button"
              >
                <span>{session.title}</span>
                <small>{new Date(session.lastMessageAt).toLocaleString()}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="chat-thread">
          <div className="chat-status">
            <span>AI SDK UI status: {props.aiSdkStatus}</span>
            <span>{props.activeSession ? props.activeSession.title : 'New chat'}</span>
          </div>

          <div className="messages" aria-live="polite">
            {props.messages.length === 0 ? (
              <p className="notice">Start with a command question like "What changed after the latest intelligence refresh?"</p>
            ) : null}
            {props.messages.map((item) => (
              <article className={`chat-message ${item.role}`} key={item.id}>
                <p className="message-role">{item.role === 'assistant' ? 'Gryyk-47' : 'Commander'}</p>
                <p>{item.content}</p>
                {item.metadata ? <AssistantMetadata message={item} onCreateDecision={props.onCreateDecision} /> : null}
              </article>
            ))}
          </div>

          <form className="chat-form" onSubmit={submit}>
            <textarea
              aria-label="Commander chat message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about refresh runs, command briefs, decisions, people, numbers, or opportunity..."
              value={message}
            />
            <button disabled={props.sending || !message.trim()} type="submit">
              {props.sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <p className="notice">
        Commander Chat is advisory. Draft decisions require an explicit create action; no workers, ESI fetches, EVE writes, queue creation, retries, or external mutations run from chat.
      </p>
    </section>
  );
}

function AssistantMetadata(props: {
  message: CommanderChatMessage;
  onCreateDecision: (messageId: string, draftDecisionId: string) => Promise<unknown>;
}) {
  const metadata = props.message.metadata;
  if (!metadata) {
    return null;
  }

  return (
    <div className="assistant-metadata">
      <p className="muted">
        {metadata.provider} / {metadata.model} / {metadata.promptVersion}
      </p>
      {metadata.citations.length > 0 ? (
        <div>
          <h4>Citations</h4>
          <ul>
            {metadata.citations.map((citation, index) => (
              <li key={`${citation.sourceType}-${citation.sourceId ?? index}`}>
                <strong>{citation.label}</strong>: {citation.summary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {metadata.missingData.length > 0 ? (
        <p className="notice">Missing data: {metadata.missingData.join('; ')}</p>
      ) : null}
      {metadata.draftDecision ? (
        <div className="draft-decision">
          <h4>Draft Decision</h4>
          <p><strong>{metadata.draftDecision.title}</strong></p>
          <p>{metadata.draftDecision.rationale}</p>
          <p>{metadata.draftDecision.expectedResult}</p>
          <button
            onClick={() => void props.onCreateDecision(props.message.id, metadata.draftDecision!.id)}
            type="button"
          >
            Create Proposed Decision
          </button>
        </div>
      ) : null}
    </div>
  );
}
