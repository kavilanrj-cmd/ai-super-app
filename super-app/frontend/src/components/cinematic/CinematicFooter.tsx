'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Terminal, Cpu } from 'lucide-react';

export default function CinematicFooter() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#030308] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-purple-600 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AI SUPER APP</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-cyan-300">
                v2.0 OS
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              One unified AI operating system powering autonomous web development, career intelligence,
              AST code analysis, and document retrieval.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/app-builder" className="hover:text-cyan-300 transition-colors">
                  AI App Builder
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-white transition-colors">
                  AI Chat & Reasoning
                </Link>
              </li>
              <li>
                <Link href="/resume" className="hover:text-white transition-colors">
                  Resume & ATS Engine
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-white transition-colors">
                  Career Assistant
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Job Match Finder
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
              Tools & Docs
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/code-review" className="hover:text-white transition-colors">
                  Code Reviewer
                </Link>
              </li>
              <li>
                <Link href="/bug-finder" className="hover:text-white transition-colors">
                  Bug Finder
                </Link>
              </li>
              <li>
                <Link href="/pdf-chat" className="hover:text-white transition-colors">
                  PDF Chat (Vector RAG)
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition-colors">
                  Research Agent
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary-400" />
            <span>&copy; {new Date().getFullYear()} AI Super App. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">
              Sign In
            </Link>
            <Link href="/settings" className="hover:text-gray-300 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
