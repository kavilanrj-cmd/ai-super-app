'use client';

import { useState, useCallback, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import {
  Check, Copy, Terminal, ChevronDown, ChevronRight, AlertTriangle,
  Info, CheckCircle2, XCircle, Star, FileText, ExternalLink,
  RotateCw, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';

/* ----- Shared primitives ----- */

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return { copied, copy };
}

export function AICopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopy(text);
  return (
    <button
      onClick={copy}
      aria-label="Copy to clipboard"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        copied
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:text-white',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ----- Callouts ----- */

export type AICalloutType = 'note' | 'warning' | 'success' | 'error';

const calloutStyles: Record<AICalloutType, { icon: any; label: string; wrap: string; title: string }> = {
  note: {
    icon: Info,
    label: 'Note',
    wrap: 'border-primary-500/25 bg-primary-500/[0.06]',
    title: 'text-primary-300',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    wrap: 'border-amber-500/30 bg-amber-500/[0.07]',
    title: 'text-amber-300',
  },
  success: {
    icon: CheckCircle2,
    label: 'Success',
    wrap: 'border-emerald-500/30 bg-emerald-500/[0.07]',
    title: 'text-emerald-300',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    wrap: 'border-red-500/30 bg-red-500/[0.07]',
    title: 'text-red-300',
  },
};

export function AICallout({
  type = 'note',
  title,
  children,
  className,
}: {
  type?: AICalloutType;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const s = calloutStyles[type];
  const Icon = s.icon;
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4 my-3', s.wrap, className)}>
      <Icon className="w-4.5 h-4.5 mt-0.5 shrink-0 text-current" />
      <div className="min-w-0">
        {title && <p className={cn('text-sm font-semibold mb-1', s.title)}>{title}</p>}
        <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ----- Severity badge (code review / bugs) ----- */

export type Severity = 'critical' | 'high' | 'medium' | 'low';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'gradient';

const severityMap: Record<Severity, { label: string; variant: BadgeVariant; dot: string }> = {
  critical: { label: 'Critical', variant: 'danger', dot: 'bg-red-400' },
  high: { label: 'High', variant: 'danger', dot: 'bg-red-400' },
  medium: { label: 'Medium', variant: 'warning', dot: 'bg-amber-400' },
  low: { label: 'Low', variant: 'info', dot: 'bg-blue-400' },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const s = severityMap[severity] || severityMap.low;
  return (
    <Badge variant={s.variant} dot className={className}>
      {s.label}
    </Badge>
  );
}

/* ----- Score indicator ----- */

function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400', label: 'Excellent' };
  if (score >= 60) return { text: 'text-amber-400', bar: 'from-amber-500 to-amber-300', label: 'Good' };
  return { text: 'text-red-400', bar: 'from-red-500 to-rose-400', label: 'Needs work' };
}

export function ScoreIndicator({ score, label, max = 100 }: { score: number; label?: string; max?: number }) {
  const clamped = Math.max(0, Math.min(score || 0, max));
  const pct = max ? (clamped / max) * 100 : 0;
  const color = scoreColor(clamped);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Star className="w-4 h-4 text-primary-400" />
          {label || 'Score'}
        </span>
        <span className={cn('text-2xl font-bold tracking-tight', color.text)}>
          {Math.round(clamped)}
          {max !== 100 && <span className="text-sm text-gray-500 ml-1">/ {max}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', color.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{color.label}</p>
    </div>
  );
}

/* ----- Section card (collapsible) ----- */

export function AISection({
  title,
  icon,
  defaultOpen = true,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn('rounded-xl border border-white/[0.07] bg-[#0a0a12]/60 overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left"
      >
        {icon}
        <span className="flex-1 text-sm font-semibold text-gray-100">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="p-4 text-sm text-gray-300">{children}</div>}
    </section>
  );
}

/* ----- Key / value grid ----- */

export function KeyValue({ pairs, className }: { pairs: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3', className)}>
      {pairs.map(([k, v], i) => (
        <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-gray-500 mb-0.5">{k}</dt>
          <dd className="text-sm text-gray-200">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ----- Check list / steps ----- */

export function CheckList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn('space-y-2 my-3', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
          <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps, className }: { steps: ReactNode[]; className?: string }) {
  return (
    <ol className={cn('space-y-3 my-3', className)}>
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 text-xs font-bold text-white">
            {i + 1}
          </span>
          <span className="text-sm text-gray-300 leading-relaxed pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ----- Sources ----- */

export function Sources({ sources, className }: { sources: ReactNode[]; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-primary-500/20 bg-primary-500/[0.04] p-4 my-3', className)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-300 mb-2.5">
        <FileText className="w-3.5 h-3.5" /> Sources
      </p>
      <ul className="space-y-2">
        {sources.map((src, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0 text-primary-400" />
            <div className="leading-relaxed">{src}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * AI Response — adaptive Markdown renderer with copy toolbar
 * ------------------------------------------------------------------------- */

const SECTION_KEYWORDS = /(summary|key points|key findings|decisions|action items|recommendations|overall score|ats score|strengths|weaknesses|skills|experience|education|missing skills|job match|issues|severity|bugs|code quality|security|corrected code|test cases|index|question|ideal answer|why this answer works|common mistakes|follow-up|next steps|executive summary|detailed analysis|pros|cons|sources|prevention|cause|location)/i;

function CodeBlock({ language, value }: { language: string; value: string }) {
  const lang = language === 'math' || language === 'latex' ? 'LaTeX' : language || 'code';
  const { copied, copy } = useCopy(value);
  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0a0a12] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-primary-400" /> {lang}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all',
            copied ? 'text-emerald-400 bg-emerald-500/10' : 'bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white'
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <code className={language ? `language-${language}` : ''}>{value}</code>
      </pre>
    </div>
  );
}

function ChipHeading({ level, children }: { level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode }) {
  const text = String(children ?? '').replace(/[#*]/g, '').trim();
  const isKnown = text ? SECTION_KEYWORDS.test(text) : false;
  const base = cn(
    'flex items-center gap-2 font-semibold tracking-tight text-gray-100',
    'border-l-2 pl-3',
    isKnown ? 'border-primary-500/70 text-white' : 'border-white/[0.12] text-gray-200'
  );
  if (level === 1) return <h1 className={cn(base, 'text-xl mt-5 mb-3')}>{children}</h1>;
  if (level === 2) return <h2 className={cn(base, 'text-lg mt-6 mb-3')}>{children}</h2>;
  if (level === 3) return <h3 className={cn(base, 'text-base mt-5 mb-2')}>{children}</h3>;
  if (level === 4) return <h4 className={cn(base, 'text-sm mt-4 mb-2 uppercase tracking-wide text-gray-400 border-l-0')}>{children}</h4>;
  return <h5 className={cn(base, 'text-sm mt-3 mb-1')}>{children}</h5>;
}

export interface AIResponseProps {
  content: string;
  className?: string;
  disableToolbar?: boolean;
}

export function AIResponse({ content, className, disableToolbar }: AIResponseProps) {
  const { copied, copy } = useCopy(content);
  const components: any = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      if (!inline && value) return <CodeBlock language={language} value={value} />;
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-primary-500/10 text-primary-300 text-[0.9em]" {...props}>
          {children}
        </code>
      );
    },
    pre({ children }: any) {
      return <>{children}</>;
    },
    h1: ({ children }: any) => <ChipHeading level={1}>{children}</ChipHeading>,
    h2: ({ children }: any) => <ChipHeading level={2}>{children}</ChipHeading>,
    h3: ({ children }: any) => <ChipHeading level={3}>{children}</ChipHeading>,
    h4: ({ children }: any) => <ChipHeading level={4}>{children}</ChipHeading>,
    h5: ({ children }: any) => <ChipHeading level={5}>{children}</ChipHeading>,
    h6: ({ children }: any) => <ChipHeading level={6}>{children}</ChipHeading>,
    p({ children }: any) {
      return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>;
    },
    ul({ children }: any) {
      return <ul className="mb-3 space-y-1.5 list-disc list-inside marker:text-primary-400">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="mb-3 space-y-1.5 list-decimal list-inside marker:text-primary-400">{children}</ol>;
    },
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
      return <div className="overflow-x-auto my-3 rounded-xl border border-white/10"><table className="min-w-full border-collapse text-sm">{children}</table></div>;
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
      return <img src={src} alt={alt || 'image'} className="max-w-full rounded-xl my-3 border border-white/10" loading="lazy" />;
    },
  };

  return (
    <div className={cn('text-[14px] text-gray-300')}>
      {!disableToolbar && (
        <div className="flex items-center justify-end mb-2 -mt-1 px-1">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
            aria-label="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <div className={cn('markdown-body', className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * AIResultCard — professional container replacing raw <pre>/pre-wrap blocks
 * ------------------------------------------------------------------------- */

export interface AIResultCardProps {
  title?: string;
  icon?: ReactNode;
  content?: string;
  children?: ReactNode;
  copyableText?: string;
  onRegenerate?: () => void;
  className?: string;
  maxHeight?: string;
}

export function AIResultCard({
  title = 'AI Response',
  icon,
  content,
  children,
  copyableText,
  onRegenerate,
  className,
  maxHeight = '560px',
}: AIResultCardProps) {
  const text = copyableText ?? content ?? '';
  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-primary-400 shrink-0" />
          <h3 className="text-sm font-semibold text-gray-100 truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {text && <AICopyButton text={text} />}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              aria-label="Regenerate"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:text-white transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5" style={content || children ? { maxHeight, overflowY: 'auto' } : undefined}>
        {content != null ? <AIResponse content={content} disableToolbar /> : children}
      </div>
    </div>
  );
}

/* Convenience composite: severity colored summary row for code review objects */
export function AIStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
      <span className="flex items-center gap-1.5 text-sm text-gray-200">{value}</span>
    </div>
  );
}
