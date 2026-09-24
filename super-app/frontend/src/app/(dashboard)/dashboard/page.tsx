'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, CalendarDays, Coins } from 'lucide-react';
import { useStore } from '@/lib/store';
import { analyticsAPI, chatAPI, docAPI, resumeAPI, taskAPI, jobAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui';
import HeroSection from '@/components/dashboard/HeroSection';
import StatCard from '@/components/dashboard/StatCard';
import FeatureGrid from '@/components/dashboard/FeatureGrid';
import { ProgressCard, WeeklyActivity, OpportunitiesCTA } from '@/components/dashboard/RightRail';
import RecentActivity, { type ActivityItem } from '@/components/dashboard/RecentActivity';
import SiteFooter from '@/components/SiteFooter';

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card stat-card-compact overflow-hidden">
          <Skeleton className="w-[clamp(32px,3.6vh,42px)] h-[clamp(32px,3.6vh,42px)] rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-[18px] w-16" />
            <Skeleton className="h-[10px] w-20" />
          </div>
          <Skeleton className="w-16 h-6 ml-auto" />
        </div>
      ))}
    </>
  );
}

function WidgetSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card dash-widget">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-2 w-5/6 mb-2" />
          <Skeleton className="h-8 w-full rounded-lg mt-2" />
        </div>
      ))}
    </>
  );
}

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [resumeHistory, setResumeHistory] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsAPI.dashboard(),
      chatAPI.list(),
      docAPI.list(),
      resumeAPI.history(),
      taskAPI.list(),
      jobAPI.saved(),
    ]).then(([a, c, d, r, t, j]) => {
      if (a.status === 'fulfilled') setAnalytics(a.value.data);
      if (c.status === 'fulfilled') setRecentChats((c.value.data || []).slice(0, 4));
      if (d.status === 'fulfilled') setDocuments(d.value.data || []);
      if (r.status === 'fulfilled') setResumeHistory(r.value.data || []);
      if (t.status === 'fulfilled') setTasks(t.value.data || []);
      if (j.status === 'fulfilled') setSavedJobs(j.value.data || []);
      setLoading(false);
    });
  }, []);

  const stats = [
    { icon: MessageSquare, label: 'Total Chats', value: analytics?.total_chats || 0, tone: 'oklch(0.67 0.23 252)' },
    { icon: FileText, label: 'Documents', value: analytics?.total_documents || 0, tone: 'oklch(0.67 0.29 325)' },
    { icon: CalendarDays, label: 'Active Days', value: analytics?.active_days || 0, tone: 'oklch(0.79 0.18 194)' },
    { icon: Coins, label: 'AI Credits', value: user?.credits ?? 0, tone: 'oklch(0.78 0.19 60)' },
  ];

  const progressItems = [
    { label: 'Complete your profile', done: Boolean(user?.full_name || user?.avatar_url) },
    { label: 'Upload a resume', done: resumeHistory.length > 0 },
    { label: 'Try AI chat', done: (analytics?.total_chats ?? 0) > 0 },
    { label: 'Apply for a job', done: savedJobs.length > 0 },
  ];

  const activities: ActivityItem[] = [
    ...recentChats.map((c) => ({ type: 'chat' as const, title: c.title || 'AI chat session', at: c.updated_at || c.created_at })),
    ...documents.map((d) => ({ type: 'document' as const, title: d.title || 'New document', at: d.created_at || d.updated_at })),
    ...resumeHistory.map((h) => ({ type: 'resume' as const, title: h.title ? `Resume analyzed — ${h.title}` : 'Resume analyzed', at: h.created_at || h.analyzed_at })),
    ...tasks.map((t) => ({ type: 'task' as const, title: t.title || 'New task', at: t.created_at || t.updated_at })),
  ]
    .filter((x) => x.at || x.title)
    .sort((a, b) => (Date.parse(b.at || '0') || 0) - (Date.parse(a.at || '0') || 0))
    .slice(0, 4);

  const displayName = user?.full_name || user?.username || 'there';

  return (
    <div className="dashboard-viewport">
      <div className="dash-orb-wrap" aria-hidden="true">
        <div className="th-space-field" />
        <div className="dash-orb violet" />
        <div className="dash-orb blue" />
        <div className="dash-orb cyan" />
      </div>
      <HeroSection displayName={displayName} />

      {/* Stat cards — one horizontal row */}
      <div className="dash-stats grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-[clamp(5px,0.6vh,9px)] min-h-0">
        {loading
          ? <StatsSkeleton />
          : stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                tone={stat.tone}
                index={i}
              />
            ))}
      </div>

      {/* All features (header + compact 4-col grid) */}
      <FeatureGrid />

      {/* Bottom widgets — one horizontal row */}
      <motion.div
        initial={{ opacity: 1, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="dash-widgets dash-widget-grid"
      >
        {loading
          ? <WidgetSkeleton />
          : (
            <>
              <ProgressCard items={progressItems} />
              <WeeklyActivity activeDays={analytics?.active_days || 0} messages={analytics?.total_messages || 0} />
              <RecentActivity activities={activities} />
              <OpportunitiesCTA />
            </>
          )}
      </motion.div>

      <SiteFooter compact />
    </div>
  );
}