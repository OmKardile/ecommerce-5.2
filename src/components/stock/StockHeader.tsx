'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, Boxes } from 'lucide-react';
import { ThemeToggle } from '@/components/storefront/ThemeToggle';
import { employeeLogoutAction } from '@/app/stock/actions/stock.actions';
import type { EmployeeSessionPayload } from '@/server/services/employee-auth.service';

interface StockHeaderProps {
  session: EmployeeSessionPayload | null;
}

/**
 * StockHeader — top bar of the warehouse stock panel.
 *
 * Clean Trust theme (light by default). Composition:
 *   - Left: Patel.Networks wordmark + "Stock Panel" label + live dot
 *   - Right: employee identity + ThemeToggle + sign-out button
 */
export function StockHeader({ session }: StockHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await employeeLogoutAction();
      router.refresh();
    });
  };

  const employeeName = session?.fullName || 'Warehouse Operator';

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-5 sm:px-6 sticky top-0 z-30">
      {/* Left — wordmark + Stock Panel label */}
      <div className="flex items-center gap-5 min-w-0">
        <Link
          href="/stock"
          className="flex items-baseline gap-2 shrink-0 group"
          aria-label="Patel Networks stock home"
        >
          <span className="font-sans text-[17px] leading-none font-bold tracking-tight text-foreground">
            Patel<span className="text-[var(--brand)]">.</span>Networks
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] font-medium text-stone-500 border-l border-border-subtle pl-3 ml-1">
            Stock Panel
          </span>
        </Link>
      </div>

      {/* Right — employee name + theme toggle + sign out */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[11px]">
          <span className="dot-rec" aria-hidden />
          <span className="text-stone-500 font-medium">
            Signed in as
          </span>
          <span className="text-foreground font-medium">
            {employeeName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="btn-ghost inline-flex items-center gap-1.5 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Sign out of stock panel"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isPending ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Re-export Boxes icon for the layout to use if needed
export { Boxes };
