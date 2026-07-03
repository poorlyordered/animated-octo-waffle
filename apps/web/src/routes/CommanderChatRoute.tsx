import { CommanderChatPanel } from '../features/commander-chat/components/CommanderChatPanel';
import { useCommanderChat } from '../features/commander-chat/state/useCommanderChat';

export function CommanderChatRoute() {
  const chat = useCommanderChat();

  return (
    <CommanderChatPanel
      activeSession={chat.activeSession}
      aiSdkStatus={chat.aiSdkStatus}
      error={chat.error}
      loading={chat.loading}
      messages={chat.messages}
      onCreateDecision={chat.createDecision}
      onOpenSession={chat.openSession}
      onSendMessage={chat.sendMessage}
      sending={chat.sending}
      sessions={chat.sessions}
    />
  );
}
