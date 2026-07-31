import { Skeleton, SkeletonCard, SkeletonChatBubble } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonChatBubble />
        <div className="flex justify-end">
          <Skeleton className="w-48 h-14 rounded-2xl" />
        </div>
        <SkeletonChatBubble />
      </div>
    </div>
  );
}
