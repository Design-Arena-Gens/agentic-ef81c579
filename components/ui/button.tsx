import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-500',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:outline-brand-500',
  subtle:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-400',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:outline-red-400',
  ghost:
    'text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-400'
} as const;

type ButtonVariant = keyof typeof buttonVariants;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: JSX.Element;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', loading, icon, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          buttonVariants[variant],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            role="status"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!loading && icon ? <span className="mr-2">{icon}</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
