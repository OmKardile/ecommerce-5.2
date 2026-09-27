'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { LogOut, Loader2, ExternalLink } from 'lucide-react';
import { AdminSessionPayload } from '@/server/services/admin-auth.service';
import { adminLogoutAction } from '@/app/actions/admin-auth.actions';
import { ThemeToggle } from '@/components/storefront/ThemeToggle';

interface Props {
  session?: AdminSessionPayload | null;
}

/**
 * AdminHeader — top bar of the operations console.
 *
 * Dark warm-ink background, hairline bottom border, sharp corners.
 * - Left: Patel.Networks wordmark + live node status
 * - Right: storefront link, operator identity (initials + name + role + email), sign out
 *
 * Auth/logic preserved exactly: useTransition + adminLogoutAction.
 */
export function AdminHeader({ session }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogoutAction();
    });
  };

  const email = session?.email || 'superadmin@patelnetworks.in';
  const fullName = session?.fullName || 'Operations Lead';
  const role = session?.role || 'SUPER_ADMIN';
  const roleLabel = role.replace(/_/g, ' ');
  const initials = fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-14 bg-surface-1 border-b border-border-strong flex items-center justify-between px-5 sm:px-6 sticky top-0 z-30">
      {/* Left — wordmark + node identity */}
      <div className="flex items-center gap-5 min-w-0">
        <Link href="/admin" className="flex items-baseline gap-2 shrink-0 group" aria-label="Patel Networks admin home">
          <span className="font-sans text-[17px] leading-none font-semibold text-foreground tracking-tight">
            Patel<span className="text-[var(--brand)]">.</span>Networks
          </span>
          <span className="hidden md:inline eyebrow text-stone-500 ml-0.5">
            Operations Console
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2.5 pl-5 border-l border-border text-[11px]">
          <span className="dot-rec" aria-hidden />
          <span className="text-stone-400">Surat Central Fulfillment</span>
          <span className="text-stone-700">/</span>
          <span className="text-stone-500 font-mono">GSTIN 24AAACP1234F1Z8</span>
        </div>
      </div>

      {/* Right — storefront link, operator identity, sign out */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-foreground link-underline transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div
            className="w-8 h-8 flex items-center justify-center font-mono text-[11px] font-medium text-foreground bg-card border border-border"
            aria-hidden
          >
            {initials}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-medium text-foreground flex items-center gap-2">
              <span>{fullName}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--brand)] border border-border px-1 py-0.5 leading-none">
                {roleLabel}
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-1 leading-none">
              {email}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Sign out of operations console"
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-2 border border-border bg-transparent hover:border-border-strong hover:text-[var(--brand)] text-stone-400 text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
