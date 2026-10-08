'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, FileText, FileEdit, GraduationCap, Briefcase,
  Search, Code, Bug, FolderOpen, BookOpen, Image as ImageIcon,
  CheckSquare, ArrowUpRight, Sparkles, Terminal, Activity,
  Layers, Cpu, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import TiltCard from './TiltCard';

interface WorkspaceModule {
  id: string;
  name: string;
  category: 'Intelligence' | 'Engineering' | 'Career' | 'Content';
  description: string;
  route: string;
  icon: any;
  accent: string;
  borderGlow: string;
  badge: string;
  previewSnippet: {
    title: string;
    action: string;
    result: string;
    metrics: string;
  };
}

const MODULES: WorkspaceModule[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    category: 'Intelligence',
    description: 'Ultra-low latency conversational intelligence with streaming context awareness.',
    route: '/chat',
    icon: MessageSquare,
    accent: 'from-blue-500 to-cyan-400',
    borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20',
    badge: 'Real-time Streaming',
    previewSnippet: {
      title: 'Conversational Reasoning Hub',
      action: 'Synthesizing complex multi-turn context across repositories & technical manuals',
      result: 'Streaming 120 tokens/sec with verified source grounding and code sandbox generation.',
      metrics: 'Lat: 18ms · Tokens: 4,096 · Memory: Active',
    },
  },
  {
    id: 'resume',
    name: 'Resume Analyzer',
    category: 'Career',
    description: 'ATS scoring, skill gap detection, and algorithmic hiring match optimization.',
    route: '/resume',
    icon: FileText,
    accent: 'from-purple-500 to-pink-500',
    borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/20',
    badge: 'ATS Score 94/100',
    previewSnippet: {
      title: 'Algorithmic Resume Screening',
      action: 'Extracting technical competencies, quantified achievements, and role alignment',
      result: 'ATS Compatibility: 94% · 14 Key Skills Verified · 3 High-Impact Bullet Enhancements.',
      metrics: 'ATS Score: 94/100 · Industry: Staff Engineer',
    },
  },
  {
    id: 'code-review',
    name: 'Code Reviewer',
    category: 'Engineering',
    description: 'Autonomous AST syntax validation, security audits, and latency refactoring.',
    route: '/code-review',
    icon: Code,
    accent: 'from-violet-500 to-indigo-500',
    borderGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/20',
    badge: 'Security & Perf',
    previewSnippet: {
      title: 'Static & Dynamic Code Analysis',
      action: 'Evaluating concurrency deadlock, memory leak vectors, and time complexity',
      result: '0 Critical Vulnerabilities · O(n²) loop optimized to O(n log n) · +42% throughput.',
      metrics: 'Clean Architecture · 0 Memory Leaks',
    },
  },
  {
    id: 'bug-finder',
    name: 'Bug Finder',
    category: 'Engineering',
    description: 'Root-cause diagnostic engine that isolates stack traces and proposes verified patches.',
    route: '/bug-finder',
    icon: Bug,
    accent: 'from-red-500 to-amber-500',
    borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
    badge: 'Automated Fixes',
    previewSnippet: {
      title: 'Autonomous Root Cause Diagnostics',
      action: 'Tracing uncaught Promise rejection across asynchronous state dispatchers',
      result: 'Root cause pinpointed at line 142. Diff patch generated with unit regression test.',
      metrics: 'Crash Solved · Patch Verified',
    },
  },
  {
    id: 'documents',
    name: 'Documents',
    category: 'Content',
    description: 'Generate production-ready technical specs, architecture briefs, and reports.',
    route: '/documents',
    icon: FolderOpen,
    accent: 'from-pink-500 to-rose-500',
    borderGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/20',
    badge: 'Studio Engine',
    previewSnippet: {
      title: 'Unified Document Studio',
      action: 'Structuring multi-section executive reports with charts, executive summary, and tables',
      result: 'Generated 14-page System Architecture RFC ready for export in PDF/Markdown.',
      metrics: 'RFC Drafted · Word Count: 3,420',
    },
  },
  {
    id: 'pdf-chat',
    name: 'PDF Chat',
    category: 'Content',
    description: 'Deep document comprehension with page citations and vector retrieval.',
    route: '/pdf-chat',
    icon: BookOpen,
    accent: 'from-cyan-500 to-teal-400',
    borderGlow: 'hover:border-teal-500/50 hover:shadow-teal-500/20',
    badge: 'Vector RAG',
    previewSnippet: {
      title: 'Multi-Modal PDF Retrieval',
      action: 'Ingesting 120-page financial disclosure document into semantic vector embeddings',
      result: 'Extracted EBITDA margins, debt amortizations, and risk disclosures with page citations.',
      metrics: 'Chunking: 256 tokens · Accuracy: 99.4%',
    },
  },
  {
    id: 'research',
    name: 'Research Agent',
    category: 'Intelligence',
    description: 'Autonomous multi-query web intelligence and cited literature syntheses.',
    route: '/research',
    icon: Search,
    accent: 'from-amber-500 to-orange-500',
    borderGlow: 'hover:border-orange-500/50 hover:shadow-orange-500/20',
    badge: 'Deep Intelligence',
    previewSnippet: {
      title: 'Autonomous Web Research Engine',
      action: 'Investigating transformer state-space models across 24 peer-reviewed publications',
      result: 'Synthesized 8 key technical breakthroughs with mathematical formulation comparisons.',
      metrics: '24 Sources Analyzed · Citation Index: 100%',
    },
  },
  {
    id: 'career',
    name: 'Career Assistant',
    category: 'Career',
    description: 'Strategic roadmap mapping, salary intelligence, and promotion planning.',
    route: '/career',
    icon: Briefcase,
    accent: 'from-emerald-500 to-green-500',
    borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
    badge: 'Salary & Strategy',
    previewSnippet: {
      title: 'Career Trajectory Strategist',
      action: 'Evaluating skill gaps for transition from Senior Engineer to Principal Architect',
      result: 'Milestone roadmap created: distributed systems mastery, executive communications plan.',
      metrics: 'Market Value: +$65k target compensation',
    },
  },
  {
    id: 'interview',
    name: 'Interview Prep',
    category: 'Career',
    description: 'Interactive AI voice & text mock interviews with realistic rubric evaluation.',
    route: '/interview',
    icon: GraduationCap,
    accent: 'from-sky-500 to-blue-600',
    borderGlow: 'hover:border-sky-500/50 hover:shadow-sky-500/20',
    badge: 'Mock Simulator',
    previewSnippet: {
      title: 'System Design Mock Simulator',
      action: 'Simulating FAANG Staff Engineer system design interview on distributed cache design',
      result: 'Feedback: Strong trade-off articulation, suggestions on cache invalidation policies.',
      metrics: 'Sim Score: 92/100 · Readiness: High',
    },
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter',
    category: 'Career',
    description: 'Tailored high-conversion application letters matched to specific job descriptions.',
    route: '/cover-letter',
    icon: FileEdit,
    accent: 'from-fuchsia-500 to-purple-600',
    borderGlow: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20',
    badge: 'Tailored Match',
    previewSnippet: {
      title: 'Hyper-Targeted Value Proposition',
      action: 'Extracting core values and tech stack requirements from targeted job listing',
      result: 'Created compelling 3-paragraph executive narrative showcasing measurable outcomes.',
      metrics: 'Fit Score: 98% · Tone: Confident & Authentic',
    },
  },
  {
    id: 'jobs',
    name: 'Find Jobs',
    category: 'Career',
    description: 'Algorithmic matching across verified high-tier remote & global openings.',
    route: '/jobs',
    icon: Briefcase,
    accent: 'from-teal-500 to-emerald-400',
    borderGlow: 'hover:border-teal-500/50 hover:shadow-teal-500/20',
    badge: 'Live Openings',
    previewSnippet: {
      title: 'Intelligent Job Aggregator',
      action: 'Cross-referencing applicant technical stack against 1,200+ active engineering openings',
      result: 'Matched 18 top tier roles with salary ranges from $180k to $240k.',
      metrics: 'Filtered 1,200+ roles · 18 Prime Matches',
    },
  },
  {
    id: 'image-ai',
    name: 'Image AI',
    category: 'Content',
    description: 'Ultra-high-definition visual asset synthesis, prompt engineering, and design mockup.',
    route: '/image-ai',
    icon: ImageIcon,
    accent: 'from-purple-500 to-indigo-600',
    borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/20',
    badge: 'Visual Synthesis',
    previewSnippet: {
      title: 'Diffusion Engine & UI Mockups',
      action: 'Generating photorealistic 3D glassmorphic dashboard illustrations and assets',
      result: 'Synthesized 4K render with custom lighting gradients and volumetric refraction.',
      metrics: 'Render Resolution: 4096x2160 · 60fps assets',
    },
  },
  {
    id: 'tasks',
    name: 'Task Manager',
    category: 'Engineering',
    description: 'Automated sprint tracking, AI task prioritization, and dependency mapping.',
    route: '/tasks',
    icon: CheckSquare,
    accent: 'from-amber-500 to-yellow-400',
    borderGlow: 'hover:border-yellow-500/50 hover:shadow-yellow-500/20',
    badge: 'Sprint Planning',
    previewSnippet: {
      title: 'AI Dependency & Task Scheduler',
      action: 'Breaking down epics into structured sprint deliverables with automated story points',
      result: 'Created 12 prioritized tickets with clear acceptance criteria and milestone deadlines.',
      metrics: 'Sprint Velocity: +28% · Critical Path Mapped',
    },
  },
];

export default function AIWorkspace() {
  const [activeId, setActiveId] = useState<string>('chat');
  const activeModule = MODULES.find((m) => m.id === activeId) || MODULES[0];

  return (
    <section id="workspace" className="relative py-24 sm:py-32 w-full overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Unified Neural Deck
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            Everything you need.
            <br />
            <span className="gradient-text">One AI workspace.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Experience a cohesive ecosystem where conversational chat, code review, career guidance,
            and document synthesis operate in harmonic sync.
          </motion.p>
        </div>

        {/* Central Immersive Workspace Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Module Selector Deck (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {MODULES.map((mod) => {
              const isActive = mod.id === activeId;
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => setActiveId(mod.id)}
                  onMouseEnter={() => setActiveId(mod.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? 'bg-white/[0.08] border-primary-500/50 shadow-lg shadow-primary-500/10'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.accent} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-white">
                          {mod.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 font-mono">
                          {mod.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 max-w-[240px]">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={mod.route}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
                    title={`Open ${mod.name}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Column: Central Live AI Command Station (7 cols) */}
          <div className="lg:col-span-7 sticky top-24">
            <TiltCard maxTilt={5}>
              <div className="relative rounded-3xl bg-[#090916]/85 border border-white/[0.1] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden">
                {/* Top Terminal Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-primary-400" />
                      workspace://system/v2.0/{activeModule.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 font-medium">READY</span>
                  </div>
                </div>

                {/* Animated Console Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Active Module Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeModule.accent} flex items-center justify-center text-white shadow-xl shadow-primary-500/20`}
                        >
                          <activeModule.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white">
                            {activeModule.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {activeModule.description}
                          </p>
                        </div>
                      </div>

                      <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary-500/15 border border-primary-500/30 text-primary-300">
                        {activeModule.badge}
                      </span>
                    </div>

                    {/* Live Processing Simulation Box */}
                    <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-5 space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between text-gray-400 border-b border-white/[0.05] pb-2.5">
                        <span className="flex items-center gap-2 text-cyan-300">
                          <Activity className="w-3.5 h-3.5" />
                          {activeModule.previewSnippet.title}
                        </span>
                        <span className="text-gray-500">
                          {activeModule.previewSnippet.metrics}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-gray-300 flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                          <span>{activeModule.previewSnippet.action}</span>
                        </div>
                        <div className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {activeModule.previewSnippet.result}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Launch Action Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>Connected to high-speed FastAPI backend</span>
                      </div>

                      <Link
                        href={activeModule.route}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all group"
                      >
                        <span>Launch {activeModule.name}</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
