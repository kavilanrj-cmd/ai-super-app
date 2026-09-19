'use client';

import { usePathname } from 'next/navigation';
import TopHeader from '@/components/layout/TopHeader';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { cn } from '@/lib/utils';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div
      className={cn(
        'relative bg-[#050508]',
        isDashboard ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
      )}
    >
      <AnimatedBackground />
      <TopHeader />
      {isDashboard ? (
        <main className="relative h-[calc(100vh-var(--header-h))] w-full overflow-hidden">
          {children}
        </main>
      ) : (
        <main className="relative flex-1 w-full max-w-dashboard mx-auto px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
          {children}
        </main>
      )}
    </div>
  );
}