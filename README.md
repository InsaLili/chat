Web Chat UI

A streaming chat interface built with Next.js, Tailwind CSS, and the Vercel AI SDK.

---

## Task 1 — Chat page layout + streaming hook

Wired up the frontend to the OpenAI API using the Vercel AI SDK v6 streaming pipeline.

### API route (`app/api/chat/route.ts`)

```ts
const { messages }: { messages: UIMessage[] } = await req.json();

const result = streamText({
  model: openai('gpt-4o-mini'),
  system: systemPrompt || 'You are a helpful assistant.',
  messages: await convertToModelMessages(messages),
});

return result.toUIMessageStreamResponse();
```

**Key concepts:**

- **UI messages vs Model messages** — The frontend uses `UIMessage` (has `.parts`, `.id`, metadata). The model API expects a flat `ModelMessage` format (`{ role, content }`). `convertToModelMessages` bridges the two. Managing this gap between app format and model format is a recurring pattern in AI engineering.
- **`toUIMessageStreamResponse()`** — Returns a structured stream with text deltas, step boundaries, finish reason, and token usage. This is what powers the `useChat` hook's state on the client. Different from a plain text stream — it carries metadata the UI needs.

### `useChat` hook (`app/components/Chat.tsx`)

```ts
const { messages, sendMessage, status, stop, error, regenerate } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});
```

One hook manages the entire chat lifecycle:

| Property     | What it does                                                                              |
| ------------ | ----------------------------------------------------------------------------------------- |
| `messages`   | Full conversation history, updated token-by-token as the stream arrives                   |
| `status`     | `'ready'` / `'submitted'` / `'streaming'` / `'error'` — maps to the LLM request lifecycle |
| `stop`       | Aborts the stream mid-generation (saves tokens + improves UX)                             |
| `regenerate` | Retries the last assistant message                                                        |

**Why this matters for AI engineering:** LLMs are stateless — the full conversation history is re-sent on every request. The `useChat` hook handles this automatically. Understanding that statefulness lives in the client, not the model, is foundational.

---

## Task 2 — Component structure

Refactored into a clean component tree with the `'use client'` boundary pushed as far down as possible.

```
app/
├── page.tsx                  ← Server Component, renders <Chat />
├── api/chat/route.ts         ← Streaming API route
└── components/
    ├── Chat.tsx              ← 'use client' — owns useChat state, passes props down
    ├── MessageList.tsx       ← Pure display: maps messages, thinking indicator, error state
    ├── MessageBubble.tsx     ← Single message: role badge + bubble styling
    └── ChatInput.tsx         ← 'use client' — owns textarea state, auto-grow, submit logic
```

**Key decisions:**

- `page.tsx` stays a server component — no JavaScript shipped for the outer shell
- `'use client'` boundary is at `Chat.tsx`, not at the page level
- `MessageList` and `MessageBubble` are pure display components with no hooks — stateless and easy to extend
- `ChatInput` has its own `'use client'` since it owns local input state independently of the chat

---

## Running locally

```bash
# Add your OpenAI key
echo "OPENAI_API_KEY=sk-..." > .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
