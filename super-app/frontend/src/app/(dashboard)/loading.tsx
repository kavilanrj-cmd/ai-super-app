import { Skeleton, SkeletonCard } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="hero-panel !rounded-3xl">
        <div className="px-7 sm:px-12 py-10 sm:py-14 space-y-6">
          <Skeleton className="h-7 w-44 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 sm:h-12 w-72 sm:w-96" />
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-14 w-52 rounded-2xl" />
            <Skeleton className="h-14 w-44 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="!p-5" />
        ))}
      </div>

      {/* Feature grid skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} className="!p-6" />
          ))}
        </div>
      </div>

      {/* Bottom widgets skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="!p-6" />
        ))}
      </div>
    </div>
  );
}