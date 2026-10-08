'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Rocket, Shield, Terminal } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function FinalCTA() {
  return (
    <section className="relative py-32 sm:py-44 w-full overflow-hidden text-center">
      {/* Volumetric atmospheric animated lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[650px] bg-gradient-to-tr from-primary-600/25 via-purple-600/20 to-cyan-500/15 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/15 rounded-full blur-[130px] pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-cyan-300 uppercase tracking-widest mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          The Future of Intelligence
        </div>

        {/* Dramatic Headline */}
        <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.03]">
          Build. Create.
          <br />
          <span className="gradient-text-animated">Solve. With AI.</span>
        </h2>

        {/* Supporting text */}
        <p className="mt-8 text-lg sm:text-2xl text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
          Everything you need to turn ideas into reality.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/30 border border-primary-400/30 transition-all group"
            >
              <span>Open AI Workspace</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link
              href="/app-builder"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 border border-white/[0.12] hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all group"
            >
              <Rocket className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Build an App</span>
            </Link>
          </MagneticButton>
        </div>

        {/* Bottom guarantee */}
        <div className="mt-14 flex items-center justify-center gap-6 text-xs text-gray-500 font-mono">
          <span>500 Free AI Credits Included</span>
          <span>•</span>
          <span>No Credit Card Required</span>
          <span>•</span>
          <span>Instant Access</span>
        </div>
      </div>
    </section>
  );
}
