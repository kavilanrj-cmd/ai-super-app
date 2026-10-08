'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Database, Search, MessageSquare,
  ArrowRight, ArrowDown, BookOpen, Layers, CheckCircle2,
  FolderOpen, Sparkles, Cpu, ExternalLink
} from 'lucide-react';
import TiltCard from './TiltCard';

const RAG_STEPS = [
  {
    step: '01',
    name: 'UPLOAD',
    title: 'Multi-Format Ingestion',
    desc: 'Drag & drop PDFs, architecture RFCs, research papers, or contract agreements.',
    icon: Upload,
    accent: 'text-blue-400',
    badge: 'PDF / DOCX / TXT',
  },
  {
    step: '02',
    name: 'EXTRACT',
    title: 'Structural Text Extraction',
    desc: 'Isolates tables, diagrams, headers, and code snippets while maintaining layout fidelity.',
    icon: Layers,
    accent: 'text-cyan-400',
    badge: 'OCR & Layout Aware',
  },
  {
    step: '03',
    name: 'UNDERSTAND',
    title: 'Vector Embeddings',
    desc: 'Chunks text semantically and calculates high-dimensional vector representations.',
    icon: Database,
    accent: 'text-purple-400',
    badge: '1,536-dim Embedding',
  },
  {
    step: '04',
    name: 'RETRIEVE',
    title: 'Hybrid Vector Search',
    desc: 'Instantly identifies the top 5 most relevant passages with cosine similarity.',
    icon: Search,
    accent: 'text-amber-400',
    badge: 'Sub-15ms Index',
  },
  {
    step: '05',
    name: 'ANSWER',
    title: 'Synthesized Grounded Response',
    desc: 'Generates coherent, cited responses linking directly back to the exact source page.',
    icon: MessageSquare,
    accent: 'text-emerald-400',
    badge: 'Exact Page Citations',
  },
];

export default function DocumentIntelligence() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <section className="relative py-24 sm:py-36 w-full overflow-hidden bg-[#04040a]/90">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-[650px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Neural Retrieval-Augmented Generation
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your documents.
            <br />
            <span className="gradient-text">Understood by AI.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Transform dense PDFs, complex research journals, and company handbooks into an
            instant conversational knowledge brain with guaranteed citation accuracy.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pdf-chat"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Chat with your PDFs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/documents"
              className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white font-medium text-sm border border-white/[0.1] transition-all"
            >
              Document Studio
            </Link>
          </div>
        </div>

        {/* Visual Pipeline Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Data Pipeline Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {RAG_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = idx === activeStep;
              return (
                <div
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0b0e22] border-cyan-500/50 shadow-lg shadow-cyan-500/15'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-gray-500 w-6">
                      {step.step}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center ${step.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {step.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-cyan-300 border border-white/[0.07]">
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 max-w-lg">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? 'bg-cyan-400 shadow-md shadow-cyan-400/50 animate-pulse' : 'bg-gray-700'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Column: Live RAG Interaction Sample (5 cols) */}
          <div className="lg:col-span-5">
            <TiltCard maxTilt={5}>
              <div className="rounded-3xl bg-[#080816]/90 border border-white/[0.1] p-6 sm:p-7 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-gray-300">
                      Sample: Q3_Financial_Filing.pdf
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    INDEXED
                  </span>
                </div>

                {/* Simulated User Question */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-gray-400">QUERY:</span>
                  <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-gray-200">
                    &quot;What was the net cloud infrastructure spending increase in Q3 according to Section 4.2?&quot;
                  </div>
                </div>

                {/* Simulated AI Answer with Citations */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-cyan-400">GROUNDED SYNTHESIS:</span>
                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-gray-200 space-y-2.5">
                    <p className="leading-relaxed">
                      According to <span className="text-cyan-300 font-semibold">[Page 42, §4.2]</span>,
                      net cloud infrastructure expenditure grew by <strong className="text-white">22.4%</strong> year-over-year,
                      primarily driven by high-performance GPU cluster expansion in North America.
                    </p>
                    <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span>Cosine match: 0.984</span>
                      <span className="text-emerald-400">Verified Citation</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <Link
                  href="/pdf-chat"
                  className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center justify-center gap-2 border border-white/[0.08] transition-all"
                >
                  <span>Launch PDF Chat Studio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
