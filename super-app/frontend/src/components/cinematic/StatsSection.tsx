'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Zap, Brain, Layers, Infinity as InfinityIcon } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  sub: string;
  icon: any;
  color: string;
}

const STATS: StatItem[] = [
  {
    value: '11+',
    label: 'Specialized AI Agents',
    sub: 'Fine-tuned domain experts across engineering, career, and research',
    icon: Brain,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    value: '1',
    label: 'Unified AI Workspace',
    sub: 'Zero context loss with persistent knowledge and real-time streaming',
    icon: Layers,
    color: 'from-purple-400 to-pink-500',
  },
  {
    value: 'Real-Time',
    label: 'AI Assistance',
    sub: 'High-throughput token streaming with sub-100ms response latencies',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
  },
  {
    value: '∞',
    label: 'Possibilities',
    sub: 'Build production software, automate writing, and elevate your career',
    icon: InfinityIcon,
    color: 'from-emerald-400 to-teal-500',
  },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-20 sm:py-28 w-full overflow-hidden border-y border-white/[0.06] bg-[#05050d]/80">
      {/* Subtle lighting accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-primary-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                  idx > 0 ? 'sm:pl-8 pt-8 sm:pt-0' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gray-300" />
                </div>

                <div
                  className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-sans`}
                >
                  {stat.value}
                </div>

                <div className="text-base sm:text-lg font-bold text-white mt-2">
                  {stat.label}
                </div>

                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-xs">
                  {stat.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
