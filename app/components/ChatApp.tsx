'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UIMessage } from 'ai';
import {
  type Conversation,
  createConversation,
  deriveTitle,
  loadConversations,
  saveConversations,
} from '../lib/conversations';
import Sidebar from './Sidebar';
import SystemPromptPanel from './SystemPromptPanel';
import Chat from './Chat';

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadConversations();
    if (loaded.length > 0) {
      setConversations(loaded);
      setActiveId(loaded[0].id);
    } else {
      const first = createConversation();
      setConversations([first]);
      setActiveId(first.id);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever conversations change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveConversations(conversations);
    }
  }, [conversations, hydrated]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  function handleNew() {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  }

  function handleSelect(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function handleDelete(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      // If we deleted the active conversation, switch to the first remaining or create a new one
      if (id === activeId) {
        if (next.length > 0) {
          setActiveId(next[0].id);
        } else {
          const fresh = createConversation();
          next.push(fresh);
          setActiveId(fresh.id);
        }
      }
      return next;
    });
  }

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const title = c.title === 'New chat' ? deriveTitle(messages) ?? c.title : c.title;
          return { ...c, messages, title };
        }),
      );
    },
    [activeId],
  );

  function handleSystemPromptChange(prompt: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, systemPrompt: prompt } : c)),
    );
  }

  // Don't render until hydrated to avoid SSR/client mismatch
  if (!hydrated) return null;

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile header with hamburger */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <HamburgerIcon />
          </button>
          <span className="text-sm font-medium truncate">
            {activeConversation?.title ?? 'Chat'}
          </span>
        </div>

        {activeConversation && (
          <>
            <SystemPromptPanel
              value={activeConversation.systemPrompt}
              onChange={handleSystemPromptChange}
            />
            <Chat
              key={activeConversation.id}
              initialMessages={activeConversation.messages}
              systemPrompt={activeConversation.systemPrompt}
              onMessagesChange={handleMessagesChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
