'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks';
import AppShell from '@/components/layout/AppShell';
import { Skeleton, SkeletonCard } from '@/components/ui';

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loadUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoute = pathname === '/dashboard';

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user === null && typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(isDashboardRoute && 'h-full')}
      >
        {children}
      </motion.div>
    </AppShell>
  );
}

export { DashboardSkeleton };
