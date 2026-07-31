'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Brain } from 'lucide-react';

export function ThinkingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-br from-primary-400 to-fuchsia-400"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function ThinkingIndicator({
  label = 'Thinking',
  className,
}: {
  label?: string;
  className?: string;
}) {
  const steps = ['Analyzing', 'Processing', 'Generating', 'Refining'];
  return (
    <div className={cn('flex items-center gap-3 py-1', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-glow-sm"
      >
        <Brain className="w-4 h-4 text-white" />
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400"
        >
          {label}
        </motion.span>
        <ThinkingDots />
      </div>
    </div>
  );
}

export function LoadingOrb({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-12 h-12', className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-40 blur-md"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
