'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Terminal, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all',
        copied && 'text-emerald-400 bg-emerald-500/10',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const langLabel =
    language === 'mermaid'
      ? 'mermaid'
      : language === 'math' || language === 'latex'
      ? 'LaTeX'
      : language || 'code';

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0a0a12] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-primary-400" />
          {langLabel}
        </span>
        <CopyButton text={value} />
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <code className={language ? `language-${language}` : ''}>{value}</code>
      </pre>
    </div>
  );
}

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      if (!inline && value) {
        return <CodeBlock language={language} value={value} />;
      }
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-primary-500/10 text-primary-300 text-[0.9em]" {...props}>
          {children}
        </code>
      );
    },
    p({ children }: any) {
      return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>;
    },
    ul({ children }: any) {
      return <ul className="mb-3 space-y-1.5 list-disc list-inside marker:text-primary-400">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="mb-3 space-y-1.5 list-decimal list-inside marker:text-primary-400">{children}</ol>;
    },
    h1({ children }: any) { return <h1 className="text-xl font-bold mb-3 mt-4 tracking-tight">{children}</h1>; },
    h2({ children }: any) { return <h2 className="text-lg font-bold mb-2.5 mt-5 tracking-tight">{children}</h2>; },
    h3({ children }: any) { return <h3 className="text-base font-semibold mb-2 mt-4">{children}</h3>; },
    h4({ children }: any) { return <h4 className="text-sm font-semibold mb-2 mt-3 uppercase tracking-wide text-gray-400">{children}</h4>; },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-2 border-primary-500/50 pl-4 my-3 py-1 text-gray-400 italic bg-primary-500/[0.04] rounded-r-lg">
          {children}
        </blockquote>
      );
    },
    a({ href, children }: any) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors">
          {children}
        </a>
      );
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
          <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
      );
    },
    thead({ children }: any) {
      return <thead className="bg-white/[0.05]">{children}</thead>;
    },
    th({ children }: any) {
      return <th className="px-3 py-2.5 font-semibold text-left text-gray-200 border-b border-white/10">{children}</th>;
    },
    td({ children }: any) {
      return <td className="px-3 py-2 border-b border-white/[0.05]">{children}</td>;
    },
    tr({ children }: any) {
      return <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>;
    },
    hr() {
      return <hr className="my-4 border-white/[0.08]" />;
    },
    em({ children }: any) {
      return <em className="text-primary-300">{children}</em>;
    },
    strong({ children }: any) {
      return <strong className="font-semibold text-white">{children}</strong>;
    },
    img({ src, alt }: any) {
      return (
        <img
          src={src}
          alt={alt || 'image'}
          className="max-w-full rounded-xl my-3 border border-white/10"
          loading="lazy"
        />
      );
    },
    pre({ children }: any) {
      return <>{children}</>;
    },
  };

  return (
    <div className={cn('markdown-body text-[14px] text-gray-300', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export { CodeBlock, CopyButton };
