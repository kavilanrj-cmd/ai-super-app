'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import {
  MessageSquare, FileText, Briefcase, CheckSquare, Sparkles,
  TrendingUp, Zap, ArrowRight, Bot, Code, Brain, Stethoscope,
  DollarSign, Languages, BookOpen, PenTool, Image, ListChecks,
  Clock, Activity, ChevronRight, Flame, CreditCard, Gauge
} from 'lucide-react';
import { analyticsAPI, chatAPI } from '@/lib/api';
import { AnimatedNumber, CircularProgress, SkeletonCard, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

const quickActions = [
  { icon: MessageSquare, label: 'AI Chat', path: '/chat', desc: 'Chat with AI assistants', color: 'from-blue-500 to-cyan-500', gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400' },
  { icon: FileText, label: 'Analyze Resume', path: '/resume', desc: 'Get ATS score & insights', color: 'from-purple-500 to-pink-500', gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400' },
  { icon: Briefcase, label: 'Find Jobs', path: '/jobs', desc: 'Search & apply to jobs', color: 'from-emerald-500 to-teal-500', gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400' },
  { icon: CheckSquare, label: 'Manage Tasks', path: '/tasks', desc: 'Track your progress', color: 'from-amber-500 to-orange-500', gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400' },
  { icon: Code, label: 'Review Code', path: '/code-review', desc: 'AI code insights', color: 'from-cyan-500 to-blue-500', gradient: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400' },
  { icon: PenTool, label: 'Documents', path: '/documents', desc: 'Generate documents', color: 'from-pink-500 to-rose-500', gradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-400' },
];

const agents = [
  { icon: Bot, label: 'Resume', color: 'from-blue-500 to-cyan-500' },
  { icon: Briefcase, label: 'Career', color: 'from-emerald-500 to-teal-500' },
  { icon: Code, label: 'Coding', color: 'from-purple-500 to-pink-500' },
  { icon: Brain, label: 'Research', color: 'from-orange-500 to-yellow-500' },
  { icon: Stethoscope, label: 'Medical', color: 'from-red-500 to-rose-500' },
  { icon: DollarSign, label: 'Finance', color: 'from-emerald-500 to-teal-500' },
  { icon: Languages, label: 'Translate', color: 'from-indigo-500 to-blue-500' },
  { icon: BookOpen, label: 'Summarize', color: 'from-violet-500 to-purple-500' },
  { icon: PenTool, label: 'Document', color: 'from-pink-500 to-rose-500' },
  { icon: Image, label: 'Vision', color: 'from-cyan-500 to-blue-500' },
  { icon: ListChecks, label: 'Planning', color: 'from-amber-500 to-orange-500' },
];

const activityFeed = [
  { icon: MessageSquare, text: 'Chat session completed', time: '2 min ago', color: 'text-blue-400 bg-blue-500/10' },
  { icon: FileText, text: 'Resume analysis generated', time: '1 hr ago', color: 'text-purple-400 bg-purple-500/10' },
  { icon: Code, text: 'Code review finished', time: '3 hrs ago', color: 'text-cyan-400 bg-cyan-500/10' },
  { icon: CheckSquare, text: 'Task marked complete', time: '5 hrs ago', color: 'text-emerald-400 bg-emerald-500/10' },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([analyticsAPI.dashboard(), chatAPI.list()]).then(([a, c]) => {
      if (a.status === 'fulfilled') setAnalytics(a.value.data);
      if (c.status === 'fulfilled') setRecentChats((c.value.data || []).slice(0, 5));
      setLoading(false);
    });
  }, []);

  const stats = [
    { icon: MessageSquare, label: 'Total Chats', value: analytics?.total_chats || 0, color: 'from-blue-500 to-cyan-500', tint: 'text-blue-400', ring: 'from-blue-500/20 to-cyan-500/20' },
    { icon: FileText, label: 'Documents', value: analytics?.total_documents || 0, color: 'from-purple-500 to-pink-500', tint: 'text-purple-400', ring: 'from-purple-500/20 to-pink-500/20' },
    { icon: TrendingUp, label: 'Active Days', value: analytics?.active_days || 0, color: 'from-emerald-500 to-teal-500', tint: 'text-emerald-400', ring: 'from-emerald-500/20 to-teal-500/20' },
    { icon: Zap, label: 'AI Credits', value: user?.credits ?? 0, color: 'from-amber-500 to-orange-500', tint: 'text-amber-400', ring: 'from-amber-500/20 to-orange-500/20' },
  ];

  const usagePercent = Math.min(Math.round(((user?.credits ?? 0) / 500) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 animated-gradient-bg border border-primary-500/20 shadow-2xl shadow-primary-500/5">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px]" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary-200 backdrop-blur-sm">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Welcome back
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="gradient-text-animated">{user?.username || 'User'}</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl">
              Here&apos;s what&apos;s happening with your AI workspace today.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => router.push('/chat')} className="btn-primary inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/resume')} className="btn-secondary inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Analyze Resume
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="!p-5" />)
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.5 }}
              className="glass-card p-4 sm:p-5 space-y-3 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform', stat.color)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Today
                </span>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick actions + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Gauge className="w-4.5 h-4.5 text-primary-400" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                onClick={() => router.push(action.path)}
                className="glass-card p-4 text-left hover:border-primary-500/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-xl -mr-6 -mt-6 group-hover:from-primary-500/15 transition-colors" />
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3', action.gradient)}>
                  <action.icon className="w-4 h-4" />
                </div>
                <p className="font-medium text-sm text-gray-200">{action.label}</p>
                <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                <ChevronRight className="absolute right-3 bottom-3 w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-primary-400" />
            Usage Overview
          </h2>
          <div className="glass-card p-6 text-center space-y-4">
            <CircularProgress
              value={usagePercent}
              size={150}
              strokeWidth={11}
              label="%"
              sublabel="Plan usage"
            />
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Credits remaining</span>
                  <span className="text-white font-medium">{user?.credits ?? 0}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={analytics?.total_messages || 0} /></p>
                  <p className="text-[10px] text-gray-500">Messages</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={analytics?.active_days || 0} /></p>
                  <p className="text-[10px] text-gray-500">Active days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent chats + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-primary-400" />
              Recent Chats
            </h2>
            <button onClick={() => router.push('/chat')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentChats.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-8 h-8 text-primary-400" />}
              title="No conversations yet"
              description="Start your first AI conversation"
              action={<button onClick={() => router.push('/chat')} className="btn-primary">Start chatting</button>}
              className="!py-10"
            />
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat, i) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => router.push('/chat')}
                  className="w-full glass-card !rounded-xl p-3.5 flex items-center gap-3 hover:border-primary-500/30 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-200 truncate">{chat.title || 'New Chat'}</p>
                    <p className="text-xs text-gray-500">
                      {chat.updated_at ? new Date(chat.updated_at).toLocaleString() : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-primary-400" />
            Activity Timeline
          </h2>
          <div className="glass-card p-5">
            <div className="space-y-0 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary-500/40 via-white/[0.06] to-transparent" />
              {activityFeed.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  className="relative flex items-start gap-3 pb-5 last:pb-0 pl-0.5"
                >
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 border border-white/10', item.color)}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm text-gray-300">{item.text}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center shadow-glow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-200 text-sm">AI Agents</p>
                <p className="text-xs text-gray-500">11 specialized agents ready</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agents.map((agent) => (
                <span
                  key={agent.label}
                  className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-gradient-to-r text-white border border-white/10', agent.color)}
                >
                  <agent.icon className="w-3 h-3" />
                  {agent.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
