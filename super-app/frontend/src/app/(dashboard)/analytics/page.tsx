'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '@/lib/api';
import {
  BarChart3, MessageSquare, FileText, Calendar, Activity, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import { PageHeader, AnimatedNumber, CircularProgress, SkeletonCard, SkeletonChart } from '@/components/ui';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { cn } from '@/lib/utils';

const tooltipStyle = {
  backgroundColor: 'rgba(13, 13, 23, 0.92)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3.5 py-2.5 text-xs" style={tooltipStyle}>
      {label && <p className="font-semibold text-gray-200 mb-1.5">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name || p.dataKey} className="flex items-center gap-1.5 text-gray-300 py-0.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color || p.payload?.fill || '#818cf8' }}
          />
          {p.name}: <span className="font-semibold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.dashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalChats = data?.total_chats || 0;
  const totalMessages = data?.total_messages || 0;
  const totalDocuments = data?.total_documents || 0;
  const activeDays = data?.active_days || 0;

  const stats = [
    { icon: MessageSquare, label: 'Total Chats', value: totalChats, color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, label: 'Documents', value: totalDocuments, color: 'from-purple-500 to-pink-500' },
    { icon: Activity, label: 'Messages', value: totalMessages, color: 'from-green-500 to-emerald-500' },
    { icon: Calendar, label: 'Active Days', value: activeDays, color: 'from-orange-500 to-yellow-500' },
  ];

  const chartData = [
    { name: 'Chats', value: totalChats, color: '#818cf8' },
    { name: 'Messages', value: totalMessages, color: '#c084fc' },
    { name: 'Documents', value: totalDocuments, color: '#f472b6' },
    { name: 'Active Days', value: activeDays, color: '#34d399' },
  ];

  const pieData = [
    { name: 'Chats', value: totalChats },
    { name: 'Messages', value: totalMessages },
    { name: 'Documents', value: totalDocuments },
  ];

  const pieColors = ['#818cf8', '#c084fc', '#f472b6'];
  const activeRate = Math.min(Math.round((activeDays / 30) * 100), 100);
  const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        title="Analytics"
        subtitle="Track your usage and activity across the AI workspace"
        actions={
          !loading && data && (
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
              Live data
            </span>
          )
        }
      />

      {/* KPI stats */}
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
                  <Activity className="w-3 h-3" /> All time
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">Activity Overview</h3>
                  <p className="text-xs text-gray-500">Usage breakdown by metric</p>
                </div>
              </div>
              {chartTotal > 0 && (
                <span className="px-3 py-1 text-xs rounded-full bg-white/[0.03] text-gray-400 border border-white/[0.07]">
                  {chartTotal} total actions
                </span>
              )}
            </div>
            {loading ? (
              <SkeletonChart />
            ) : chartTotal === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No activity recorded yet</p>
                  <p className="text-sm text-gray-600 mt-1">Start chatting to see your usage grow</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]} maxBarSize={64}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>

        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Engagement
          </h2>
          <div className="glass-card p-6 text-center space-y-4">
            <CircularProgress
              value={activeRate}
              size={150}
              strokeWidth={11}
              label="%"
              sublabel="Active days / month"
            />
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Active days</span>
                  <span className="text-white font-medium">{activeDays}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeRate}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={totalMessages} /></p>
                  <p className="text-[10px] text-gray-500">Messages</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={totalChats} /></p>
                  <p className="text-[10px] text-gray-500">Chats</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/15 to-rose-500/15 border border-pink-500/20 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Usage Distribution</h3>
              <p className="text-xs text-gray-500">Share of activity by feature</p>
            </div>
          </div>
          {loading ? (
            <SkeletonChart />
          ) : chartTotal === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <PieChartIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No data to display yet</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-48 sm:h-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {pieData.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <span className="flex items-center gap-2.5 text-sm text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {chartTotal > 0 ? Math.round((item.value / chartTotal) * 100) : 0}%
                      <span className="text-gray-500 font-normal ml-1.5">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
