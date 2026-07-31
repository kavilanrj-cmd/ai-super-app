import { forwardRef, ButtonHTMLAttributes, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  ripple?: boolean;
}

const variants = {
  primary:
    'bg-gradient-to-r from-primary-500 to-violet-500 text-white hover:opacity-95 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0',
  gradient:
    'bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500 bg-[length:200%_100%] bg-left hover:bg-right text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-[background-position,transform,box-shadow] duration-500',
  secondary:
    'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  danger:
    'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40',
  outline:
    'bg-transparent text-gray-300 hover:text-white border border-white/10 hover:border-primary-400/40 hover:bg-primary-500/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, ripple = true, children, onClick, ...props }, ref) => {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && !disabled && !loading) {
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          const diameter = Math.max(rect.width, rect.height);
          const rippleEl = document.createElement('span');
          const size = `${diameter}px`;
          rippleEl.className = 'ripple-ink';
          rippleEl.style.width = size;
          rippleEl.style.height = size;
          rippleEl.style.left = `${e.clientX - rect.left - diameter / 2}px`;
          rippleEl.style.top = `${e.clientY - rect.top - diameter / 2}px`;
          btn.appendChild(rippleEl);
          setTimeout(() => rippleEl.remove(), 700);
        }
        onClick?.(e);
      },
      [ripple, disabled, loading, onClick]
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none select-none',
          variants[variant],
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
Button.displayName = 'Button';
