'use client';

import { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { sql } from '@codemirror/lang-sql';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';
import { motion, AnimatePresence } from 'framer-motion';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import {
  Check, Copy, Terminal, RefreshCw, Sparkles, RotateCcw, AlignLeft,
  CheckCircle2, AlertTriangle, XCircle, Lightbulb, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '@/lib/api';
import { Button, Select } from '@/components/ui';
import { ScoreIndicator } from '@/components/ai';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

function normalizeLang(lang: string): string {
  return (lang || 'python').toLowerCase().replace(/[+\s._]/g, '');
}

function langExtension(lang: string) {
  switch (normalizeLang(lang)) {
    case 'python':
    case 'py':
      return python();
    case 'javascript':
    case 'js':
    case 'jsx':
    case 'node':
    case 'nodejs':
      return javascript({ jsx: true });
    case 'typescript':
    case 'ts':
    case 'tsx':
      return javascript({ typescript: true, jsx: true });
    case 'java':
      return java();
    case 'c':
    case 'cpp':
    case 'cplusplus':
      return cpp();
    case 'sql':
      return sql();
    case 'go':
      return go();
    case 'rust':
    case 'rs':
      return rust();
    default:
      return python();
  }
}

function normalizeFormat(code: string): string {
  return code
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '') + '\n';
}

export interface ChallengeEvaluation {
  score: number | null;
  verdict: string;
  summary: string;
  correctness: string;
  errors: string[];
  strengths: string[];
  recommendations: string[];
}

interface ChallengeSimulatorProps {
  language: string;
  problem: string;
  starterCode: string;
  onNext?: () => void;
}

export function ChallengeSimulator({ language, problem, starterCode, onNext }: ChallengeSimulatorProps) {
  const [lang, setLang] = useState(language || 'python');
  const [code, setCode] = useState(starterCode || '');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<ChallengeEvaluation | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const extensions = useMemo(() => [langExtension(lang), keymap.of([indentWithTab])], [lang]);

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const reset = () => setCode(starterCode || '');
  const clear = () => {
    setCode('');
    setEvalResult(null);
  };
  const format = () => setCode((c) => normalizeFormat(c));

  const submit = async () => {
    if (!code.trim()) {
      toast.error('Write your solution before submitting.');
      return;
    }
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await aiAPI.challengeEvaluate({
        language: lang,
        problem,
        starter_code: starterCode,
        solution: code,
      });
      setEvalResult(res.data.evaluation);
      setSubmitCount((n) => n + 1);
      toast.success('Evaluation complete');
    } catch {
      toast.error('Evaluation failed. The AI service may be busy.');
    } finally {
      setEvaluating(false);
    }
  };

  const verdictColor = (v: string) =>
    v === 'correct'
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : v === 'partial'
        ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
        : 'text-red-300 border-red-500/30 bg-red-500/10';

  return (
    <div className="space-y-3">
      {/* -------- Editor header -------- */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-500 mr-1">
          <Terminal className="w-3.5 h-3.5 text-primary-400" /> Your Solution
        </span>
        <div className="w-40">
          <Select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={LANGUAGES}
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <EditorBtn icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy'} onClick={copy} disabled={!code} />
          <EditorBtn icon={AlignLeft} label="Format" onClick={format} disabled={!code} />
          <EditorBtn icon={RotateCcw} label="Reset" onClick={reset} disabled={!code} />
          <EditorBtn icon={RefreshCw} label="Clear" onClick={clear} disabled={!code} />
        </div>
      </div>

      {/* -------- Code editor -------- */}
      <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a12]">
        <CodeMirror
          value={code}
          onChange={(val) => setCode(val)}
          extensions={extensions}
          theme={oneDark}
          height="360px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            tabSize: 4,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
          }}
          placeholder="Write your solution here..."
        />
      </div>

      {/* -------- Submit -------- */}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="gradient" onClick={submit} loading={evaluating} disabled={evaluating}>
          {!evaluating && <CheckCircle2 className="w-4 h-4" />}
          {evaluating ? 'Evaluating...' : 'Submit Solution'}
        </Button>
        {onNext && (
          <Button type="button" variant="outline" onClick={onNext}>
            <Sparkles className="w-4 h-4" /> Next Challenge
          </Button>
        )}
        {submitCount > 0 && (
          <span className="text-xs text-gray-500 ml-auto">Submitted {submitCount} {submitCount === 1 ? 'time' : 'times'}</span>
        )}
      </div>

      {/* -------- Evaluation result -------- */}
      <AnimatePresence mode="wait">
        {evaluating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 text-center"
          >
            <p className="text-sm text-gray-300">The AI coach is reviewing your solution...</p>
            <p className="text-xs text-gray-500 mt-1.5">Checking correctness, edge cases, and learning tips. This usually takes a few seconds.</p>
          </motion.div>
        )}

        {!evaluating && evalResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <GraduationCap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-semibold text-gray-100">Interviewer Evaluation</span>
              {evalResult.verdict && (
                <span className={cn('ml-auto px-2.5 py-0.5 text-[11px] rounded-full border font-medium capitalize', verdictColor(evalResult.verdict))}>
                  {evalResult.verdict}
                </span>
              )}
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              {typeof evalResult.score === 'number' && (
                <ScoreIndicator score={evalResult.score} label="Solution Score" />
              )}
              {evalResult.summary && <p className="text-sm text-gray-300 leading-relaxed">{evalResult.summary}</p>}

              {evalResult.correctness && (
                <EvalSection icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />} label="Correctness" tone="text-emerald-400">
                  <p className="text-sm text-gray-300 leading-relaxed">{evalResult.correctness}</p>
                </EvalSection>
              )}

              {evalResult.errors && evalResult.errors.length > 0 && (
                <EvalSection icon={<XCircle className="w-3.5 h-3.5 text-red-400" />} label="Errors & Issues" tone="text-red-400">
                  <ul className="space-y-1.5">
                    {evalResult.errors.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400/70" />
                        <span className="leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </EvalSection>
              )}

              {evalResult.strengths && evalResult.strengths.length > 0 && (
                <EvalSection icon={<Lightbulb className="w-3.5 h-3.5 text-cyan-400" />} label="What Went Well" tone="text-cyan-400">
                  <ul className="space-y-1.5">
                    {evalResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400/80" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </EvalSection>
              )}

              {evalResult.recommendations && evalResult.recommendations.length > 0 && (
                <EvalSection icon={<GraduationCap className="w-3.5 h-3.5 text-amber-400" />} label="Learning Recommendations" tone="text-amber-400">
                  <ul className="space-y-1.5">
                    {evalResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/70" />
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </EvalSection>
              )}

              {!evalResult.summary && !evalResult.correctness && !evalResult.errors?.length && !evalResult.strengths?.length && !evalResult.recommendations?.length && (
                <p className="text-sm text-gray-400 leading-relaxed">{evalResult.summary || 'The AI coach could not produce a structured score for this submission.'}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditorBtn({ icon: Icon, label, onClick, disabled }: { icon: any; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function EvalSection({ icon, label, tone, children }: { icon: React.ReactNode; label: string; tone: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={cn('flex items-center gap-1.5 text-[11px] uppercase tracking-wide mb-1.5', tone)}>
        {icon} {label}
      </p>
      {children}
    </div>
  );
}