'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles, ArrowRight, ArrowDown, Rocket, Shield, Zap,
  Brain, Bot, Code2, Terminal, Cpu
} from 'lucide-react';
import HeroCanvasLoader from './HeroCanvasLoader';
import MagneticButton from './MagneticButton';

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Scroll animations for cinematic transition
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.88]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 pb-16"
    >
      {/* 3D React Three Fiber AI Core */}
      <HeroCanvasLoader />

      {/* Volumetric background lights */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-primary-600/15 via-purple-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[480px] h-[480px] bg-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none" />
        
        {/* Subtle cyber grid */}
        <div className="absolute inset-0 cyber-grid cyber-radial-mask opacity-30" />
      </motion.div>

      {/* Hero Content Container */}
      <motion.div
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY,
        }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center"
      >
        {/* Futuristic Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/40 group hover:border-primary-500/50 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-200">
              11+ Specialized AI Agents
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
              v2.0
            </span>
          </div>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-white leading-[1.05] sm:leading-[1.02]"
        >
          One Platform.
          <br />
          <span className="gradient-text-animated inline-block mt-2">
            Infinite Possibilities.
          </span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-xl text-gray-400 font-normal leading-relaxed text-balance"
        >
          One intelligent workspace for AI chat, coding, career, documents, research,
          and application development.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <MagneticButton className="w-full sm:w-auto">
            <a
              href="#workspace"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 border border-primary-400/30 transition-all group"
            >
              <span>Explore AI Workspace</span>
              <ArrowDown className="w-4 h-4 text-primary-200 group-hover:translate-y-1 transition-transform" />
            </a>
          </MagneticButton>

          <MagneticButton className="w-full sm:w-auto">
            <Link
              href="/app-builder"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3 border border-white/[0.12] hover:border-cyan-400/40 backdrop-blur-xl shadow-lg transition-all group"
            >
              <Rocket className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Build with AI</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Live capability strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sub-100ms Streaming</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Retention Privacy</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Unified Multi-Model Router</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom subtle indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 pointer-events-none flex flex-col items-center gap-1.5 text-xs font-mono"
      >
        <span>SCROLL TO ENTER</span>
        <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
      </motion.div>
    </section>
  );
}
