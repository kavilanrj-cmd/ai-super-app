'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Search, Menu, X, Rocket, Terminal, Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import MagneticButton from './MagneticButton';

export default function CinematicNavbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'AI Workspace', href: '#workspace' },
    { label: 'App Builder', href: '/app-builder', highlight: true },
    { label: 'Career AI', href: '/career' },
    { label: 'Documents', href: '/documents' },
    { label: 'Find Jobs', href: '/jobs' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-[#050508]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/80'
          : 'py-5 sm:py-6 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-purple-600 to-cyan-500 flex items-center justify-center p-[1px] shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#070712] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              AI SUPER APP
              <span className="text-[10px] tracking-wider px-1.5 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 font-mono">
                OS
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                link.highlight
                  ? 'text-primary-300 hover:text-white hover:bg-primary-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/chat"
            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
            title="Open AI Chat / Command Prompt"
          >
            <Search className="w-4 h-4" />
          </Link>

          <MagneticButton>
            <Link
              href="/app-builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500/20 via-primary-500/20 to-purple-500/20 border border-primary-500/40 hover:border-cyan-400/60 shadow-lg shadow-primary-500/10 hover:shadow-cyan-500/20 transition-all duration-300 group"
            >
              <Rocket className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Build with AI</span>
            </Link>
          </MagneticButton>

          {user ? (
            <MagneticButton>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 shadow-md shadow-primary-500/25 transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] transition-all"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </MagneticButton>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href={user ? '/dashboard' : '/login'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white bg-white/[0.04]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-b border-white/[0.08] bg-[#05050a]/95 backdrop-blur-2xl overflow-hidden px-5 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-300 hover:text-white border-b border-white/[0.04]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/app-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-cyan-500/20 to-primary-500/20 border border-primary-500/40 text-cyan-300"
              >
                🚀 Build with AI
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-medium bg-white/[0.05] text-gray-300"
              >
                Open AI Chat
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
