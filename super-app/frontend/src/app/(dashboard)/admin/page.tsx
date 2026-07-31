'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/lib/api';
import { useStore } from '@/lib/store';
import {
  PageHeader, AnimatedNumber, EmptyState, SkeletonCard, Skeleton, Badge,
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui';
import { Shield, Users, MessageSquare, FileText, CheckSquare, Activity } from 'lucide-react';

export default function AdminPage() {
  const user = useStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      adminAPI.stats().then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
      adminAPI.users().then((res) => setAllUsers(res.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={<Shield className="w-6 h-6 text-white" />}
          title="Admin Panel"
          subtitle="System administration and management"
        />
        <Card className="p-6 sm:p-8">
          <EmptyState
            icon={<Shield className="w-8 h-8 text-red-400" />}
            title="Admin Access Required"
            description="You need admin privileges to view this page. Please contact your system administrator."
          />
        </Card>
      </div>
    );
  }

  const adminStats = [
    { icon: Users, label: 'Total Users', value: stats?.total_users || 0, color: 'from-blue-500 to-cyan-500' },
    { icon: MessageSquare, label: 'Total Chats', value: stats?.total_chats || 0, color: 'from-purple-500 to-pink-500' },
    { icon: FileText, label: 'Documents', value: stats?.total_documents || 0, color: 'from-emerald-500 to-teal-500' },
    { icon: CheckSquare, label: 'Tasks', value: stats?.total_tasks || 0, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Shield className="w-6 h-6 text-white" />}
        title="Admin Panel"
        subtitle="System administration and management"
        actions={
          <Badge variant="primary" dot>
            <Activity className="w-3 h-3" /> Live
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          adminStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="glass-card p-4 sm:p-5 space-y-3 group hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
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

      {/* Users table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-5 sm:px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] mb-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">Users</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Registered accounts across the platform</p>
              </div>
            </div>
            {!loading && <Badge variant="info">{allUsers.length} total</Badge>}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">ID</th>
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">Username</th>
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">Email</th>
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">Role</th>
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">Status</th>
                    <th className="text-left py-3 px-5 sm:px-6 text-gray-400 font-medium uppercase tracking-wider text-[11px]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="bg-white/[0.03] border-b border-white/[0.06]">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="py-3.5 px-5 sm:px-6">
                            <Skeleton className="h-3.5 w-16" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : allUsers.length === 0 ? (
                    <tr className="bg-white/[0.03]">
                      <td colSpan={6}>
                        <EmptyState
                          icon={<Users className="w-8 h-8 text-primary-400" />}
                          title="No users yet"
                          description="Once users register, they will appear here."
                          className="!py-12"
                        />
                      </td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr key={u.id} className="bg-white/[0.03] border-b border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                        <td className="py-3 px-5 sm:px-6 text-gray-500 font-mono text-xs">{u.id}</td>
                        <td className="py-3 px-5 sm:px-6 font-medium text-gray-200">{u.username}</td>
                        <td className="py-3 px-5 sm:px-6 text-gray-400">{u.email}</td>
                        <td className="py-3 px-5 sm:px-6">
                          <Badge variant={u.role === 'admin' ? 'gradient' : 'info'}>{u.role}</Badge>
                        </td>
                        <td className="py-3 px-5 sm:px-6">
                          <Badge variant={u.is_active ? 'success' : 'danger'} dot>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 sm:px-6 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
