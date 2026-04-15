import type { UIMessage } from 'ai';

export type Conversation = {
  id: string;
  title: string;
  messages: UIMessage[];
  systemPrompt: string;
  createdAt: number;
};

const STORAGE_KEY = 'chat-conversations';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createConversation(): Conversation {
  return {
    id: generateId(),
    title: 'New chat',
    messages: [],
    systemPrompt: '',
    createdAt: Date.now(),
  };
}

export function deriveTitle(messages: UIMessage[]): string | null {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return null;

  const text = firstUserMsg.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim();

  if (!text) return null;
  return text.length > 40 ? text.slice(0, 40) + '...' : text;
}
