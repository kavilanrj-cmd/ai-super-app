'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks';
import {
  LayoutDashboard, MessageSquare, FileText, Briefcase, CheckSquare,
  BarChart3, User, Settings, Shield, ChevronLeft, ChevronRight,
  Sparkles, LogOut, Image, Mic, StickyNote, Mail,
  PenTool, BookOpen, Search, Code, Bug, FileEdit, GraduationCap,
  X, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }],
  },
  {
    label: 'AI Tools',
    items: [
      { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
      { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
      { icon: FileEdit, label: 'Cover Letter', path: '/cover-letter' },
      { icon: GraduationCap, label: 'Interview Prep', path: '/interview' },
      { icon: Briefcase, label: 'Career Assistant', path: '/career' },
      { icon: Code, label: 'Code Reviewer', path: '/code-review' },
      { icon: Bug, label: 'Bug Finder', path: '/bug-finder' },
      { icon: PenTool, label: 'Documents', path: '/documents' },
      { icon: BookOpen, label: 'PDF Chat', path: '/pdf-chat' },
      { icon: Search, label: 'Research Agent', path: '/research' },
      { icon: Image, label: 'Image AI', path: '/image-ai' },
      { icon: Mic, label: 'Voice AI', path: '/voice-ai' },
      { icon: StickyNote, label: 'Meeting Notes', path: '/meeting-notes' },
      { icon: Mail, label: 'Email Assistant', path: '/email-assistant' },
      { icon: PenTool, label: 'Writing Assistant', path: '/writing-assistant' },
      { icon: StickyNote, label: 'Notes', path: '/notes' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { icon: Briefcase, label: 'Job Finder', path: '/jobs' },
      { icon: CheckSquare, label: 'Task Manager', path: '/tasks' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: Shield, label: 'Admin', path: '/admin' },
    ],
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleNav = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn('h-16 flex items-center border-b border-white/[0.06]', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        <button onClick={() => handleNav('/dashboard')} className="flex items-center gap-2.5 group min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0 group-hover:shadow-primary-500/50 transition-shadow">
            <Sparkles className="w-4.5 h-4.5 text-white" />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-30 blur-md -z-10" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight gradient-text truncate leading-tight">Super App</span>
              <span className="text-[10px] text-gray-500 truncate">One platform for everything</span>
            </motion.div>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={() => useStore.getState().setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors hidden lg:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-4" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">{group.label}</p>
            )}
            {collapsed && <div className="mx-2 mb-1.5 h-px bg-white/[0.05]" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group relative w-full flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ring-focus',
                      collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/15 via-violet-500/10 to-transparent border border-primary-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-fuchsia-400 shadow-glow-sm"
                      />
                    )}
                    <item.icon
                      className={cn(
                        'w-[18px] h-[18px] shrink-0 transition-colors relative z-10',
                        isActive ? 'text-primary-300' : 'group-hover:text-gray-200'
                      )}
                    />
                    {!collapsed && (
                      <span className={cn('truncate relative z-10', isActive && 'font-medium')}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-2.5 border-t border-white/[0.06] space-y-1.5">
        {user && (
          <div className={cn('flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5', collapsed && 'justify-center')}>
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-fuchsia-400 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c16]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-200">{user.username}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-400" />
                  {user.credits} credits
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => { logout(); useStore.getState().setMobileNavOpen(false); window.location.href = '/login'; }}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all ring-focus',
            collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'
          )}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
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
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed left-0 top-0 bottom-0 z-40 hidden lg:block bg-[#0b0b14]/85 backdrop-blur-2xl border-r border-white/[0.06] shadow-[4px_0_30px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-[52px] -right-3 z-20 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center shadow-glow-sm hover:shadow-glow transition-shadow border border-white/20"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 350, damping: 34 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[300px] max-w-[85vw] lg:hidden bg-[#0b0b14] border-r border-white/[0.08] shadow-2xl"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 z-20 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0b0b14]/85 backdrop-blur-xl border-b border-white/[0.06] safe-bottom">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => (window.location.href = '/dashboard')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text tracking-tight">Super App</span>
        </button>
        <div className="w-9" />
      </div>
    </>
  );
}

export { navGroups };


