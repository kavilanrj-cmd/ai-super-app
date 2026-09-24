'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageSquare, FileSearch, FileText, Mic, Users, Briefcase, Code2, Bug,
  FolderOpen, FileType2, FlaskConical, Image as ImageIcon, ListChecks, ArrowRight,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'AI Tools' | 'Career' | 'Development' | 'Content' | 'Productivity';

type Tone = 'blue' | 'pink' | 'green' | 'violet' | 'amber' | 'orange' | 'red' | 'teal';

interface Feature {
  title: string;
  desc: string;
  icon: any;
  route: string;
  cat: Category;
  tone: Tone;
  featured?: boolean;
}

const FEATURES: Feature[] = [
  { title: 'AI Chat', desc: 'Chat with multiple AI models', icon: MessageSquare, route: '/chat', cat: 'AI Tools', tone: 'blue' },
  { title: 'Resume Analyzer', desc: 'ATS score & insights', icon: FileSearch, route: '/resume', cat: 'AI Tools', tone: 'pink' },
  { title: 'Cover Letter', desc: 'Generate professional letters', icon: FileText, route: '/cover-letter', cat: 'Career', tone: 'green' },
  { title: 'Interview Prep', desc: 'Practice with AI', icon: Mic, route: '/interview', cat: 'Career', tone: 'violet' },
  { title: 'Career Assistant', desc: 'Personalized career guidance', icon: Users, route: '/career', cat: 'Career', tone: 'orange' },
  { title: 'Find Jobs', desc: 'Search & apply to jobs', icon: Briefcase, route: '/jobs', cat: 'Career', tone: 'blue' },
  { title: 'Code Reviewer', desc: 'Review and improve code', icon: Code2, route: '/code-review', cat: 'Development', tone: 'violet' },
  { title: 'Bug Finder', desc: 'Detect and fix issues', icon: Bug, route: '/bug-finder', cat: 'Development', tone: 'red' },
  { title: 'Documents', desc: 'Manage your files', icon: FolderOpen, route: '/documents', cat: 'Content', tone: 'green' },
  { title: 'PDF Chat', desc: 'Chat with your PDFs', icon: FileType2, route: '/pdf-chat', cat: 'AI Tools', tone: 'amber' },
  { title: 'Research Agent', desc: 'Deep research with AI', icon: FlaskConical, route: '/research', cat: 'AI Tools', tone: 'teal' },
  { title: 'Image AI', desc: 'Generate stunning visuals', icon: ImageIcon, route: '/image-ai', cat: 'AI Tools', tone: 'pink' },
  { title: 'Manage Tasks', desc: 'Organize your workflow', icon: ListChecks, route: '/tasks', cat: 'Productivity', tone: 'green' },
  { title: 'AI App Builder', desc: 'Build apps from natural language', icon: Rocket, route: '/app-builder', cat: 'AI Tools', tone: 'violet', featured: true },
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
                  active && 'is-active'
                )}
              >
                {f}
                <span className="pill-count px-1 py-0.5 rounded-md">{count}</span>
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
                  'dash-feature-card th-tool-card premium-hover group relative overflow-hidden rounded-xl border text-left transition-all duration-300',
                  `th-tone-${f.tone}`,
                  f.featured && 'th-featured',
                  isCentered && 'col-start-2 col-span-2'
                )}
              >
                {f.featured && (
                  <>
                    <span className="th-featured-orb" aria-hidden="true" />
                    <span className="th-featured-badge">
                      <Rocket className="w-3 h-3" />
                      Local AI
                    </span>
                  </>
                )}

                <span className="th-icon-tile">
                  <f.icon />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="card-title block font-semibold text-white truncate">{f.title}</span>
                  <span className="card-desc block text-white/60 truncate">{f.desc}</span>
                </span>

                <ArrowRight className="card-arrow text-white/50 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}