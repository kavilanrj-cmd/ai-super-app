'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import {
  User, Mail, Shield, Sparkles, BadgeCheck, Calendar, CreditCard, Gauge, Activity
} from 'lucide-react';
import { PageHeader, AnimatedNumber, CircularProgress } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const user = useStore((s) => s.user);

  const profileItems = [
    { icon: Mail, label: 'Email', value: user?.email, color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User', color: 'from-purple-500 to-pink-500' },
    { icon: Calendar, label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A', color: 'from-emerald-500 to-teal-500' },
    { icon: Sparkles, label: 'Credits', value: user?.credits ?? 0, color: 'from-amber-500 to-orange-500' },
  ];

  const usagePercent = Math.min(Math.round(((user?.credits ?? 0) / 500) * 100), 100);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<User className="w-6 h-6 text-white" />}
        title="Profile"
        subtitle="Your account information and usage"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
              {user?.role || 'User'}
            </span>
            {user?.is_verified && (
              <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <BadgeCheck className="w-3 h-3 inline mr-1 -mt-0.5" />
                Verified
              </span>
            )}
          </div>
        }
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-primary-500/25 ring-1 ring-white/10">
              <span className="text-3xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text-animated">
                {user?.full_name || user?.username}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <p className="text-sm text-gray-500">@{user?.username}</p>
                {user?.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-white/[0.03] text-gray-400 border border-white/[0.07]">
                <Activity className="w-3 h-3 inline mr-1 -mt-0.5" />
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary-400" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profileItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="glass-card p-4 flex items-center gap-4 group hover:border-primary-500/25"
              >
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform', item.color)}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                  <p className="font-medium text-sm text-gray-200 truncate">
                    {item.label === 'Credits' ? (
                      <AnimatedNumber value={Number(item.value) || 0} />
                    ) : (
                      item.value
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plan & usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-400" />
            Plan & Usage
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
                  <span className="text-white font-medium"><AnimatedNumber value={user?.credits ?? 0} /></span>
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
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={usagePercent} /></p>
                  <p className="text-[10px] text-gray-500">Used</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white">500</p>
                  <p className="text-[10px] text-gray-500">Limit</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
