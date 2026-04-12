import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  content: string;
};

export default function MarkdownContent({ content }: Props) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Inline code
          code({ children, className }) {
            const isBlock = className?.startsWith('language-');
            if (isBlock) return null; // handled by pre
            return (
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[0.8em]">
                {children}
              </code>
            );
          },
          // Code blocks
          pre({ children }) {
            return (
              <pre className="my-3 overflow-x-auto rounded-xl bg-zinc-900 dark:bg-zinc-950 px-4 py-3 text-xs leading-relaxed text-zinc-100">
                {children}
              </pre>
            );
          },
          p({ children }) {
            return <p className="my-2 first:mt-0 last:mb-0">{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
