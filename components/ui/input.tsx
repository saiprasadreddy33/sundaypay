import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? `${String(label).toLowerCase().replace(/\s+/g, '-')}-input` : undefined);
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="form-group">
        {label && (
          <label className="text-sm font-medium text-slate-200/80" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={errorId}
          className={cn(
            'w-full px-4 py-3 text-sm rounded-xl border border-white/20 bg-white/5',
            'text-slate-50 placeholder:text-slate-400/70',
            'focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-cyan-300/60',
            'transition-colors duration-150',
            error && 'border-rose-500/70 focus:ring-rose-400/70',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-2 text-sm text-rose-200/90">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
