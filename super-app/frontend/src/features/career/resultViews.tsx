'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Copy, ChevronDown, CheckCircle2, Sparkles, Route, ArrowDown,
  ShieldCheck, Code2, Terminal, Lightbulb, Layers, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIResponse } from '@/components/ai';
import {
  parseRoadmap, parseInterview, parseSalary, parseChallenge,
  formatSalaryNum, type RoadmapParse, type SalaryParse
} from './parsers';

function CopyBtn({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
        copied
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function ResultReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Roadmap — animated phase timeline
 * ------------------------------------------------------------------ */

function RoadmapTimeline({ parsed }: { parsed: RoadmapParse }) {
  return (
    <div className="space-y-1">
      <ResultReveal>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center shadow-glow-sm">
            <Route className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white tracking-wide">CAREER ROADMAP</p>
            {parsed.from && (
              <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-primary-300">{parsed.from}</span>
                <ArrowDown className="w-3 h-3 text-primary-400" />
                <span className="text-fuchsia-300">{parsed.to || 'target'}</span>
              </p>
            )}
          </div>
        </div>
      </ResultReveal>

      <div className="space-y-0">
        {parsed.phases.map((phase, i) => {
          const isLast = i === parsed.phases.length - 1;
          return (
            <motion.div
              key={phase.index}
              className="flex gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 text-white text-xs font-bold grid place-items-center border border-white/25 shadow-glow-sm">
                  {phase.index}
                  <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping-slow pointer-events-none" />
                </div>
                {!isLast && (
                  <motion.div
                    className="w-px flex-1 min-h-12 bg-gradient-to-b from-fuchsia-500/60 via-primary-500/40 to-transparent"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                    style={{ transformOrigin: 'top' }}
                  />
                )}
              </div>
              <div className={cn('flex-1 min-w-0', !isLast && 'pb-5')}>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h4 className="font-semibold text-gray-100">{phase.title}</h4>
                  {phase.weekLabel && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                      {phase.weekLabel}
                    </span>
                  )}
                </div>
                {phase.description && <p className="text-sm text-gray-400 mb-1.5">{phase.description}</p>}
                {phase.items.length > 0 && (
                  <ul className="space-y-1.5">
                    {phase.items.map((item, ii) => (
                      <motion.li
                        key={ii}
                        className="flex items-start gap-2 text-sm text-gray-300"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.1 + ii * 0.04 }}
                      >
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {parsed.extra && (
        <ResultReveal delay={0.2}>
          <div className="pt-4 border-t border-white/[0.06]">
            <AIResponse content={parsed.extra} disableToolbar />
          </div>
        </ResultReveal>
      )}
    </div>
  );
}

export function RoadmapView({ text }: { text: string }) {
  const parsed = useMemo(() => parseRoadmap(text), [text]);
  if (!parsed.phases.length) {
    return <AIResponse content={text} disableToolbar />;
  }
  return <RoadmapTimeline parsed={parsed} />;
}

/* ------------------------------------------------------------------ *
 *  Interview — expandable Q&A cards
 * ------------------------------------------------------------------ */

function QuestionCard({ index, question, answer, tip }: { index: number; question: string; answer: string; tip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4) }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/25 grid place-items-center text-sm font-bold text-cyan-300">
          {String(index).padStart(2, '0')}
        </span>
        <p className="flex-1 min-w-0 pt-1 text-[15px] font-medium text-gray-100 leading-snug">{question}</p>
      </div>
      <div className="flex items-center justify-between px-4 pb-3 gap-2">
        <CopyBtn text={question} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          {open ? 'Hide' : 'Show'} Answer
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-4 pl-16 space-y-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-emerald-400 mb-1">
                  <Lightbulb className="w-3 h-3" /> Model Answer
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{answer || 'No answer provided.'}</p>
              </div>
              {tip && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-cyan-400 mb-1">
                    <Sparkles className="w-3 h-3" /> Tip
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function InterviewView({ text }: { text: string }) {
  const parsed = useMemo(() => parseInterview(text), [text]);
  if (!parsed.items.length) {
    return <AIResponse content={text} disableToolbar />;
  }
  return (
    <div className="space-y-3">
      <ResultReveal>
        <p className="text-xs text-gray-500 mb-3">
          {parsed.items.length} questions · click <span className="text-gray-300">Show Answer</span> to reveal model answers
        </p>
      </ResultReveal>
      {parsed.items.map((qa) => (
        <QuestionCard key={qa.index} index={qa.index} question={qa.question} answer={qa.answer} tip={qa.tip} />
      ))}
      {parsed.extra && <AIResponse content={parsed.extra} disableToolbar />}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Salary — AI-estimate insight cards
 * ------------------------------------------------------------------ */

function SalaryTierCard({ tier, max }: { tier: any; max: number }) {
  const pct = tier.value && max ? Math.max(8, Math.round((tier.value / max) * 100)) : 8;
  const iconMap: Record<string, any> = {
    entry: <Layers className="w-4 h-4 text-cyan-300" />,
    mid: <Route className="w-4 h-4 text-primary-300" />,
    senior: <Sparkles className="w-4 h-4 text-amber-300" />,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 grid place-items-center">
          {iconMap[tier.key] || <DollarSign className="w-4 h-4 text-gray-300" />}
        </div>
        <span className="text-sm font-semibold text-gray-200">{tier.label}</span>
      </div>
      {tier.value != null ? (
        <div className="mb-2">
          <span className="text-lg font-bold text-gray-100">{formatSalaryNum(tier.value, tier.currency)}</span>
        </div>
      ) : (
        tier.text && <p className="text-sm text-gray-400 leading-relaxed mb-2">{tier.text}</p>
      )}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export function SalaryView({ text, label }: { text: string; label?: string }) {
  const parsed: SalaryParse = useMemo(() => parseSalary(text), [text]);
  const structured = parsed.tiers.length > 0 || parsed.rangeText;
  const maxValue = Math.max(0, ...parsed.tiers.map((t) => t.value ?? 0));
  const tiers = parsed.tiers.map((t) => ({ ...t, currency: parsed.currency }));

  return (
    <div className="space-y-4">
      <ResultReveal>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> AI-generated estimate
          </span>
          <span className="text-[11px] text-gray-500">Not verified market data · for guidance only</span>
          {label && <span className="text-[11px] text-gray-500 ml-auto">{label}</span>}
        </div>
      </ResultReveal>

      {!structured ? (
        <AIResponse content={text} disableToolbar />
      ) : (
        <>
          {parsed.rangeText && (
            <ResultReveal>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Estimated salary range</p>
                <p className="text-2xl font-bold text-white break-words">
                  {parsed.rangeMin != null && parsed.rangeMax != null
                    ? `${formatSalaryNum(parsed.rangeMin, parsed.currency)} – ${formatSalaryNum(parsed.rangeMax, parsed.currency)}`
                    : parsed.rangeText}
                </p>
              </div>
            </ResultReveal>
          )}

          {tiers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tiers.map((t, i) => (
                <ResultReveal key={t.key} delay={0.05 + i * 0.05}>
                  <SalaryTierCard tier={t} max={maxValue} />
                </ResultReveal>
              ))}
            </div>
          )}

          {parsed.extra && (
            <ResultReveal>
              <div className="pt-1">
                <AIResponse content={parsed.extra} disableToolbar />
              </div>
            </ResultReveal>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Challenge — problem, samples, constraints, starter code
 * ------------------------------------------------------------------ */

function CodeBlock({ label, lang, code }: { label: string; lang: string; code: string }) {
  return (
    <div className="group relative my-1 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a12]">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-primary-400" /> {label}
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-gray-500">{lang || 'text'}</span>
        </span>
        <CopyBtn text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ChallengeView({ text }: { text: string }) {
  const parsed = useMemo(() => parseChallenge(text), [text]);
  const structured = !!parsed.problem || !!parsed.starterCode || !!parsed.exampleInput || parsed.constraints.length > 0;

  if (!structured) {
    return <AIResponse content={text} disableToolbar />;
  }

  return (
    <div className="space-y-4">
      {parsed.problem && (
        <ResultReveal>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 mb-2">
              <Code2 className="w-3.5 h-3.5 text-primary-400" /> Problem
            </p>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{parsed.problem}</p>
          </div>
        </ResultReveal>
      )}

      {(parsed.exampleInput || parsed.exampleOutput) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parsed.exampleInput && (
            <ResultReveal delay={0.08}>
              <CodeBlock label="Example Input" lang="text" code={parsed.exampleInput} />
            </ResultReveal>
          )}
          {parsed.exampleOutput && (
            <ResultReveal delay={0.14}>
              <CodeBlock label="Example Output" lang="text" code={parsed.exampleOutput} />
            </ResultReveal>
          )}
        </div>
      )}

      {parsed.constraints.length > 0 && (
        <ResultReveal>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 mb-2">
              <Layers className="w-3.5 h-3.5 text-primary-400" /> Constraints
            </p>
            <ul className="space-y-1.5">
              {parsed.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </ResultReveal>
      )}

      {parsed.starterCode && (
        <ResultReveal>
          <CodeBlock label="Starter Code" lang={parsed.starterCode.language} code={parsed.starterCode.code} />
        </ResultReveal>
      )}

      {parsed.extra && <AIResponse content={parsed.extra} disableToolbar />}
    </div>
  );
}