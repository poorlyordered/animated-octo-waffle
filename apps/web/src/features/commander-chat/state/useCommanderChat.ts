import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type {
  CommanderChatMessage,
  CommanderChatSession,
  CreateDecisionFromCommanderChatResponse,
  SendCommanderChatMessageResponse
} from '@gryyk/contracts';
import {
  createDecisionFromCommanderChat,
  getCommanderChat,
  listCommanderChats,
  sendCommanderChatMessage
} from '../services/commanderChatClient';

interface CommanderChatState {
  error: string | null;
  loading: boolean;
  sending: boolean;
  sessions: CommanderChatSession[];
  activeSession: CommanderChatSession | null;
  messages: CommanderChatMessage[];
  aiSdkStatus: string;
  refresh: () => Promise<void>;
  openSession: (sessionId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<SendCommanderChatMessageResponse>;
  createDecision: (messageId: string, draftDecisionId: string) => Promise<CreateDecisionFromCommanderChatResponse>;
}

export function useCommanderChat(): CommanderChatState {
  const [state, setState] = useState<{
    error: string | null;
    loading: boolean;
    sending: boolean;
    sessions: CommanderChatSession[];
    activeSession: CommanderChatSession | null;
    messages: CommanderChatMessage[];
  }>({
    error: null,
    loading: true,
    sending: false,
    sessions: [],
    activeSession: null,
    messages: []
  });

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/commander-chat' }), []);
  const aiSdkChat = useChat({ transport });

  const refresh = useCallback(async () => {
    const response = await listCommanderChats();
    setState((current) => ({ ...current, error: null, loading: false, sessions: response.sessions }));
  }, []);

  const openSession = useCallback(async (sessionId: string) => {
    const response = await getCommanderChat(sessionId);
    setState((current) => ({
      ...current,
      error: null,
      loading: false,
      activeSession: response.session,
      messages: response.messages
    }));
  }, []);

  useEffect(() => {
    let active = true;
    listCommanderChats()
      .then((response) => {
        if (active) {
          setState((current) => ({ ...current, error: null, loading: false, sessions: response.sessions }));
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState((current) => ({
            ...current,
            error: error instanceof Error ? error.message : 'Unable to load commander chats.',
            loading: false
          }));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    aiSdkStatus: aiSdkChat.status,
    refresh,
    openSession,
    sendMessage: async (message) => {
      setState((current) => ({ ...current, sending: true, error: null }));
      try {
        const response = await sendCommanderChatMessage({
          sessionId: state.activeSession?.id,
          message
        });
        const list = await listCommanderChats();
        setState((current) => ({
          ...current,
          sending: false,
          sessions: list.sessions,
          activeSession: response.session,
          messages: response.messages,
          error: null
        }));
        return response;
      } catch (error) {
        setState((current) => ({
          ...current,
          sending: false,
          error: error instanceof Error ? error.message : 'Unable to send commander chat message.'
        }));
        throw error;
      }
    },
    createDecision: async (messageId, draftDecisionId) => {
      if (!state.activeSession) {
        throw new Error('Open a commander chat before creating a decision.');
      }
      const response = await createDecisionFromCommanderChat(state.activeSession.id, { messageId, draftDecisionId });
      await openSession(state.activeSession.id);
      return response;
    }
  };
}
