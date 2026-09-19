'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, Sun, Moon, Command, User, Settings,
  Shield, LogOut, Sparkles, ChevronDown, BellOff, LayoutGrid,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth, useNotifications } from '@/lib/hooks';
import { navGroups, footerLinks } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  group: string;
}

function useClickOutside(onClick: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClick();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClick]);
  return ref;
}

function roleLabel(role?: string) {
  if (role === 'admin') return 'Administrator';
  return 'AI Explorer';
}

export default function TopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, setIsDark, unreadCount } = useStore();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const notifs = useNotifications();

  const allItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [];
    navGroups.forEach((g) => g.items.forEach((i) => items.push({ ...i, group: g.label })));
    footerLinks.forEach((i) => items.push({ ...i, group: 'Account' }));
    return items;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allItems]);

  const closeAll = useCallback(() => {
    setSearchOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
    setToolsOpen(false);
    setQuery('');
  }, []);

  const searchRef = useClickOutside(() => setSearchOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));
  const menuRef = useClickOutside(() => setMenuOpen(false));
  const toolsRef = useClickOutside(() => setToolsOpen(false));

  const go = useCallback((path: string) => {
    router.push(path);
    closeAll();
  }, [router, closeAll]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        closeAll();
      }
    },
    [closeAll]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setNotifOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    logout();
    window.location.href = '/login';
  };

  const role = roleLabel(user?.role);
  const displayName = user?.full_name || user?.username || 'User';
  const handleSearchKeyboard = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((v) => Math.min(v + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((v) => Math.max(v - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { go(results[activeIndex].path); }
    else if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
  };

  return (
    <header className="top-header">
      {/* Left: tools menu + brand */}
      <div className="relative flex items-center gap-2.5 shrink-0" ref={toolsRef}>
        <button
          onClick={() => { setToolsOpen(!toolsOpen); setSearchOpen(false); }}
          aria-label="Open tools menu"
          aria-expanded={toolsOpen}
          className="header-icon-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
        <AnimatePresence>
          {toolsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute left-0 top-[calc(100%+12px)] w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden z-50"
              style={{ background: 'rgba(13, 17, 40, 0.95)', border: '1px solid rgba(129,140,248,0.25)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 60px -18px rgba(0,0,0,0.8)' }}
            >
              <div className="px-4 pt-4 pb-2 flex items-center gap-2.5 border-b border-white/10">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-glow-sm">
                  <LayoutGrid className="w-4.5 h-4.5" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-white">Your workspace</p>
                  <p className="text-[11px] text-white/50">Jump to any tool</p>
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto scrollbar-thin py-2">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-1">
                    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-primary-300" />
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2.5 shrink-0 rounded-xl px-1.5 py-1.5 hover:bg-white/[0.04] transition-colors"
          aria-label="Go to dashboard"
        >
          <span className="relative w-9 h-9 shrink-0">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 opacity-90" />
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary-400 via-violet-400 to-fuchsia-400 opacity-40 blur-[6px] animate-pulse-slow" />
            <Sparkles className="absolute inset-0 m-auto w-4.5 h-4.5 text-white" />
          </span>
          <span className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-[15px] font-extrabold tracking-tight text-[var(--text-primary)]">
              AI Super App
            </span>
            <span className="text-[10px] font-semibold text-[var(--muted)] tracking-[0.18em] uppercase">
              AI Workspace
            </span>
          </span>
        </button>
      </div>

      {/* Center: global search */}
      <div className="search-wrap" ref={searchRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted)] pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={handleSearchKeyboard}
          aria-label="Search anything"
          role="combobox"
          aria-expanded={searchOpen}
          aria-controls="search-results"
          placeholder="Search anything... (jobs, skills, tools, templates)"
          className="search-input"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 kbd hidden sm:inline-flex">
          <Command className="w-3 h-3" />K
        </span>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              id="search-results"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="search-panel"
              role="listbox"
            >
              <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {query ? 'Matching tools' : 'Jump to a tool'}
              </p>
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                  No tools match &quot;{query}&quot;
                </div>
              ) : (
                results.map((item, i) => (
                  <button
                    key={item.path}
                    data-active={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => go(item.path)}
                    className="search-item"
                    role="option"
                    aria-selected={i === activeIndex}
                  >
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-fuchsia-500/20 border border-primary-500/25 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary-300" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{item.label}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{item.group}</span>
                    </span>
                    <span className="text-[10px] text-[var(--muted)] hidden sm:block pr-1">↵</span>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="header-icon-btn hidden sm:inline-flex"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'dark' : 'light'}
              initial={{ opacity: 0, rotate: -60 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 60 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="header-icon-btn"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-pink-500/40">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 mt-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden"
                style={{ background: 'rgba(13, 17, 40, 0.95)', border: '1px solid rgba(129,140,248,0.25)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 60px -18px rgba(0,0,0,0.8)' }}
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-200 border border-primary-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                  {(notifs.notifications || []).length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <BellOff className="w-8 h-8 text-white/25 mx-auto mb-3" />
                      <p className="text-sm text-white/60">You&apos;re all caught up</p>
                    </div>
                  ) : (
                    notifs.notifications.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => { notifs.markRead(n.id); }}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-white/[0.06] transition-colors hover:bg-white/[0.04]',
                          n.is_read ? 'opacity-60' : ''
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.is_read ? 'bg-white/20' : 'bg-primary-400 shadow-glow-sm animate-pulse')} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-white leading-snug">{n.title}</p>
                            {n.message && <p className="text-[12px] text-white/50 mt-0.5 line-clamp-2">{n.message}</p>}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
            aria-label="Open user menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-2xl border border-transparent hover:border-[var(--border-strong)] hover:bg-white/[0.04] py-1.5 pl-1.5 pr-2.5 transition-all"
          >
            <span className="relative shrink-0">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-[15px] font-bold text-white shadow-glow-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0b16]" />
            </span>
            <span className="hidden md:block text-left leading-tight">
              <span className="block text-[13px] font-semibold text-[var(--text-primary)] max-w-[110px] truncate">
                {displayName}
              </span>
              <span className="block text-[11px] text-[var(--muted)]">{role}</span>
            </span>
            <ChevronDown className={cn('w-4 h-4 text-[var(--muted)] hidden md:block transition-transform', menuOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {menuOpen && user && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(13, 17, 40, 0.95)', border: '1px solid rgba(129,140,248,0.25)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 60px -18px rgba(0,0,0,0.8)' }}
              >
                <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold text-white shadow-glow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[12px] text-white/50 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.04]">
                    <span className="flex items-center gap-2 text-[12px] text-white/70">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Credits
                    </span>
                    <span className="text-[13px] font-bold text-amber-300">{user.credits}</span>
                  </div>
                </div>
                {[
                  { icon: User, label: 'Profile', path: '/profile' },
                  { icon: Settings, label: 'Settings', path: '/settings' },
                  ...(user.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
                ].map((item) => (
                  <button key={item.path} onClick={() => go(item.path)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-white/75 hover:text-white hover:bg-white/[0.05] transition-colors">
                    <item.icon className="w-4 h-4 text-[var(--muted)]" />
                    {item.label}
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}