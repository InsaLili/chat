import type { UIMessage } from 'ai';
import MarkdownContent from './MarkdownContent';

type Props = {
  message: UIMessage;
};

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm whitespace-pre-wrap'
            : 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm shadow-sm'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type !== 'text') return null;
          return isUser ? (
            <span key={i}>{part.text}</span>
          ) : (
            <MarkdownContent key={i} content={part.text} />
          );
        })}
      </div>
    </div>
  );
}
