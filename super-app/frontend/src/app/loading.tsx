import { Skeleton } from '@/components/ui';
import { Sparkles } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508]">
      <div className="text-center space-y-5">
        <div className="relative mx-auto w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-30 blur-xl animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-400">Loading your workspace...</p>
        <div className="flex justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        <div className="progress-bar-indeterminate w-40 h-1 mx-auto" />
      </div>
    </div>
  );
}
