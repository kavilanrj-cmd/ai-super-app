'use client';

import { Button } from '@/components/ui';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-200">Something went wrong</h3>
        <p className="text-sm text-gray-400">{error.message || 'An unexpected error occurred'}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
