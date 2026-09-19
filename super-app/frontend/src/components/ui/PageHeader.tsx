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
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-5', className)}
    >
      <div className="flex items-start gap-5">
        {icon && (
          <div className={cn('hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br items-center justify-center shrink-0 shadow-lg shadow-primary-500/25', gradient)}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="page-title text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-[var(--text-secondary)] mt-2 text-base sm:text-lg leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
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
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/20 flex items-center justify-center mb-6 shadow-glow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-gray-200">{title}</h3>
      {description && <p className="text-base text-gray-500 mt-2 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-7">{action}</div>}
    </motion.div>
  );
}
