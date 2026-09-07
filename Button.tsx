import type React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
};

export default function Button({ variant = 'primary', loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <><Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" /><span>Working…</span></> : children}
    </button>
  );
}
