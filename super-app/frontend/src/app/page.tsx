'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks';
import {
  Sparkles, MessageSquare, FileText, Code, Briefcase, PenTool, Brain,
  Bot, Stethoscope, DollarSign, Languages, BookOpen, Image, ListChecks,
  ArrowRight, ArrowUpRight, Wand2, Zap, Shield, Flame, Github, Twitter,
} from 'lucide-react';

const features = [
  { icon: MessageSquare, title: 'AI Chat', desc: 'Conversational AI with smooth, real-time streaming responses.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: FileText, title: 'Resume Analysis', desc: 'ATS scoring, skill extraction and job-match insights in seconds.', gradient: 'from-purple-500 to-pink-500' },
  { icon: Code, title: 'Code Review', desc: 'Bug detection, security checks and optimization suggestions.', gradient: 'from-violet-500 to-indigo-500' },
  { icon: Briefcase, title: 'Career Planning', desc: 'Roadmaps, mock interviews and real salary intelligence.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: PenTool, title: 'Document Studio', desc: 'Emails, cover letters and long-form writing, generated for you.', gradient: 'from-pink-500 to-rose-500' },
  { icon: Brain, title: 'Research Agent', desc: 'Deep-dive research and crisp summaries on any topic.', gradient: 'from-amber-500 to-orange-500' },
];

const agents = [
  { icon: Bot, label: 'Resume' },
  { icon: Briefcase, label: 'Career' },
  { icon: Code, label: 'Coding' },
  { icon: Brain, label: 'Research' },
  { icon: Stethoscope, label: 'Medical' },
  { icon: DollarSign, label: 'Finance' },
  { icon: Languages, label: 'Translate' },
  { icon: BookOpen, label: 'Summarize' },
  { icon: PenTool, label: 'Document' },
  { icon: Image, label: 'Vision' },
  { icon: ListChecks, label: 'Planning' },
];

const heroStats = [
  { icon: Zap, value: 'Real-time', label: 'Streaming responses' },
  { icon: Brain, value: '11', label: 'Specialized AI agents' },
  { icon: Shield, value: 'Private', label: 'By default' },
];

function FloatingParticles({ count = 40 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3.5 + 1,
        duration: Math.random() * 8 + 5,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.35 + 0.08,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { user, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="relative min-h-screen bg-[#050508] overflow-hidden">
      <FloatingParticles />

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/3 left-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-glow transition-shadow"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">AI Super App</span>
        </Link>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {user ? (
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary hidden sm:inline-flex">
                Sign In
              </Link>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </motion.nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Hero */}
        <section className="relative pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-primary-200 backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              One workspace for every AI task
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white"
          >
            One workspace.
            <br />
            <span className="gradient-text-animated">Every AI tool.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mt-5 sm:mt-6"
          >
            Chat, code, plan your career, generate documents and more — powered by 11 specialized
            AI agents in one beautiful workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            <Link href="/login" className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center py-3.5 px-8 text-sm sm:text-base">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto justify-center py-3.5 px-8 text-sm sm:text-base">
              Explore Features <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10 sm:mt-12 max-w-2xl mx-auto"
          >
            {heroStats.map((s) => (
              <div key={s.label} className="glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                <s.icon className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-gray-300">
                  <span className="font-semibold text-white">{s.value}</span> {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Hero mock chat */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-primary-500/15 via-fuchsia-500/10 to-purple-500/15 rounded-[40px] blur-2xl pointer-events-none" />
          <div className="relative glass-card overflow-hidden text-left shadow-2xl shadow-primary-500/10">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-gray-400 font-mono hidden sm:block">AI Assistant — Groq (LLaMA 70B)</span>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary-500/20 to-violet-500/20 border border-primary-500/25 px-4 py-2.5 text-sm text-gray-200">
                  Draft a product launch email and a cover letter for a senior React role.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm text-gray-300 space-y-1.5">
                  <p>Done! I&apos;ve generated both documents and saved them to your workspace.</p>
                  <p className="text-xs text-gray-500">Email subject: &quot;Excited to launch what we built&quot; · 1,240 words</p>
                </div>
              </div>
              <div className="flex justify-start items-center">
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm text-gray-300">
                  Scanning resume for ATS insights<span className="streaming-cursor" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <section id="features" className="py-16 sm:py-24 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <p className="text-xs font-medium text-primary-400 uppercase tracking-[0.2em] mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Built for <span className="gradient-text">every workflow</span>
            </h2>
            <p className="text-gray-400 text-base mt-4">
              From quick chats to deep research — a full toolkit of AI superpowers, ready in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card p-6 group relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-100 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{feature.desc}</p>
                <span className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl -mr-8 -mt-8 transition-opacity opacity-0 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Agents */}
        <section className="py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden gradient-border glass-card p-6 sm:p-10 lg:p-12"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
              <div className="lg:max-w-md shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center shadow-glow-sm mb-5">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  11 specialized <span className="gradient-text">AI agents</span>
                </h2>
                <p className="text-gray-400 mt-3 text-sm sm:text-base leading-relaxed">
                  Each agent is fine-tuned for its domain — resume screening, career roadmaps, coding,
                  medical guidance, finance, translation and more.
                </p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
                  Meet the agents <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2.5">
                  {agents.map((agent, i) => (
                    <motion.span
                      key={agent.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs sm:text-sm text-gray-300 hover:border-primary-500/40 hover:text-white transition-colors"
                    >
                      <agent.icon className="w-3.5 h-3.5 text-primary-400" />
                      {agent.label}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl animated-gradient-bg border border-primary-500/20 p-8 sm:p-12 lg:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Start building <span className="gradient-text-animated">something amazing</span>
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mt-4 max-w-xl mx-auto">
                Free 500 AI credits to get started. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center py-3.5 px-8 text-sm sm:text-base">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto justify-center py-3.5 px-8 text-sm sm:text-base">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-300">AI Super App</span>
            <span className="text-xs text-gray-600 hidden sm:inline">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
