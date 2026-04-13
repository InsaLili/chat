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
    ├── MarkdownContent.tsx   ← Renders assistant message text as Markdown
    └── ChatInput.tsx         ← 'use client' — owns textarea state, auto-grow, submit logic
```

**Key decisions:**

- `page.tsx` stays a server component — no JavaScript shipped for the outer shell
- `'use client'` boundary is at `Chat.tsx`, not at the page level
- `MessageList` and `MessageBubble` are pure display components with no hooks — stateless and easy to extend
- `ChatInput` has its own `'use client'` since it owns local input state independently of the chat

### Task 2.1 — ChatInput polish

- Auto-grow moved from an `onInput` DOM event handler to a `useEffect` watching `input` state — height stays in sync with React's state, including auto-reset on send
- Send/Stop text labels replaced with SVG icon buttons; textarea is no longer disabled during streaming so the user can type ahead
- Minor UX tweaks: taller max height, smooth height transition

---

## Task 3 — Markdown rendering for assistant messages

OpenAI returns plain text that uses Markdown syntax (e.g. `**bold**`, fenced code blocks, tables). Previously these rendered as raw characters. Now assistant messages are parsed and displayed as formatted Markdown.

### How it works

- OpenAI sends a plain text string — no styling metadata, just Markdown conventions baked into the text
- `MessageBubble` routes assistant text parts through `MarkdownContent` and renders user messages as plain `whitespace-pre-wrap` text (users don't write Markdown)
- `MarkdownContent` uses `react-markdown` with `remarkGfm` to parse the string into HTML

### Library roles

| Library | Role |
|---|---|
| `react-markdown` | Parses CommonMark syntax and renders React elements |
| `remarkGfm` | Extends CommonMark with GFM: tables, strikethrough, task lists, autolinks |
| `@tailwindcss/typography` | `prose` base styles for headings, paragraphs, lists |
| `components` prop | Overrides `<code>` and `<pre>` with custom Tailwind styling for inline code and code blocks |

---

## Running locally

```bash
# Add your OpenAI key
echo "OPENAI_API_KEY=sk-..." > .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
