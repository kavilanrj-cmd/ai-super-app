'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon, Search, Code, Bug, ArrowUpRight,
  Sparkles, Terminal, Shield, Zap, Eye, Cpu
} from 'lucide-react';
import TiltCard from './TiltCard';

const CREATIVE_TOOLS = [
  {
    id: 'image-ai',
    title: 'Image AI Studio',
    subtitle: 'Next-Gen Visual Synthesis',
    description:
      'Generate production-grade photorealistic renders, UI design concepts, and vectors directly from descriptive natural language.',
    route: '/image-ai',
    icon: ImageIcon,
    accent: 'from-pink-500 via-purple-500 to-indigo-500',
    stat: '4K Ultra-Res',
    tag: 'Diffusion Engine',
    features: ['Custom aspect ratios', 'Style conditioning', 'Instant download'],
  },
  {
    id: 'research',
    title: 'Research Agent',
    subtitle: 'Autonomous Web Intelligence',
    description:
      'Dispatches autonomous agents across hundreds of verified live web endpoints, synthesizing comprehensive multi-page executive dossiers.',
    route: '/research',
    icon: Search,
    accent: 'from-amber-500 via-orange-500 to-red-500',
    stat: '100% Sourced',
    tag: 'Deep Intelligence',
    features: ['Multi-query breadth', 'Automatic deduplication', 'Full citations'],
  },
  {
    id: 'code-review',
    title: 'Code Reviewer',
    subtitle: 'Automated AST & Security Audit',
    description:
      'Deep static code analysis that exposes hidden memory leaks, security attack surfaces, and algorithmic performance bottlenecks.',
    route: '/code-review',
    icon: Code,
    accent: 'from-blue-500 via-cyan-500 to-teal-500',
    stat: 'OWASP Compliant',
    tag: 'AST Inspection',
    features: ['Zero false-positives', 'Complexity metrics', 'Automated refactoring'],
  },
  {
    id: 'bug-finder',
    title: 'Bug Finder',
    subtitle: 'Autonomous Diagnostics Engine',
    description:
      'Isolates tricky runtime stack traces, reproduces intermittent race conditions, and generates ready-to-merge git diff patches.',
    route: '/bug-finder',
    icon: Bug,
    accent: 'from-violet-500 via-purple-600 to-fuchsia-600',
    stat: 'Auto Diff Patches',
    tag: 'Root-Cause Analysis',
    features: ['Stack trace parsing', 'Patch generation', 'Regression prevention'],
  },
];

export default function CreativeAI() {
  return (
    <section className="relative py-24 sm:py-36 w-full overflow-hidden">
      {/* Background radial aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Engineering & Creative Intelligence
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Synthesize visuals.
            <br />
            <span className="gradient-text">Refactor code at scale.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Supercharge both creative expression and technical execution with high-throughput
            generative diffusion and deep AST-aware compilers.
          </p>
        </div>

        {/* 4-Card 3D Tilt Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREATIVE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.id} className="h-full">
                <TiltCard maxTilt={8} className="h-full">
                  <div className="h-full rounded-3xl bg-[#090916]/85 border border-white/[0.08] hover:border-primary-500/40 p-6 flex flex-col justify-between backdrop-blur-xl shadow-xl transition-all duration-300 group">
                    <div>
                      {/* Top icon and tag */}
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.05] text-gray-300 border border-white/[0.08]">
                          {tool.tag}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-cyan-400 mb-1">
                        {tool.subtitle}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">
                        {tool.description}
                      </p>

                      {/* Stat badge */}
                      <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.05] text-xs font-mono text-purple-300 font-semibold mb-6 inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>{tool.stat}</span>
                      </div>

                      {/* Feature list */}
                      <ul className="space-y-2 text-xs text-gray-400 mb-6">
                        {tool.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Launch button */}
                    <Link
                      href={tool.route}
                      className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-xs font-semibold text-gray-200 hover:text-white flex items-center justify-between px-4 border border-white/[0.08] transition-all group-hover:border-primary-500/40"
                    >
                      <span>Launch {tool.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
