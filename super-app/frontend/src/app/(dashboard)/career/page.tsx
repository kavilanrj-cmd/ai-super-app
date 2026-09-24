'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '@/lib/api';
import {
  Route, MessageSquareText, DollarSign, Code2, Target, Sparkles,
  Check, Copy, Download, RefreshCw, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Select, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { RoadmapView, InterviewView, SalaryView, ChallengeView } from '@/features/career/resultViews';

type Mode = 'roadmap' | 'interview' | 'salary' | 'challenges';

interface TabMeta {
  id: Mode;
  label: string;
  desc: string;
  icon: any;
  gradient: string;
  accent: string;
}

const TABS: TabMeta[] = [
  { id: 'roadmap', label: 'Roadmap', desc: 'Career path planning', icon: Route, gradient: 'from-violet-500 to-fuchsia-500', accent: 'text-fuchsia-300 border-fuchsia-500/25 bg-fuchsia-500/10' },
  { id: 'interview', label: 'Interview', desc: 'Practice questions', icon: MessageSquareText, gradient: 'from-blue-500 to-cyan-500', accent: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10' },
  { id: 'salary', label: 'Salary', desc: 'AI pay estimates', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', accent: 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10' },
  { id: 'challenges', label: 'Challenges', desc: 'Coding practice', icon: Code2, gradient: 'from-amber-500 to-orange-500', accent: 'text-amber-300 border-amber-500/25 bg-amber-500/10' },
];

const EXP_OPTIONS = [
  { value: '', label: 'Entry level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const TIME_OPTIONS = [
  { value: '', label: '2-4 hours / week' },
  { value: '5-10 hours / week', label: '5-10 hours / week' },
  { value: '10-20 hours / week', label: '10-20 hours / week' },
  { value: '20+ hours / week', label: '20+ hours / week' },
];

const INTERVIEW_TYPE_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'hr', label: 'HR' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
];

const LANG_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const GENERATE_LABELS: Record<Mode, string> = {
  roadmap: 'Generate Career Roadmap',
  interview: 'Generate Questions',
  salary: 'Generate Salary Insights',
  challenges: 'Generate Challenge',
};

const LOADING_TEXT: Record<Mode, string> = {
  roadmap: 'AI is building your career roadmap...',
  interview: 'AI is preparing your interview questions...',
  salary: 'AI is analyzing your salary insights...',
  challenges: 'AI is crafting your coding challenge...',
};

const ERROR_TEXT: Record<Mode, string> = {
  roadmap: 'Unable to generate your roadmap. Please try again.',
  interview: 'Unable to generate your questions. Please try again.',
  salary: 'Unable to generate salary insights. Please try again.',
  challenges: 'Unable to generate your challenge. Please try again.',
};

const EMPTY_TITLE: Record<Mode, string> = {
  roadmap: 'Generate a roadmap to see your personalized career path.',
  interview: 'Generate questions to start practising for your interview.',
  salary: 'Generate insights to see your estimated salary range.',
  challenges: 'Generate a challenge to start practising your coding skills.',
};

const RESULT_TITLES: Record<Mode, string> = {
  roadmap: 'Career Roadmap',
  interview: 'Interview Questions',
  salary: 'Salary Insights',
  challenges: 'Coding Challenge',
};

const RESULT_SUBTITLES: Record<Mode, string> = {
  roadmap: 'Your personalized step-by-step growth plan',
  interview: 'Practice questions with model answers',
  salary: 'Estimated pay based on your inputs',
  challenges: 'A fresh coding problem to solve',
};

/* Small action button used in the result header */
function ResultAction({ icon, label, onClick, active, disabled }: { icon: any; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] h-full text-center">
      <div className="relative">
        <div className="absolute -inset-3 rounded-2xl bg-primary-500/20 blur-xl animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/20 border border-primary-500/30 grid place-items-center"
        >
          <Sparkles className="w-6 h-6 text-primary-300" />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 font-medium text-gray-200"
      >
        {text}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1.5">This usually takes a few seconds.</p>
    </div>
  );
}

export default function CareerPage() {
  const [mode, setMode] = useState<Mode>('roadmap');

  // --- roadmap fields ---
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const [techStack, setTechStack] = useState('');
  const [learningTime, setLearningTime] = useState('');

  // --- interview fields ---
  const [interviewRole, setInterviewRole] = useState('');
  const [interviewExp, setInterviewExp] = useState('');
  const [interviewType, setInterviewType] = useState('technical');

  // --- salary fields ---
  const [salaryRole, setSalaryRole] = useState('');
  const [salaryLocation, setSalaryLocation] = useState('');
  const [salaryYears, setSalaryYears] = useState('');
  const [salarySkills, setSalarySkills] = useState('');

  // --- challenge fields ---
  const [chLanguage, setChLanguage] = useState('python');
  const [chDifficulty, setChDifficulty] = useState('medium');
  const [chTopic, setChTopic] = useState('');

  const [results, setResults] = useState<Partial<Record<Mode, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<Mode, string>>>({});
  const [loading, setLoading] = useState<Partial<Record<Mode, boolean>>>({});
  const [copied, setCopied] = useState(false);

  const activeTab = TABS.find((t) => t.id === mode) || TABS[0];

  const callAI = async (m: Mode): Promise<string> => {
    switch (m) {
      case 'roadmap': {
        const res = await aiAPI.roadmap(currentRole, targetRole, {
          experience_level: expLevel || undefined,
          tech_stack: techStack || undefined,
          learning_time: learningTime || undefined,
        });
        return res.data.roadmap;
      }
      case 'interview': {
        const qTypes =
          interviewType === 'mixed'
            ? ['technical', 'behavioral', 'hr']
            : interviewType
              ? [interviewType]
              : undefined;
        const res = await aiAPI.interview(interviewRole, undefined, qTypes, interviewExp || undefined);
        return res.data.questions;
      }
      case 'salary': {
        const res = await aiAPI.salary(salaryRole, Math.max(0, parseInt(salaryYears) || 0), salaryLocation, salarySkills);
        return res.data.salary_prediction;
      }
      case 'challenges': {
        const res = await aiAPI.challenge(chLanguage, chDifficulty, chTopic);
        return res.data.challenge;
      }
    }
  };

  const validate = (m: Mode): string | null => {
    switch (m) {
      case 'roadmap':
        return currentRole.trim() && targetRole.trim() ? null : 'Enter both your current and target role.';
      case 'interview':
        return interviewRole.trim() ? null : 'Enter the role you are preparing for.';
      case 'salary':
        return salaryRole.trim() && salaryLocation.trim() ? null : 'Enter a job role and location.';
      case 'challenges':
        return chTopic.trim() ? null : 'Enter a topic (e.g. arrays, dynamic programming).';
    }
  };

  const generate = async (m: Mode) => {
    const validationError = validate(m);
    if (validationError) return toast.error(validationError);
    setLoading((p) => ({ ...p, [m]: true }));
    setErrors((p) => ({ ...p, [m]: null }));
    try {
      const text = await callAI(m);
      setResults((p) => ({ ...p, [m]: text }));
      toast.success('Generated!');
    } catch {
      setErrors((p) => ({ ...p, [m]: 'Something went wrong. The AI service may be busy.' }));
      toast.error(ERROR_TEXT[m]);
    } finally {
      setLoading((p) => ({ ...p, [m]: false }));
    }
  };

  const copyResult = async () => {
    const text = results[mode];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const text = results[mode];
    if (!text) return;
    const title = RESULT_TITLES[mode];
    const doc = `${title}\n${'='.repeat(title.length)}\n\n${text}\n\nGenerated with AI Career Assistant\n${new Date().toLocaleString()}`;
    const blob = new Blob([doc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-${mode}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const salaryLabel = salaryRole || salaryLocation ? `${salaryRole || 'Role'} · ${salaryLocation || 'Location'}` : undefined;

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100dvh-var(--header-h)-5rem)] lg:overflow-hidden gap-5">
      {/* ---------- Header ---------- */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="shrink-0 flex items-center gap-4"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 grid place-items-center shadow-glow-sm border border-white/20">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -inset-1 rounded-2xl bg-primary-500/40 blur-lg -z-10 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-tight text-white leading-tight">
            Career <span className="bg-gradient-to-r from-primary-400 to-fuchsia-400 bg-clip-text text-transparent">Assistant</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">AI-powered career development tools</p>
        </div>
        <div className="ml-auto hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/[0.05] text-xs text-primary-300">
          <Sparkles className="w-3.5 h-3.5" /> AI Career Coach
        </div>
      </motion.header>

      {/* ---------- Tool tabs ---------- */}
      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {TABS.map((t, i) => {
          const active = mode === t.id;
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => setMode(t.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
              className={cn(
                'group relative glass-card !rounded-xl !p-3.5 text-left transition-all duration-300 overflow-hidden',
                active
                  ? 'shadow-[0_0_24px_rgba(139,92,246,0.22)]'
                  : 'hover:border-white/15 hover:-translate-y-0.5'
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.14] to-fuchsia-500/[0.09] border border-primary-500/40 pointer-events-none" />
              )}
              <span
                className={cn(
                  'relative w-9 h-9 rounded-lg bg-gradient-to-br grid place-items-center mb-2.5 transition-transform duration-300 group-hover:scale-110',
                  active
                    ? `${t.gradient} text-white border border-white/20`
                    : 'from-white/[0.05] to-white/[0.02] text-gray-400 border border-white/10 group-hover:text-white'
                )}
              >
                <Icon className="w-4.5 h-4.5" />
              </span>
              <p className={cn('relative font-semibold text-sm', active ? 'text-white' : 'text-gray-200')}>{t.label}</p>
              <p className={cn('relative text-[11px] mt-0.5 truncate', active ? 'text-gray-300' : 'text-gray-500')}>{t.desc}</p>
              {active && (
                <span className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.9)] animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </motion.nav>

      {/* ---------- Workspace ---------- */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5">
        {/* ==== LEFT: inputs ==== */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="glass-card relative flex flex-col min-h-0 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <div className="shrink-0 flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br grid place-items-center', activeTab.gradient)}>
              <activeTab.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-100">{activeTab.label}</h3>
              <p className="text-xs text-gray-500">{activeTab.desc}</p>
            </div>
          </div>

          <form className="flex-1 min-h-0 flex flex-col" onSubmit={(e) => { e.preventDefault(); generate(mode); }}>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
              {mode === 'roadmap' && (
                <>
                  <Input name="current_role" label="Current Role" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Frontend Developer" />
                  <Input name="target_role" label="Target Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Full Stack Developer" />
                  <Select label="Experience Level" value={expLevel} onChange={(e) => setExpLevel(e.target.value)} options={EXP_OPTIONS} />
                  <Input name="tech_stack" label="Preferred Technology Stack" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="e.g. React, Node.js, PostgreSQL" hint="Optional" />
                  <Select label="Learning Time / Week" value={learningTime} onChange={(e) => setLearningTime(e.target.value)} options={TIME_OPTIONS} />
                </>
              )}

              {mode === 'interview' && (
                <>
                  <Input name="role" label="Target Role" value={interviewRole} onChange={(e) => setInterviewRole(e.target.value)} placeholder="e.g. Backend Engineer" />
                  <Select label="Experience Level" value={interviewExp} onChange={(e) => setInterviewExp(e.target.value)} options={EXP_OPTIONS} />
                  <Select label="Interview Type" value={interviewType} onChange={(e) => setInterviewType(e.target.value)} options={INTERVIEW_TYPE_OPTIONS} />
                </>
              )}

              {mode === 'salary' && (
                <>
                  <Input name="role" label="Job Role" value={salaryRole} onChange={(e) => setSalaryRole(e.target.value)} placeholder="e.g. Data Scientist" />
                  <Input name="location" label="Location" value={salaryLocation} onChange={(e) => setSalaryLocation(e.target.value)} placeholder="e.g. Bangalore" />
                  <Input name="experience" type="number" min={0} label="Years of Experience" value={salaryYears} onChange={(e) => setSalaryYears(e.target.value)} placeholder="e.g. 5" />
                  <Input name="skills" label="Skills" value={salarySkills} onChange={(e) => setSalarySkills(e.target.value)} placeholder="Python, SQL, ML" hint="Optional" />
                </>
              )}

              {mode === 'challenges' && (
                <>
                  <Select label="Language" value={chLanguage} onChange={(e) => setChLanguage(e.target.value)} options={LANG_OPTIONS} />
                  <Select label="Difficulty" value={chDifficulty} onChange={(e) => setChDifficulty(e.target.value)} options={DIFFICULTY_OPTIONS} />
                  <Input name="topic" label="Topic" value={chTopic} onChange={(e) => setChTopic(e.target.value)} placeholder="e.g. arrays, linked lists, DP" />
                </>
              )}
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-white/[0.06]">
              <Button type="submit" variant="gradient" className="w-full" loading={loading[mode]} disabled={loading[mode]}>
                {!loading[mode] && <Sparkles className="w-4 h-4" />}
                {loading[mode] ? 'Generating...' : GENERATE_LABELS[mode]}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* ==== RIGHT: result ==== */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="glass-card relative flex flex-col min-h-0 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
          <div className="shrink-0 flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br grid place-items-center', activeTab.gradient)}>
              <activeTab.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-100">{RESULT_TITLES[mode]}</h3>
              <p className="text-xs text-gray-500 truncate">{RESULT_SUBTITLES[mode]}</p>
            </div>
            {results[mode] && (
              <div className="flex items-center gap-1.5 shrink-0">
                <ResultAction icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy'} active={copied} onClick={copyResult} />
                <ResultAction icon={Download} label="Download" onClick={downloadResult} />
                <ResultAction icon={RefreshCw} label="Regenerate" onClick={() => generate(mode)} disabled={loading[mode]} />
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={loading[mode] ? 'loading' : errors[mode] ? 'error' : results[mode] ? `result-${results[mode]!.length}` : 'empty'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="min-h-full"
              >
                {loading[mode] ? (
                  <LoadingBlock text={LOADING_TEXT[mode]} />
                ) : errors[mode] ? (
                  <div className="flex flex-col items-center justify-center min-h-[320px] h-full text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 grid place-items-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="font-medium text-gray-200">{errors[mode]}</p>
                    <p className="text-sm text-gray-500 mt-1.5">{ERROR_TEXT[mode]}</p>
                    <Button variant="outline" className="mt-6" onClick={() => generate(mode)}>
                      <RefreshCw className="w-4 h-4" /> Try again
                    </Button>
                  </div>
                ) : results[mode] ? (
                  <div>
                    {mode === 'roadmap' && <RoadmapView text={results[mode]!} />}
                    {mode === 'interview' && <InterviewView text={results[mode]!} />}
                    {mode === 'salary' && <SalaryView text={results[mode]!} label={salaryLabel} />}
                    {mode === 'challenges' && <ChallengeView text={results[mode]!} />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[320px] h-full text-center">
                    <div className="relative mb-5">
                      <div className="absolute -inset-2 rounded-2xl bg-primary-500/10 blur-lg" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 grid place-items-center">
                        {mode === 'roadmap' && <Route className="w-7 h-7 text-primary-300" />}
                        {mode === 'interview' && <MessageSquareText className="w-7 h-7 text-cyan-300" />}
                        {mode === 'salary' && <DollarSign className="w-7 h-7 text-emerald-300" />}
                        {mode === 'challenges' && <Code2 className="w-7 h-7 text-amber-300" />}
                      </div>
                    </div>
                    <p className="font-medium text-gray-200">{EMPTY_TITLE[mode]}</p>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
                      Fill in the details on the left and press &quot;{GENERATE_LABELS[mode]}&quot;.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}