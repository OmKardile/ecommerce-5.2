'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  Banknote,
  ArrowUpRight,
  ShieldCheck,
  Users,
  BarChart3,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Overview & KPIs',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/orders',
    label: 'Order Fulfillment',
    icon: Package,
  },
  {
    href: '/admin/products',
    label: 'Products Catalog',
    icon: Layers,
  },
  {
    href: '/admin/inventory',
    label: 'SKU Inventory & Stock',
    icon: Boxes,
  },
  {
    href: '/admin/customers',
    label: 'Customer & B2B Directory',
    icon: Users,
  },
  {
    href: '/admin/reports',
    label: 'Analytics & Tax Reports',
    icon: BarChart3,
  },
  {
    href: '/admin/settings/cod',
    label: 'Selective COD Policies',
    icon: Banknote,
  },
];

/**
 * AdminSidebar — left nav for the operations console.
 *
 * Dark warm surface, hairline right border, Geist sans throughout.
 * Active state: brand-blue left border + brand-blue text + slightly
 * raised surface (NOT sky ring/glow, NOT gradient pill).
 *
 * All NAV_ITEMS + active-state logic preserved exactly.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card text-foreground flex flex-col shrink-0 border-r border-border select-none min-h-screen">
      {/* Brand header */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/admin" className="block group" aria-label="Patel Networks admin home">
          <div className="font-sans text-[15px] leading-none font-semibold tracking-tight text-foreground">
            Patel<span className="text-[var(--brand)]">.</span>Networks
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-medium">
            <span className="dot-rec" aria-hidden />
            <span>Operations Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="eyebrow text-stone-500 px-3 mb-2">Core Operations</div>

        {NAV_ITEMS.map((item) => {
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
                  ? 'border-[var(--brand)] text-foreground bg-background'
                  : 'border-transparent text-stone-400 hover:text-foreground hover:bg-background/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-stone-500'}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <div className="eyebrow text-stone-500 px-3 mb-2">Storefront</div>
          <Link
            href="/"
            target="_blank"
            className="relative flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] font-medium border-l-2 border-transparent text-stone-400 hover:text-foreground hover:bg-background/60 transition-colors"
          >
            <span className="flex items-center gap-3 min-w-0">
              <ArrowUpRight className="w-4 h-4 shrink-0 text-stone-500" />
              <span className="truncate">Customer Storefront</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--brand)] border border-border px-1.5 py-0.5 leading-none shrink-0">
              Live
            </span>
          </Link>
        </div>
      </nav>

      {/* Bottom — DB connection status */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-3 border border-border bg-background/60 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-stone-400">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>Cloud PostgreSQL</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--brand)] font-medium">
              <span className="dot-rec" aria-hidden />
              <span>Online</span>
            </span>
          </div>
          <div className="text-[10px] font-mono text-stone-500 truncate pl-5">
            ap-northeast-1 · pooled
          </div>
        </div>
      </div>
    </aside>
  );
}
