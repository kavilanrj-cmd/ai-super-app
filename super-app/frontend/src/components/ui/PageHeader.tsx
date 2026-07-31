'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  gradient?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, icon, actions, gradient = 'from-primary-500 to-fuchsia-500', className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={cn('hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br items-center justify-center shrink-0 shadow-lg shadow-primary-500/20', gradient)}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-100">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </motion.div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/20 flex items-center justify-center mb-5 shadow-glow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
