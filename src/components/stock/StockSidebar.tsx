'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  ArrowLeftRight,
  ClipboardList,
  PackagePlus,
} from 'lucide-react';
import type { EmployeeSessionPayload } from '@/server/services/employee-auth.service';

interface StockSidebarProps {
  session: EmployeeSessionPayload | null;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  permission?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/stock', label: 'Dashboard', icon: LayoutDashboard, exact: true, permission: 'STOCK_VIEW' },
  { href: '/stock/alerts', label: 'Alerts', icon: Bell, permission: 'STOCK_VIEW' },
  { href: '/stock/adjust', label: 'Adjust Stock', icon: PackagePlus, permission: 'INVENTORY_ADJUST' },
  { href: '/stock/movements', label: 'Movements', icon: ArrowLeftRight, permission: 'STOCK_VIEW' },
  { href: '/stock/count', label: 'Count Sessions', icon: ClipboardList, permission: 'STOCK_COUNT' },
];

export function StockSidebar({ session }: StockSidebarProps) {
  const pathname = usePathname();
  const permissions = session?.permissions || [];

  const employeeName = session?.fullName || 'Warehouse Operator';
  const employeeCode = session?.employeeCode || null;
  const initials = employeeName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

  return (
    <aside className="w-64 bg-card text-foreground flex flex-col shrink-0 border-r border-border-strong select-none min-h-screen">
      {/* Brand header */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <Link href="/stock" className="block group" aria-label="Patel Networks stock home">
          <div className="font-sans text-[15px] leading-none font-bold tracking-tight text-foreground">
            Patel<span className="text-[var(--brand)]">.</span>Networks
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-medium">
            <span className="dot-rec" aria-hidden />
            <span>Stock Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation — filtered by permissions */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="eyebrow text-stone-500 px-3 mb-2">Warehouse Operations</div>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium border-l-2 transition-colors ${
                isActive
                  ? 'border-border-strong text-foreground bg-background'
                  : 'border-transparent text-stone-500 hover:text-foreground hover:bg-background/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-stone-400'}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — employee identity card */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <div className="px-3 py-3 border border-border bg-background/60 text-[11px] space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 inline-flex items-center justify-center bg-[var(--brand)] text-white text-[10px] font-bold tracking-wider shrink-0">
              {initials || 'WO'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground truncate">{employeeName}</div>
              {employeeCode && (
                <div className="text-[10px] font-mono text-stone-500">{employeeCode}</div>
              )}
            </div>
          </div>
          {session?.email && (
            <div className="text-[10px] font-mono text-stone-500 truncate">
              {session.email}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
