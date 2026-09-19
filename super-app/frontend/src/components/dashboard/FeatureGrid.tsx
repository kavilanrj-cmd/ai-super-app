'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageSquare, FileSearch, FileText, Mic, Compass, Briefcase, Code2, Bug,
  Folder, FileUp, Telescope, Image as ImageIcon, ListTodo, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'AI Tools' | 'Career' | 'Development' | 'Content' | 'Productivity';

interface Feature {
  title: string;
  desc: string;
  icon: any;
  route: string;
  cat: Category;
  chip: string;
  text: string;
  glow: string;
}

const FEATURES: Feature[] = [
  { title: 'AI Chat', desc: 'Chat with multiple AI models', icon: MessageSquare, route: '/chat', cat: 'AI Tools', text: 'text-violet-300', chip: 'bg-violet-500/20', glow: 'rgba(139,92,246,0.45)' },
  { title: 'Resume Analyzer', desc: 'ATS score & insights', icon: FileSearch, route: '/resume', cat: 'AI Tools', text: 'text-blue-300', chip: 'bg-blue-500/20', glow: 'rgba(59,130,246,0.45)' },
  { title: 'Cover Letter', desc: 'Generate professional letters', icon: FileText, route: '/cover-letter', cat: 'Career', text: 'text-purple-300', chip: 'bg-purple-500/20', glow: 'rgba(168,85,247,0.45)' },
  { title: 'Interview Prep', desc: 'Practice with AI', icon: Mic, route: '/interview', cat: 'Career', text: 'text-cyan-300', chip: 'bg-cyan-500/20', glow: 'rgba(34,211,238,0.45)' },
  { title: 'Career Assistant', desc: 'Personalized career guidance', icon: Compass, route: '/career', cat: 'Career', text: 'text-indigo-300', chip: 'bg-indigo-500/20', glow: 'rgba(99,102,241,0.45)' },
  { title: 'Find Jobs', desc: 'Search & apply to jobs', icon: Briefcase, route: '/jobs', cat: 'Career', text: 'text-sky-300', chip: 'bg-sky-500/20', glow: 'rgba(56,189,248,0.45)' },
  { title: 'Code Reviewer', desc: 'Review and improve code', icon: Code2, route: '/code-review', cat: 'Development', text: 'text-indigo-300', chip: 'bg-indigo-500/20', glow: 'rgba(99,102,241,0.45)' },
  { title: 'Bug Finder', desc: 'Detect and fix issues', icon: Bug, route: '/bug-finder', cat: 'Development', text: 'text-violet-300', chip: 'bg-violet-500/20', glow: 'rgba(139,92,246,0.45)' },
  { title: 'Documents', desc: 'Manage your files', icon: Folder, route: '/documents', cat: 'Content', text: 'text-pink-300', chip: 'bg-pink-500/20', glow: 'rgba(236,72,153,0.45)' },
  { title: 'PDF Chat', desc: 'Chat with your PDFs', icon: FileUp, route: '/pdf-chat', cat: 'AI Tools', text: 'text-purple-300', chip: 'bg-purple-500/20', glow: 'rgba(168,85,247,0.45)' },
  { title: 'Research Agent', desc: 'Deep research with AI', icon: Telescope, route: '/research', cat: 'AI Tools', text: 'text-sky-300', chip: 'bg-sky-500/20', glow: 'rgba(56,189,248,0.45)' },
  { title: 'Image AI', desc: 'Generate stunning visuals', icon: ImageIcon, route: '/image-ai', cat: 'AI Tools', text: 'text-fuchsia-300', chip: 'bg-fuchsia-500/20', glow: 'rgba(217,70,239,0.45)' },
  { title: 'Manage Tasks', desc: 'Organize your workflow', icon: ListTodo, route: '/tasks', cat: 'Productivity', text: 'text-cyan-300', chip: 'bg-cyan-500/20', glow: 'rgba(34,211,238,0.45)' },
];

const FILTERS = ['All', 'AI Tools', 'Career', 'Development', 'Content', 'Productivity'] as const;

export default function FeatureGrid() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const visible = filter === 'All' ? FEATURES : FEATURES.filter((f) => f.cat === filter);

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.34, duration: 0.5 }}
      className="dash-features flex flex-col min-h-0 gap-[clamp(4px,0.5vh,7px)]"
    >
      {/* Header + filters */}
      <div className="dash-feature-head">
        <div className="min-w-0">
          <h2 className="font-bold tracking-tight text-[var(--text-primary)]">
            All <span className="gradient-text-animated">Features</span>
          </h2>
          <p className="text-[var(--text-secondary)]">Everything you need, all in one place.</p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
          {FILTERS.map((f) => {
            const active = filter === f;
            const count = f === 'All' ? FEATURES.length : FEATURES.filter((x) => x.cat === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={cn(
                  'dash-filter-pill relative inline-flex items-center gap-1.5 font-semibold border transition-all duration-300',
                  active
                    ? 'text-white border-transparent shadow-glow-sm bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500'
                    : 'text-[var(--text-secondary)] border-[var(--border)] bg-white/[0.03] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                {f}
                <span
                  className={cn(
                    'pill-count px-1 py-0.5 rounded-md',
                    active ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-[var(--muted)]'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature grid */}
      <div className="dash-feature-grid">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((f, index) => {
            const isCentered = filter === 'All' && index === visible.length - 1;
            const enter = reduce ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 };
            const mount = reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 };
            return (
              <motion.button
                key={f.title}
                initial={enter}
                animate={mount}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={reduce ? { duration: 0.1 } : { delay: index * 0.03, duration: 0.28, ease: 'easeOut' }}
                onClick={() => router.push(f.route)}
                className={cn(
                  'dash-feature-card premium-hover group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--surface-hover)] hover:shadow-glow-sm',
                  isCentered && 'col-start-2 col-span-2'
                )}
                style={{ '--glow': f.glow, '--chip-glow': f.glow.replace('0.45', '0.3') } as React.CSSProperties}
              >
                {/* hover gradient wash */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(110% 120% at 0% 0%, ${f.glow.replace('0.45', '0.16')}, transparent 55%)` }}
                />
                <span
                  className={cn(
                    'card-chip flex items-center justify-center bg-gradient-to-br border border-white/10 transition-transform duration-300 group-hover:scale-110',
                    f.chip
                  )}
                >
                  <f.icon className={cn('text-white drop-shadow', f.text)} />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="card-title block font-semibold text-[var(--text-primary)] truncate">{f.title}</span>
                  <span className="card-desc block text-[var(--text-secondary)] truncate">{f.desc}</span>
                </span>

                <ArrowRight className="card-arrow text-[var(--muted)] group-hover:text-primary-300 transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}