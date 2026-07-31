'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/lib/store';
import { Skeleton, SkeletonCard } from '@/components/ui';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loadUser } = useAuth();
  const router = useRouter();
  const sidebarOpen = useStore((s) => s.sidebarOpen);

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
      <div className="min-h-screen bg-[#050508] flex flex-col">
        <Sidebar />
        <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex">
      <Sidebar />
      <main
        className={[
          'flex-1 transition-[margin] duration-300 ease-in-out',
          'pt-14 lg:pt-0',
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[72px]',
        ].join(' ')}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export { DashboardSkeleton };
