# ChatGPT Clone — Implementation Plan

## Context
Build a ChatGPT-style chat interface from scratch in an empty Next.js project. The app uses the Vercel AI SDK for streaming, OpenAI for the model, and includes a sidebar with system prompt editing, token counting, and conversation summarization.

---

## Stack
- **Next.js 14+** (App Router, TypeScript, Tailwind CSS)
- **`ai`** — Vercel AI SDK (`useChat`, `streamText`, `generateText`)
- **`@ai-sdk/openai`** — OpenAI provider for the Vercel AI SDK
- **`react-markdown` + `remark-gfm`** — render assistant markdown
- **`@tailwindcss/typography`** — prose styling for markdown output

---

## Project Structure

```
app/
  layout.tsx
  page.tsx
  globals.css
  api/
    chat/route.ts          # streamText + toDataStreamResponse()
    summarize/route.ts     # generateText (non-streaming)

components/
  ChatShell.tsx            # owns useChat, all state flows down from here
  chat/
    ChatWindow.tsx         # message list + auto-scroll
    ChatMessage.tsx        # bubble + markdown + copy + regenerate
    ChatInput.tsx          # textarea, send/stop, regenerate button
    CopyButton.tsx         # clipboard with checkmark feedback
  sidebar/
    Sidebar.tsx
    SystemPromptEditor.tsx # textarea bound to systemPrompt state
    SummaryPanel.tsx       # "Summarize" button + result display
    TokenCounter.tsx       # live token count

hooks/
  useTokenCount.ts         # useMemo over estimateMessagesTokens()
  useCopyToClipboard.ts    # clipboard + timeout state

lib/
  tokenizer.ts             # ~4 chars/token approximation, no extra deps
  utils.ts                 # cn() classname helper
```

---

## Key Implementation Details

### 1. Scaffold
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install ai @ai-sdk/openai react-markdown remark-gfm @tailwindcss/typography
```

### 2. Streaming Route — `app/api/chat/route.ts`
```ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt || 'You are a helpful assistant.',
    messages,
  });
  return result.toTextStreamResponse(); // ai v6: use toTextStreamResponse()
}
```

### 3. `ChatShell.tsx` — State Root
```ts
const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
const { messages, input, handleInputChange, handleSubmit,
        isLoading, reload, stop, setMessages } = useChat({
  api: '/api/chat',
  body: { systemPrompt }, // injected into every POST body
});
```
All feature props flow down from here. No other component calls `useChat`.

### 4. Streaming Cursor
In `ChatMessage.tsx`, show a blinking cursor when `isLoading && isLastMessage && role === 'assistant'`.

### 5. Copy Button
`useCopyToClipboard` hook: `navigator.clipboard.writeText(text)`, set `copied=true`, reset after 2s. Overlay on message bubble, visible on hover (`group-hover:opacity-100 opacity-0`).

### 6. Regenerate
Call `reload()` from `useChat` — no extra API call needed. It strips the last assistant message and re-sends. Guard: only show button when `messages.length >= 2 && !isLoading && lastMessage.role === 'assistant'`.

### 7. System Prompt Editor
`<textarea>` bound to `systemPrompt` state in `ChatShell`. Passed into `useChat`'s `body` option so it's included in every request without polluting the messages array.

### 8. Token Counter — `lib/tokenizer.ts`
```ts
export function estimateMessagesTokens(messages, systemPrompt): number {
  const systemTokens = Math.ceil(systemPrompt.length / 4);
  const msgTokens = messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4) + 4, 0);
  return systemTokens + msgTokens + 3;
}
```
Wrap in `useMemo` via `useTokenCount` hook. Zero extra dependencies.

### 9. Summarize Route — `app/api/summarize/route.ts`
```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: `Summarize this conversation in 3-5 sentences:\n\n${conversationText}`,
});
return Response.json({ summary: text });
```

### 10. Markdown Rendering
Wrap assistant `message.content` in `<ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm dark:prose-invert">`. Requires `@tailwindcss/typography` plugin in `tailwind.config.ts`.

### 11. Auto-scroll
In `ChatWindow.tsx`, only scroll to bottom if user is within 100px of the bottom anchor — prevents fighting user scrolling during streaming.

### 12. `.env.local`
```
OPENAI_API_KEY=sk-...
```

---

## Build Order
1. Scaffold + install deps
2. `/api/chat/route.ts` — test with curl first
3. `ChatShell.tsx` + `useChat` wired up
4. `ChatWindow.tsx` + `ChatMessage.tsx` (static layout)
5. `ChatInput.tsx` — full send/receive cycle working
6. `CopyButton.tsx` + `useCopyToClipboard`
7. Regenerate button (`reload()`)
8. `SystemPromptEditor.tsx` + `body: { systemPrompt }`
9. `/api/summarize/route.ts` + `SummaryPanel.tsx`
10. `useTokenCount` + `TokenCounter.tsx`
11. Polish: scroll behavior, mobile layout, error states

---

## Verification
- `npm run dev` → open localhost:3000
- Send a message → confirm streaming tokens appear in real-time
- Edit system prompt → send message → confirm system prompt is respected
- Click "Regenerate" → confirm a new response is streamed
- Click "Summarize" → confirm summary appears in sidebar
- Token counter updates live as messages arrive
- Copy button shows checkmark feedback, clipboard contains message text
