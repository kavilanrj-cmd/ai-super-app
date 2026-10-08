'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, Bot, Code, FileText, Search, Briefcase,
  GraduationCap, Rocket, Image, ArrowUpRight, Sparkles,
  Cpu, Network, Activity
} from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  role: string;
  route: string;
  icon: any;
  accent: string;
  position: { x: number; y: number }; // percentage coords (0-100)
  status: string;
  latency: string;
}

const AGENTS: AgentNode[] = [
  {
    id: 'app-builder',
    name: 'App Builder Agent',
    role: 'Full-Stack Code Synthesis',
    route: '/app-builder',
    icon: Rocket,
    accent: 'from-cyan-400 to-blue-600',
    position: { x: 50, y: 12 },
    status: 'ACTIVE',
    latency: '12ms',
  },
  {
    id: 'coding',
    name: 'Coding Agent',
    role: 'AST Syntax & Bug Diagnostics',
    route: '/code-review',
    icon: Code,
    accent: 'from-blue-500 to-indigo-600',
    position: { x: 80, y: 24 },
    status: 'STANDBY',
    latency: '16ms',
  },
  {
    id: 'resume',
    name: 'Resume Agent',
    role: 'ATS Semantic Screening',
    route: '/resume',
    icon: FileText,
    accent: 'from-purple-500 to-pink-500',
    position: { x: 86, y: 64 },
    status: 'OPTIMIZING',
    latency: '24ms',
  },
  {
    id: 'career',
    name: 'Career Agent',
    role: 'Roadmaps & Market Intelligence',
    route: '/career',
    icon: Briefcase,
    accent: 'from-emerald-400 to-teal-600',
    position: { x: 68, y: 88 },
    status: 'ACTIVE',
    latency: '14ms',
  },
  {
    id: 'interview',
    name: 'Interview Agent',
    role: 'Mock System Design & Audio',
    route: '/interview',
    icon: GraduationCap,
    accent: 'from-pink-500 to-rose-600',
    position: { x: 32, y: 88 },
    status: 'READY',
    latency: '19ms',
  },
  {
    id: 'document',
    name: 'Document Agent',
    role: 'Vector RAG & Deep Parsing',
    route: '/documents',
    icon: Brain,
    accent: 'from-violet-500 to-purple-600',
    position: { x: 14, y: 64 },
    status: 'INDEXED',
    latency: '21ms',
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Autonomous Web Synthesizer',
    route: '/research',
    icon: Search,
    accent: 'from-amber-400 to-orange-600',
    position: { x: 20, y: 24 },
    status: 'CRAWLING',
    latency: '32ms',
  },
];

export default function AgentNetwork() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const selectedNode = AGENTS.find((a) => a.id === hoveredAgent) || AGENTS[0];

  return (
    <section className="relative py-28 sm:py-40 w-full overflow-hidden bg-[#030309]">
      {/* Background radial volumetric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            Decentralized Autonomous Mesh
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The AI agent <span className="gradient-text">ecosystem.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            A distributed network of 11 domain-specialized agents orchestrated by a unified neural core.
            Hover over any node to inspect telemetry.
          </p>
        </div>

        {/* Network Canvas Arena */}
        <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto rounded-3xl bg-[#060613]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/90 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
          {/* Subtle SVG Grid in Background */}
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

          {/* SVG Connection Lines from Center (50%, 50%) to Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {AGENTS.map((agent) => {
              const isHovered = hoveredAgent === agent.id;
              return (
                <g key={agent.id}>
                  {/* Base connection line */}
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${agent.position.x}%`}
                    y2={`${agent.position.y}%`}
                    stroke={isHovered ? 'url(#lineGrad)' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isHovered ? 2.5 : 1}
                    strokeDasharray={isHovered ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />

                  {/* Pulsing traveling particle on active line */}
                  {isHovered && (
                    <circle r="4" fill="#38bdf8" className="animate-pulse">
                      <animateMotion
                        path={`M 50% 50% L ${agent.position.x}% ${agent.position.y}%`}
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* CENTER: Neural Core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            {/* Pulsating core rings */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-primary-600 via-purple-600 to-cyan-500 p-[2px] shadow-2xl shadow-primary-500/30 flex items-center justify-center animate-pulse-glow">
              <div className="w-full h-full bg-[#08081a] rounded-full flex flex-col items-center justify-center p-3 text-center border border-white/[0.1]">
                <Cpu className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
                  AI CORE
                </span>
                <span className="text-[9px] font-mono text-cyan-300">ORCHESTRATOR</span>
              </div>
            </div>
          </div>

          {/* SATELLITE NODES */}
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isHovered = hoveredAgent === agent.id;
            return (
              <div
                key={agent.id}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                style={{
                  left: `${agent.position.x}%`,
                  top: `${agent.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20 cursor-pointer"
              >
                <Link href={agent.route}>
                  <div
                    className={`relative p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 shadow-xl ${
                      isHovered
                        ? 'bg-[#0f1026] border-cyan-400 scale-110 shadow-cyan-500/30'
                        : 'bg-[#080816]/90 border-white/[0.1] hover:border-white/[0.2]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${agent.accent} flex items-center justify-center text-white shrink-0`}
                    >
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        {agent.name}
                        <ArrowUpRight className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {agent.status} · {agent.latency}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Bottom Live Telemetry Strip */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 rounded-xl bg-black/60 border border-white/[0.06] backdrop-blur-md px-4 py-2 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mesh Status: Optimal</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="hidden sm:inline text-gray-300">
                Active Node: {selectedNode.name}
              </span>
            </div>
            <Link
              href={selectedNode.route}
              className="text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1"
            >
              <span>Connect to Node</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
