'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Brain, CheckCircle2, Target, GraduationCap,
  Briefcase, ArrowRight, ArrowUpRight, Sparkles, TrendingUp,
  Award, ShieldCheck, ChevronRight
} from 'lucide-react';
import TiltCard from './TiltCard';

const CAREER_STAGES = [
  {
    step: '01',
    name: 'Resume Intake',
    title: 'Multi-Format Deep Parse',
    desc: 'Ingests PDF & Word resumes, converting unstructured work history into high-resolution semantic schemas.',
    route: '/resume',
    icon: FileText,
    accent: 'from-blue-500 to-indigo-500',
    stat: '100% Extraction',
    metrics: ['Skills Cataloged', 'Tenure Analyzed', 'Impact Mapped'],
  },
  {
    step: '02',
    name: 'AI Analysis',
    title: 'Algorithmic Competency Audit',
    desc: 'Benchmarks your accomplishments against industry leaders to detect quantifiable impact gaps and strengths.',
    route: '/resume',
    icon: Brain,
    accent: 'from-violet-500 to-purple-500',
    stat: '+34% Impact Score',
    metrics: ['Bullet Point Refactor', 'Executive Verbs', 'Actionable Metrics'],
  },
  {
    step: '03',
    name: 'ATS Optimization',
    title: 'Applicant Tracking Verification',
    desc: 'Tests your resume against enterprise filters (Workday, Greenhouse, Lever) to guarantee a 90+ score.',
    route: '/resume',
    icon: ShieldCheck,
    accent: 'from-emerald-500 to-teal-500',
    stat: '94/100 ATS Score',
    metrics: ['Keyword Density', 'Parser Cleanliness', 'Formatting Approved'],
  },
  {
    step: '04',
    name: 'Job Matching',
    title: 'High-Value Opportunity Discovery',
    desc: 'Identifies verified openings matching your salary requirements, seniority, and preferred tech stack.',
    route: '/jobs',
    icon: Target,
    accent: 'from-cyan-500 to-blue-500',
    stat: '1,200+ Verified Roles',
    metrics: ['Target Compensation', 'Remote/Hybrid Filter', 'Direct Apply Links'],
  },
  {
    step: '05',
    name: 'Interview Prep',
    title: 'Realistic Mock Simulator',
    desc: 'Conducts simulated behavioral and system design interview rounds with instant rubric evaluation.',
    route: '/interview',
    icon: GraduationCap,
    accent: 'from-pink-500 to-rose-500',
    stat: '98% Pass Rate',
    metrics: ['Audio/Text Simulator', 'STAR Framework', 'Instant Feedback'],
  },
];

export default function CareerSection() {
  const [activeStage, setActiveStage] = useState(2);

  return (
    <section className="relative py-24 sm:py-36 w-full overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 right-1/4 w-[700px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-xs font-mono text-primary-300 uppercase tracking-widest mb-4">
            <Award className="w-3.5 h-3.5 text-primary-400" />
            End-To-End Career Intelligence
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your AI career <span className="gradient-text">copilot.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            From initial resume parsing to high-stakes executive interview simulations.
            Accelerate your trajectory with algorithmic precision.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/career"
              className="px-6 py-2.5 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/40 text-primary-200 text-sm font-semibold inline-flex items-center gap-2 transition-all"
            >
              <span>Explore Career Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Pinned horizontal sequence container */}
        <div className="relative">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 via-emerald-500/40 to-pink-500/40 -translate-y-12 z-0" />

          {/* 5 Horizontal Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
            {CAREER_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = idx === activeStage;
              return (
                <div
                  key={stage.step}
                  onClick={() => setActiveStage(idx)}
                  className="cursor-pointer"
                >
                  <TiltCard maxTilt={6}>
                    <div
                      className={`h-full rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0f1124] border-primary-500/60 shadow-xl shadow-primary-500/20 scale-[1.02]'
                          : 'bg-[#080814]/85 border-white/[0.07] hover:bg-[#0c0d1d] hover:border-white/[0.14]'
                      }`}
                    >
                      <div>
                        {/* Step indicator + icon */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-300">
                            STEP {stage.step}
                          </span>
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.accent} flex items-center justify-center text-white shadow-md`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="text-xs font-mono text-cyan-400 mb-1">
                          {stage.name}
                        </div>
                        <h3 className="text-base font-bold text-white mb-2 leading-snug">
                          {stage.title}
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                          {stage.desc}
                        </p>

                        {/* Metric pill */}
                        <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.05] text-xs font-mono text-emerald-400 font-semibold mb-4 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{stage.stat}</span>
                        </div>

                        {/* Sub features */}
                        <ul className="space-y-1.5 text-[11px] text-gray-400 mb-4">
                          {stage.metrics.map((m) => (
                            <li key={m} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary-400" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Launch route button */}
                      <Link
                        href={stage.route}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-between border border-white/[0.06] transition-all"
                      >
                        <span>Open {stage.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-primary-400" />
                      </Link>
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
