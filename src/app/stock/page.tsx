import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  Banknote,
  AlertTriangle,
  PackageX,
  ArrowRight,
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  Sliders,
} from 'lucide-react';
import { EmployeeAuthService } from '@/server/services/employee-auth.service';
import { getStockDashboardData } from '@/server/services/stock.service';
import { formatInr } from '@/lib/utils';

export const revalidate = 0; // Dynamic server component

/**
 * StockDashboardPage — warehouse employee overview.
 *
 * KPIs: total SKUs, total stock value, low-stock count, out-of-stock count.
 * Recent alerts (last 5) + recent movements (last 10) as hairline tables.
 * Quick action: "New count session" only if employee has STOCK_RECONCILE.
 */
export default async function StockDashboardPage() {
  const session = await EmployeeAuthService.getEmployeeSession();
  const data = await getStockDashboardData(session);

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            <span>Live Warehouse Telemetry</span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-bold tracking-tight text-foreground">
            Stock Monitor Dashboard
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 max-w-2xl">
            Real-time inventory snapshot for the Surat central hub — SKUs, valuation,
            low-stock alerts, and movement audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {data.canReconcile && (
            <Link
              href="/stock/count"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white text-[12px] font-medium hover:bg-[var(--brand-soft)] transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>New count session</span>
            </Link>
          )}
          <Link
            href="/stock/movements"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-[12px] font-medium text-stone-600 hover:text-foreground hover:border-border-strong transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>View movements</span>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-border-subtle border border-border-strong bg-card">
        <KpiCard
          label="Total SKUs"
          value={String(data.totalSkus)}
          sub={<span>Active surveillance hardware</span>}
          icon={<Boxes className="w-3.5 h-3.5 text-[var(--brand)]" />}
        />
        <KpiCard
          label="Total Stock Value"
          value={formatInr(data.totalStockValue)}
          sub={<span>At current selling price</span>}
          icon={<Banknote className="w-3.5 h-3.5 text-[var(--brand)]" />}
        />
        <KpiCard
          label="Low Stock SKUs"
          value={String(data.lowStockCount)}
          sub={<span>At or below threshold</span>}
          icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          tone={data.lowStockCount > 0 ? 'warn' : undefined}
        />
        <KpiCard
          label="Out of Stock"
          value={String(data.outOfStockCount)}
          sub={<span>Zero on shelf</span>}
          icon={<PackageX className="w-3.5 h-3.5 text-[var(--destructive)]" />}
          tone={data.outOfStockCount > 0 ? 'danger' : undefined}
        />
      </div>

      {/* Recent alerts + movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recent alerts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Recent Stock Alerts</span>
            </h2>
            <Link
              href="/stock/alerts"
              className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-border-strong bg-card overflow-hidden">
            {data.recentAlerts.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No alerts recorded yet. Run the alert scanner on the Alerts page.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-background text-stone-500 border-b border-border-subtle text-[10px] uppercase tracking-[0.16em]">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">SKU</th>
                      <th className="py-2.5 px-3 font-medium">Type</th>
                      <th className="py-2.5 px-3 font-medium text-right">Stock</th>
                      <th className="py-2.5 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.recentAlerts.map((a) => (
                      <tr key={a.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-foreground">
                          {a.skuCode}
                          <div className="text-[10px] text-stone-500 font-sans mt-0.5 truncate max-w-[200px]">
                            {a.productName}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                              a.alertType === 'OUT_OF_STOCK'
                                ? 'border-[var(--destructive)]/50 text-[var(--destructive)]'
                                : 'border-amber-500/50 text-amber-600'
                            }`}
                          >
                            {a.alertType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <span className="text-foreground">{a.currentStock}</span>
                          <span className="text-stone-500">/{a.threshold}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                            {a.status.toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Recent movements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--brand)]" />
              <span>Recent Stock Movements</span>
            </h2>
            <Link
              href="/stock/movements"
              className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-border-strong bg-card overflow-hidden">
            {data.recentMovements.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No movements logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-background text-stone-500 border-b border-border-subtle text-[10px] uppercase tracking-[0.16em]">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">SKU</th>
                      <th className="py-2.5 px-3 font-medium">Type</th>
                      <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                      <th className="py-2.5 px-3 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.recentMovements.map((m) => {
                      const isIn = m.quantity >= 0;
                      return (
                        <tr key={m.id} className="hover:bg-background/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-foreground">
                            {m.skuCode}
                            <div className="text-[10px] text-stone-500 font-sans mt-0.5 truncate max-w-[180px]">
                              {m.productName}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider">
                              {isIn ? (
                                <ArrowDownCircle className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <ArrowUpCircle className="w-3 h-3 text-[var(--destructive)]" />
                              )}
                              <span className={isIn ? 'text-emerald-600' : 'text-[var(--destructive)]'}>
                                {isIn ? 'IN' : 'OUT'}
                              </span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-stone-500 text-[10px] font-mono">
                            {m.reason.replace(/_/g, ' ').toLowerCase()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- KPI card ---------------- */

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: React.ReactNode;
  tone?: 'warn' | 'danger';
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-[var(--destructive)]'
      : tone === 'warn'
      ? 'text-amber-600'
      : 'text-foreground';

  return (
    <div className="p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-stone-500">{label}</span>
        <span aria-hidden>{icon}</span>
      </div>
      <div className={`font-sans text-[24px] font-bold tracking-tight leading-none ${toneClass}`}>
        {value}
      </div>
      <div className="text-[11px] flex items-center gap-1.5 text-stone-500 font-mono">
        {sub}
      </div>
    </div>
  );
}
