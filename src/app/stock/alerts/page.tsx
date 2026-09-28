import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { EmployeeAuthService } from '@/server/services/employee-auth.service';
import { getStockAlerts } from '@/server/services/stock.service';
import { AlertsTable } from '@/components/stock/AlertsTable';
import { GenerateAlertsButton } from '@/components/stock/GenerateAlertsButton';

export const revalidate = 0; // Dynamic server component

const STATUSES = ['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const;

/**
 * StockAlertsPage — server component for /stock/alerts.
 *
 * Reads `?status=` from searchParams and filters the alerts list. Renders the
 * AlertsTable (client) for the action buttons (Acknowledge / Resolve) and the
 * GenerateAlertsButton (client) for the scan action.
 */
export default async function StockAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await EmployeeAuthService.getEmployeeSession();
  const rawStatus = (params.status || 'ALL').toUpperCase();
  const status = (STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : 'ALL';

  const alerts = await getStockAlerts(status);
  const canManageAlerts = !!session?.permissions?.includes('STOCK_ALERTS_MANAGE');

  const counts: Record<string, number> = { ALL: 0, OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0 };
  for (const a of alerts) {
    counts.ALL++;
    if (counts[a.status] !== undefined) counts[a.status]++;
  }
  // For ALL filter we need total counts across all statuses — fetch once more
  // unfiltered only if we're filtering.
  const allAlerts = status === 'ALL' ? alerts : await getStockAlerts('ALL');
  if (status !== 'ALL') {
    counts.ALL = allAlerts.length;
    for (const a of allAlerts) {
      if (counts[a.status] !== undefined) counts[a.status]++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            <span>Alert Management</span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-bold tracking-tight text-foreground">
            Stock Alerts
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 max-w-2xl">
            Open alerts require acknowledgement. Resolved alerts are retained for audit.
            Trigger a full inventory scan to surface SKUs below their low-stock threshold.
          </p>
        </div>

        <GenerateAlertsButton canManageAlerts={canManageAlerts} />
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1 border border-border bg-card p-1 w-fit">
        {STATUSES.map((s) => {
          const isActive = s === status;
          const count = counts[s] ?? 0;
          return (
            <Link
              key={s}
              href={s === 'ALL' ? '/stock/alerts' : `/stock/alerts?status=${s}`}
              className={`relative px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-stone-500 hover:text-foreground'
              }`}
            >
              <span>{s.toLowerCase()}</span>
              <span className="ml-1.5 text-[10px] font-mono opacity-70">({count})</span>
            </Link>
          );
        })}
      </div>

      {/* Alerts table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>
              {status === 'ALL' ? 'All Alerts' : `${status.charAt(0)}${status.slice(1).toLowerCase()} Alerts`}
            </span>
          </h2>
          <Link
            href="/stock"
            className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
          >
            <span>Back to dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <AlertsTable alerts={alerts} canManageAlerts={canManageAlerts} />
      </div>
    </div>
  );
}
