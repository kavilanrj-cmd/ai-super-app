'use client';

import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Upload, Sparkles, Bot, Zap, MessageSquare, Activity } from 'lucide-react';
import { SPARKLES, makeParticles } from '@/lib/particles';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

function SparklesField({ count = 14 }: { count?: number }) {
  const spec =
    count === SPARKLES.length
      ? SPARKLES
      : makeParticles(count);
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {spec.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={
            {
              left: `${6 + (p.x * 88) / 100}%`,
              top: `${4 + (p.y * 88) / 100}%`,
              width: p.size * 0.86 + 0.4,
              height: p.size * 0.86 + 0.4,
              animationDelay: `${p.delay}s`,
              '--dur': `${p.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function HeroSection({ displayName }: { displayName: string }) {
  const router = useRouter();
  const rotateX = useSpring(0, { stiffness: 130, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 130, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    const ny = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    rotateX.set(nx * -4);
    rotateY.set(ny * 5);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="dash-hero hero-panel"
    >
      <div className="light-wave" />
      <div className="light-wave two" />
      <SparklesField />
      <div className="hero-shine" />

      <div className="hero-inner relative z-10 grid lg:grid-cols-[1.25fr_0.75fr] items-center h-full">
        {/* Left copy */}
        <div className="flex flex-col justify-center min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-badge inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/10 text-[var(--text-primary)] backdrop-blur-sm w-fit"
          >
            <Sparkles className="w-3 h-3 text-secondary-300" />
            <span className="hero-greet font-medium">
              Welcome back
            </span>
            <span className="inline-block animate-float">👋</span>
            <span className="live-dot" />
            <span className="text-emerald-300/90 font-medium">Online</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-[clamp(2px,0.4vh,6px)]"
          >
            <h1 className="hero-title font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
              {greeting()},
              <br />
              <span className="gradient-text-animated">{displayName}</span>
            </h1>
            <p className="hero-sub text-[var(--text-secondary)] max-w-lg leading-snug">
              Small steps with AI can create big opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="hero-cta flex flex-wrap items-center"
          >
            <button onClick={() => router.push('/chat')} className="btn-hero">
              Start a Conversation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => router.push('/documents')} className="btn-ghost-glass">
              <Upload className="w-4 h-4" />
              Upload a Document
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hero-meta flex flex-wrap items-center gap-x-5 gap-y-1 mt-[clamp(2px,0.5vh,6px)] text-[var(--muted)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-primary-300" /> 11 AI agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Real-time streaming
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-300" /> Always on
            </span>
          </motion.div>
        </div>

        {/* Right AI visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 16 }}
          className="hidden md:flex items-center justify-center h-full will-change-transform"
        >
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 900 }}
            className="w-full h-full flex items-center justify-center will-change-transform"
          >
            <div className="ai-visual">
            <div className="ai-halo" />
            <div className="ai-halo second" />
            <div className="ai-ring r1" />
            <div className="ai-ring r2" />
            <div className="ai-chip c1">
              <Sparkles className="w-3 h-3 text-primary-300" /> Your AI Partner for a Brighter Tomorrow
            </div>
            <div className="ai-chip c2">
              <Zap className="w-3 h-3 text-emerald-300" /> Ideas + AI = Opportunities
            </div>
            <div className="ai-chip c3">
              <MessageSquare className="w-3 h-3 text-pink-300" /> Always-on agents
            </div>
            <div className="ai-core">
              <span className="ai-eye l" />
              <span className="ai-eye r" />
              <span className="absolute top-[76px] left-1/2 -translate-x-1/2 h-3 w-8 rounded-b-full border-b-2 border-x border-white/40" />
            </div>
          </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}