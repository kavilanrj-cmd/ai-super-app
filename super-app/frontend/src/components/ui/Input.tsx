import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            className={cn(
              'input-field w-full',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-500 focus:shadow-red-500/10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}
        {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
