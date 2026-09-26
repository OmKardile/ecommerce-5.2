import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'tech' | 'outline' | 'ember';
}

/**
 * Badge — restrained, sharp (2px radius), hairline border.
 * No glow, no heavy fills. Color used only as a whisper.
 */
export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default:
      'bg-transparent text-stone-700 dark:text-stone-300 border-border',
    success:
      'bg-transparent text-emerald-700 dark:text-emerald-400 border-emerald-300/70 dark:border-emerald-700/50',
    warning:
      'bg-transparent text-amber-700 dark:text-amber-400 border-amber-300/70 dark:border-amber-700/50',
    danger:
      'bg-transparent text-rose-700 dark:text-rose-400 border-rose-300/70 dark:border-rose-700/50',
    tech:
      'bg-transparent text-stone-700 dark:text-stone-300 border-[var(--hairline-strong)] font-mono tracking-tight',
    outline:
      'bg-transparent text-stone-600 dark:text-stone-400 border-[var(--hairline-strong)]',
    ember:
      'bg-transparent text-[var(--ember)] border-[var(--ember)]/40',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-[0.14em] border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
