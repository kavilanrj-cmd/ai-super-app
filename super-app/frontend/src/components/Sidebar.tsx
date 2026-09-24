'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks';
import {
  LayoutDashboard, MessageSquare, FileText, Briefcase, CheckSquare,
  BarChart3, User, Settings, Shield, ChevronLeft, ChevronRight,
  Sparkles, LogOut, Image, Mic, StickyNote, Mail,
  PenTool, BookOpen, Search, Code, Bug, FileEdit, GraduationCap,
  X, Command, NotebookPen, Target, FolderOpen, ChevronRight as ChevronRightSmall,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Builder',
    items: [{ icon: Rocket, label: 'AI App Builder', path: '/app-builder', featured: true }],
  },
  {
    label: 'Home',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }],
  },
  {
    label: 'AI Workspace',
    items: [
      { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
      { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
      { icon: FileEdit, label: 'Cover Letter', path: '/cover-letter' },
      { icon: GraduationCap, label: 'Interview Prep', path: '/interview' },
      { icon: Briefcase, label: 'Career Assistant', path: '/career' },
    ],
  },
  {
    label: 'Development',
    items: [
      { icon: Code, label: 'Code Reviewer', path: '/code-review' },
      { icon: Bug, label: 'Bug Finder', path: '/bug-finder' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: FolderOpen, label: 'Documents', path: '/documents' },
      { icon: BookOpen, label: 'PDF Chat', path: '/pdf-chat' },
      { icon: Search, label: 'Research Agent', path: '/research' },
      { icon: Image, label: 'Image AI', path: '/image-ai' },
      { icon: Mic, label: 'Voice AI', path: '/voice-ai' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { icon: StickyNote, label: 'Meeting Notes', path: '/meeting-notes' },
      { icon: Mail, label: 'Email Assistant', path: '/email-assistant' },
      { icon: PenTool, label: 'Writing Assistant', path: '/writing-assistant' },
      { icon: NotebookPen, label: 'Notes', path: '/notes' },
      { icon: Target, label: 'Job Finder', path: '/jobs' },
      { icon: CheckSquare, label: 'Task Manager', path: '/tasks' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ],
  },
];

const footerLinks = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Shield, label: 'Admin', path: '/admin' },
];

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const visibleFooterLinks = user?.role === 'admin' ? footerLinks : footerLinks.filter((l) => l.path !== '/admin');
  const isDark = useStore((s) => s.isDark);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleNav = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  const handleSearchKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleSearchKey);
    return () => window.removeEventListener('keydown', handleSearchKey);
  }, [handleSearchKey]);

  const creditProgress = Math.min(Math.round(((user?.credits ?? 0) / 500) * 100), 100);

  return (
    <div className="flex flex-col h-full" data-theme={isDark ? 'dark' : 'light'}>
      {/* Header (fixed) */}
      <div className="sb-border flex items-center gap-3 border-b px-4 lg:px-5 h-[72px] shrink-0">
        <button
          onClick={() => handleNav('/dashboard')}
          aria-label="Go to dashboard"
          className={cn('flex items-center gap-3 group min-w-0', collapsed && 'justify-center w-full')}
        >
          <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all">
            <span className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-30 blur-lg" />
            <span className="absolute inset-[2px] rounded-[10px] border border-white/25" />
            <span className="absolute inset-0 rounded-xl border border-dashed border-white/10 animate-spin-slow" />
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
        </button>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="font-bold text-[17px] lg:text-[18px] tracking-tight sb-text leading-none truncate">
              AI Super App
            </p>
            <p className="text-[11px] lg:text-[12px] font-medium uppercase tracking-[0.14em] sb-text-faint mt-1">
              AI Workspace
            </p>
          </motion.div>
        )}
        {!collapsed && (
          <button
            onClick={() => useStore.getState().setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            className="hidden lg:flex p-2 rounded-lg hover:bg-white/5 sb-text-faint hover:sb-text transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search (fixed) */}
      {!collapsed ? (
        <div className="px-4 lg:px-5 pt-4 pb-2 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sb-text-faint pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tools..."
              aria-label="Search tools"
              className="h-[42px] lg:h-[44px] w-full rounded-[10px] sb-surface sb-border border bg-[var(--sb-surface)] pl-10 pr-16 text-[14px] text-[var(--sb-text)] placeholder:text-[var(--sb-text-faint)] outline-none transition-all duration-200 focus:border-[var(--sb-accent)] focus:ring-2 focus:ring-[rgba(99,102,241,0.25)] focus:bg-[var(--sb-surface)]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-[var(--sb-text-faint)]">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>
        </div>
      ) : (
        <div className="px-3 pt-4 pb-2 shrink-0 flex justify-center">
          <button
            onClick={() => searchRef.current?.focus()}
            aria-label="Search tools"
            className="w-10 h-10 rounded-[10px] sb-surface sb-border border flex items-center justify-center sb-text-faint hover:sb-text transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scrollable navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 lg:px-3.5 py-3 scrollbar-thin" aria-label="Main navigation">
        <div className="space-y-4 lg:space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2.5 pb-1.5 text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.12em] sb-text-faint">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="mx-1.5 mb-2 h-px sb-border border-t" />}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  const featured = (item as any).featured;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                      className={cn(
                        'group relative w-full flex items-center gap-3 rounded-[10px] text-[15px] font-medium transition-all duration-200 ring-focus',
                        'min-h-[46px]',
                        collapsed ? 'px-0 justify-center' : 'px-3',
                        isActive
                          ? 'sb-link-active border'
                          : featured
                            ? 'border border-primary-400/40 bg-gradient-to-r from-primary-500/15 via-violet-500/[0.08] to-fuchsia-500/15 hover:border-primary-400/60 hover:shadow-glow-sm'
                            : 'sb-link border border-transparent'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-5 h-5 shrink-0 transition-all duration-200',
                          isActive
                            ? 'sb-icon-active'
                            : featured
                              ? 'text-cyan-300 group-hover:sb-icon group-hover:scale-110'
                              : 'sb-text-faint group-hover:sb-icon group-hover:sb-hover-icon group-hover:scale-110'
                        )}
                      />
                      {!collapsed && (
                        <span className={cn('truncate flex-1 text-left transition-colors', isActive ? 'sb-text' : '')}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && featured && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-primary-400/40 bg-gradient-to-r from-primary-500/25 to-fuchsia-500/25 text-[9px] font-bold uppercase tracking-wider text-primary-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          Local AI
                        </span>
                      )}
                      {!collapsed && isActive && (
                        <ChevronRightSmall className="w-4 h-4 sb-text-faint shrink-0 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Fixed footer */}
      <div className="sb-border shrink-0 border-t px-3 lg:px-4 pt-3 pb-3 space-y-2">
        {/* Upgrade to Pro */}
        {!collapsed && user && (
          <button
            onClick={() => handleNav('/settings')}
            aria-label="Upgrade to Pro"
            className="group relative w-full overflow-hidden rounded-[14px] border border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-violet-500/[0.08] to-fuchsia-500/10 p-3.5 text-left transition-all duration-300 hover:border-primary-400/50 hover:shadow-glow"
          >
            <div className="absolute -top-8 -right-6 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl transition-opacity opacity-60 group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-glow-sm">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold sb-text leading-tight">Upgrade to Pro</p>
                <p className="text-[11px] sb-text-faint mt-0.5">Unlock unlimited AI</p>
              </div>
              <ChevronRightSmall className="w-4 h-4 text-amber-300/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </button>
        )}

        {/* Profile */}
        {user && (
          <button
            onClick={() => handleNav('/profile')}
            title={collapsed ? user.username : undefined}
            aria-label={`Open profile: ${user.username}`}
            className={cn(
              'w-full flex items-center gap-3 rounded-[12px] sb-surface sb-border border p-2.5 transition-all duration-200 hover:border-[var(--sb-border-strong)] hover:-translate-y-0.5',
              collapsed && 'justify-center'
            )}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-primary-400 to-fuchsia-400 flex items-center justify-center text-[15px] font-bold text-white shadow-glow-sm">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#12121b]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[15px] font-semibold sb-text truncate leading-tight">{user.username}</p>
                <p className="text-[13px] sb-text-muted line-clamp-1">
                  {user.credits} AI credits
                </p>
                <div className="mt-1.5 h-[5px] rounded-full bg-white/[0.07] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500"
                    style={{ width: `${creditProgress}%` }}
                  />
                </div>
              </div>
            )}
            {!collapsed && (
              <ChevronRightSmall className="w-4 h-4 sb-text-faint shrink-0" />
            )}
          </button>
        )}

        {/* Footer links */}
        <div className="grid grid-cols-1 gap-0.5">
          {visibleFooterLinks.map((link) => {
            const isActive = pathname === link.path;
            return collapsed ? (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                title={link.label}
                aria-label={link.label}
                className="w-full h-[46px] flex items-center justify-center rounded-[10px] sb-link transition-all duration-200"
              >
                <link.icon className="w-5 h-5" />
              </button>
            ) : (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                aria-label={link.label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 rounded-[10px] px-3 h-[46px] text-[15px] font-medium transition-all duration-200 ring-focus border border-transparent',
                  isActive ? 'sb-link-active border' : 'sb-link'
                )}
              >
                <link.icon className={cn('w-5 h-5 shrink-0', isActive ? 'sb-icon-active' : 'sb-text-faint')} />
                <span className="flex-1 text-left truncate">{link.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => { logout(); useStore.getState().setMobileNavOpen(false); window.location.href = '/login'; }}
            aria-label="Sign out"
            className={cn(
              'w-full flex items-center gap-3 rounded-[10px] text-[15px] font-medium transition-all duration-200 text-[var(--sb-text-faint)] hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent',
              collapsed ? 'justify-center h-[46px]' : 'px-3 h-[46px]'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="flex-1 text-left truncate">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, mobileNavOpen, setMobileNavOpen } = useStore();
  const pathname = usePathname();

  const collapsed = !sidebarOpen;

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="sb-sidebar fixed left-0 top-0 bottom-0 z-40 hidden lg:block backdrop-blur-2xl border-r border-[var(--sb-border)] shadow-[4px_0_30px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-[58px] -right-3.5 z-40 w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center shadow-glow-sm hover:shadow-glow transition-shadow border border-white/20"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[320px] max-w-[85vw] lg:hidden sb-sidebar border-r border-[var(--sb-border)] shadow-2xl"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 z-20 p-2 rounded-lg sb-text-faint hover:sb-text hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export { navGroups, footerLinks };
