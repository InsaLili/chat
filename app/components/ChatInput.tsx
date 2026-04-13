'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
};

export default function ChatInput({ onSend, isStreaming, onStop }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: recalculate on every input change, reset when empty
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput(''); // useEffect will reset height to auto → single row
  }

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="max-w-3xl mx-auto px-4 py-4 flex gap-3 items-end"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 max-h-48 overflow-y-auto transition-[height]"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop generating"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <StopIcon />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            title="Send message"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-300 dark:text-zinc-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SendIcon />
          </button>
        )}
      </form>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}
