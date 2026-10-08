'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Rocket, Sparkles, Terminal, FileCode2, Play, CheckCircle2,
  FolderOpen, FileText, ChevronRight, RefreshCw, ExternalLink,
  Laptop, Code, Layers, Hammer, Boxes, Eye, ArrowRight
} from 'lucide-react';
import MagneticButton from './MagneticButton';

const STEPS = [
  { id: 1, title: 'User Enters Prompt', label: 'Prompt' },
  { id: 2, title: 'AI Understands Intent', label: 'Context' },
  { id: 3, title: 'Architecture Planning', label: 'Planning' },
  { id: 4, title: 'Code Generation', label: 'Coding' },
  { id: 5, title: 'Build Pipeline', label: 'Build' },
  { id: 6, title: 'Preview Expands', label: 'Preview' },
  { id: 7, title: 'Finished App Deployed', label: 'Complete' },
];

export default function AppBuilderShowcase() {
  const [activeStep, setActiveStep] = useState(4);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto progression if user hasn't paused
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 7 ? 1 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // GSAP ScrollTrigger integration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 70%',
        onEnter: () => {
          setActiveStep(3);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="app-builder-showcase"
      className="relative py-24 sm:py-36 w-full overflow-hidden bg-[#030308]/90"
    >
      {/* Volumetric background aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-primary-600/15 via-cyan-500/10 to-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4">
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            Flagship Experience
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Describe it.
            <br />
            <span className="gradient-text-animated">AI builds it.</span>
          </h2>

          <p className="mt-5 text-base sm:text-xl text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Turn natural language into full-stack web applications. Real code, live interactive previews,
            and automated build pipelines in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <Link
                href="/app-builder"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-primary-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-primary-500/25 border border-cyan-400/30 transition-all group"
              >
                <span>Launch App Builder</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>

            <Link
              href="/app-builder"
              className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white font-medium text-sm sm:text-base border border-white/[0.1] transition-all"
            >
              Explore 8 Starter Templates
            </Link>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="mb-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 custom-scrollbar">
            {STEPS.map((step) => {
              const isCurrent = step.id === activeStep;
              const isPast = step.id < activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(step.id);
                    setIsPlaying(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : isPast
                      ? 'bg-primary-500/10 border border-primary-500/20 text-primary-300'
                      : 'bg-white/[0.02] border border-white/[0.05] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? 'bg-cyan-400 text-black font-bold'
                        : isPast
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {isPast ? '✓' : step.id}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cinematic 3-Column Studio Mockup */}
        <div className="rounded-3xl bg-[#070714]/90 border border-white/[0.1] backdrop-blur-2xl shadow-2xl shadow-black/90 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Top Window Navigation Strip */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                AI Super App // Autonomous Application Foundry v2.0
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                Step {activeStep} of 7: {STEPS[activeStep - 1].title}
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/[0.05] transition-colors"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>

          {/* Three Panels: LEFT (Prompt/Chat), CENTER (Live Preview), RIGHT (Files/Build) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT PANEL: AI Conversation & Spec (3.5 cols) */}
            <div className="lg:col-span-4 rounded-2xl bg-black/40 border border-white/[0.06] p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/[0.05] pb-2">
                  <span className="flex items-center gap-1.5 text-primary-300">
                    <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                    User Prompt
                  </span>
                  <span className="text-emerald-400">INPUT ACCEPTED</span>
                </div>

                {/* Prompt Message */}
                <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-3.5 text-xs text-gray-200">
                  &quot;Build a modern SaaS analytics dashboard with revenue graphs, active user
                  counts, real-time conversion rates, and a dark futuristic theme.&quot;
                </div>

                {/* AI Reasoning Response */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-gray-400">NEURAL REASONING:</span>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-xs text-gray-300 font-mono space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>1. Scaffolding Next.js App Router structure</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>2. Generating responsive Lucide metric cards</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>3. Bundling SVG charts & Tailwind styles</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code snippet stream preview */}
              <div className="rounded-xl bg-black/60 border border-white/[0.06] p-3 font-mono text-[11px] text-gray-300 space-y-1">
                <div className="text-gray-500">// src/app/page.tsx</div>
                <div className="text-purple-400">export default function Dashboard() &#123;</div>
                <div className="text-cyan-300 pl-3">const [timeframe, setT] = useState(&apos;30d&apos;);</div>
                <div className="text-gray-400 pl-3">&lt;div className=&quot;grid grid-cols-3&quot;&gt;...&lt;/div&gt;</div>
                <div className="text-purple-400">&#125;</div>
              </div>
            </div>

            {/* CENTER PANEL: Live Interactive App Preview (5.5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-black/50 border border-white/[0.08] p-4 flex flex-col shadow-inner">
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between bg-white/[0.04] rounded-xl px-3 py-2 mb-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Laptop className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-gray-300">localhost:3000/saas-dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300">LIVE PREVIEW</span>
                </div>
              </div>

              {/* LIVE SIMULATED APP CANVAS */}
              <div className="flex-1 rounded-xl bg-[#090b14] border border-white/[0.07] p-5 flex flex-col justify-between space-y-4 shadow-xl">
                <div>
                  {/* Top Bar of the Generated App */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Apex Financial SaaS
                      </h4>
                      <p className="text-[11px] text-gray-400">Real-Time Enterprise Overview</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      ● Active Server
                    </span>
                  </div>

                  {/* 3 Metric Cards inside the Generated App */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <div className="text-[10px] text-gray-400 uppercase font-mono">Monthly ARR</div>
                      <div className="text-lg font-bold text-white mt-1">$148,290</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">▲ +24.8% vs last mo</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <div className="text-[10px] text-gray-400 uppercase font-mono">Active Seats</div>
                      <div className="text-lg font-bold text-white mt-1">42,810</div>
                      <div className="text-[10px] text-cyan-400 mt-0.5">▲ 99.98% Uptime</div>
                    </div>
                  </div>

                  {/* Interactive Chart Visual inside the Generated App */}
                  <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-mono">
                      <span>Conversion Velocity</span>
                      <span className="text-cyan-300">Peak: 98.4%</span>
                    </div>
                    {/* Simulated SVG Bars */}
                    <div className="flex items-end gap-2 h-24 pt-2">
                      {[40, 65, 45, 80, 55, 90, 70, 95, 85, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary-600 to-cyan-400 rounded-t-sm hover:brightness-125 transition-all cursor-pointer"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center justify-between border-t border-white/[0.05] pt-3">
                  <span>Interactive reactive prototype</span>
                  <Link
                    href="/app-builder"
                    className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 font-semibold"
                  >
                    Open in App Builder <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: File Tree & Build Pipeline Status (3 cols) */}
            <div className="lg:col-span-3 rounded-2xl bg-black/40 border border-white/[0.06] p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/[0.05] pb-2">
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                    Generated Tree
                  </span>
                  <span className="text-gray-500">14 files</span>
                </div>

                {/* File Tree List */}
                <div className="font-mono text-xs space-y-1.5 text-gray-300">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>src/app/page.tsx</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>components/Metrics.tsx</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>components/Chart.tsx</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>lib/api.ts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>tailwind.config.ts</span>
                  </div>
                </div>

                {/* Pipeline Step Checklist */}
                <div className="pt-2 border-t border-white/[0.05] space-y-2">
                  <span className="text-[11px] font-mono text-gray-400">BUILD PIPELINE:</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Planning complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dependencies installed</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>TypeScript compiled</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Live HMR active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/app-builder"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary-500/20 transition-all"
              >
                <span>Open Full App Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
