import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, systemPrompt }: { messages: UIMessage[]; systemPrompt?: string } =
    await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt || 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
