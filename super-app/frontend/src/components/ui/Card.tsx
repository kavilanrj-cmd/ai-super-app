import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
  gradientBorder?: boolean;
  glow?: boolean;
}

export function Card({
  className,
  glass = true,
  hoverable = false,
  gradientBorder = false,
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        glass
          ? 'glass-card'
          : 'bg-[#0d0d17]/80 border border-white/[0.06]',
        'rounded-2xl p-5 relative',
        hoverable && 'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 cursor-pointer',
        gradientBorder && 'gradient-border',
        glow && 'shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4 gap-3 flex-wrap', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-gray-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}
