'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function Chat() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isStreaming = status === 'submitted' || status === 'streaming';

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <MessageList
        messages={messages}
        isSubmitted={status === 'submitted'}
        error={error ?? null}
        onRetry={regenerate}
      />
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stop}
      />
    </div>
  );
}
