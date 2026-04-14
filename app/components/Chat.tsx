'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

type Props = {
  initialMessages?: UIMessage[];
  onMessagesChange?: (messages: UIMessage[]) => void;
};

export default function Chat({ initialMessages, onMessagesChange }: Props) {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: initialMessages,
    onFinish: () => {
      // Persist after assistant finishes responding
      // Use a ref to get the latest messages at callback time
      queueMicrotask(() => onMessagesChangeRef.current?.(messagesRef.current));
    },
  });

  // Refs to access latest values inside the onFinish callback
  const messagesRef = useRef(messages);
  const onMessagesChangeRef = useRef(onMessagesChange);
  messagesRef.current = messages;
  onMessagesChangeRef.current = onMessagesChange;

  // Also persist when the user sends a message (so new user messages are saved even before a response)
  const prevLengthRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user') {
        onMessagesChange?.(messages);
      }
    }
    prevLengthRef.current = messages.length;
  }, [messages, onMessagesChange]);

  const isStreaming = status === 'submitted' || status === 'streaming';

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-950">
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
