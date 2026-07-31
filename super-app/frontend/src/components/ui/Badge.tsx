import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'gradient';
  dot?: boolean;
}

const variants = {
  default: 'bg-white/5 text-gray-300 border border-white/10',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/25',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/25',
  gradient: 'bg-gradient-to-r from-primary-500/15 to-fuchsia-500/15 text-primary-300 border border-primary-500/25',
};

const dotColors = {
  default: 'bg-gray-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  primary: 'bg-primary-400',
  gradient: 'bg-primary-400',
};

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
