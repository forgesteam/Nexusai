import type React from 'react';
import { cn } from '../../lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; selected?: boolean };

export default function Card({ className, interactive, selected, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm',
        interactive && 'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        selected && 'ring-2 ring-primary',
        className,
      )}
      {...props}
    />
  );
}
