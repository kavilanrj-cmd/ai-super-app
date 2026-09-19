import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glowClassName?: string;
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-[15px] rounded-2xl',
  lg: 'px-8 py-3.5 text-base rounded-2xl',
};

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, size = 'md', loading, disabled, glowClassName, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'btn-hero disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
GradientButton.displayName = 'GradientButton';

export function GhostGlassButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children, ...rest } = props;
  return (
    <button className={cn('btn-ghost-glass', className)} {...rest}>
      {children}
    </button>
  );
}

export function GlowIcon({
  className,
  children,
  color,
}: {
  className?: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className={cn('relative inline-flex items-center justify-center shrink-0', className)} style={color ? { '--glow': color } as React.CSSProperties : undefined}>
      {children}
    </span>
  );
}

export default GradientButton;