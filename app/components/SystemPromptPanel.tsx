'use client';

import { useState } from 'react';

const PRESETS = [
  { label: 'Default', prompt: '' },
  { label: 'Concise', prompt: 'You are a helpful assistant. Be concise — answer in 1-3 sentences unless the user asks for detail.' },
  { label: 'Socratic tutor', prompt: 'You are a Socratic tutor. Never give the answer directly — instead, ask guiding questions that help the user arrive at the answer themselves.' },
  { label: 'Code reviewer', prompt: 'You are a senior code reviewer. Point out bugs, security issues, and style problems. Be direct and specific. Suggest fixes with code snippets.' },
  { label: 'ELI5', prompt: 'Explain everything as if the user is 5 years old. Use simple words, analogies, and short sentences. Avoid jargon.' },
];

type Props = {
  value: string;
  onChange: (prompt: string) => void;
};

export default function SystemPromptPanel({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const activePreset = PRESETS.find((p) => p.prompt === value);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span>
          System prompt: <span className="font-medium text-zinc-700 dark:text-zinc-300">{activePreset?.label || 'Custom'}</span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="px-4 pb-3 flex flex-col gap-3">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onChange(preset.prompt)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  value === preset.prompt
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom textarea */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write a custom system prompt..."
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
