import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <div className="markdown-body font-body-md text-sm text-on-surface leading-relaxed overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-on-surface">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-on-surface mt-4 mb-2 first:mt-0 tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-on-surface mt-3.5 mb-2 first:mt-0 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-on-surface mt-3 mb-1.5 first:mt-0">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 my-2.5 text-on-surface">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2.5 text-on-surface">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-on-surface/90">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/60 pl-3 my-2.5 text-on-surface-variant italic bg-surface-container-low/50 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock language={match ? match[1] : 'text'} code={codeString} />;
            }

            return (
              <code
                className="bg-surface-container-highest px-1.5 py-0.5 rounded text-xs font-mono text-primary font-medium border border-outline-variant/30"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-outline-variant/40">
              <table className="min-w-full text-xs text-left divide-y divide-outline-variant/30">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-surface-container-high px-3 py-2 font-semibold text-on-surface uppercase tracking-wider text-[11px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-outline-variant/20 text-on-surface">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden bg-[#1e1e2e] text-[#cdd6f4] shadow-md border border-[#313244]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181825] border-b border-[#313244] text-[11px] font-mono text-[#a6adc8]">
        <span className="uppercase tracking-wider font-semibold text-primary">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#313244]"
          title="Copy code"
        >
          <span className="material-symbols-outlined text-[13px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
