import React from 'react';
import Link from 'next/link';
import { getAdminDashboardMetrics } from '@/server/services/admin.service';
import { formatInr } from '@/lib/utils';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Boxes,
  Banknote,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export const revalidate = 0; // Dynamic server component

/**
 * AdminDashboardPage — operations console overview.
 *
 * Dark warm-ink background (applied by admin layout.tsx .dark wrapper).
 * KPI cards rendered as hairline rows (NOT rounded gradient tiles),
 * recent orders as a hairline table, inventory alerts as a hairline list.
 *
 * All data fetching (getAdminDashboardMetrics) + display logic preserved
 * exactly — only the JSX/styling changed.
 */
export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  const totalVolume =
    metrics.paymentModeSplit.onlineCount + metrics.paymentModeSplit.codCount;
  const onlinePct =
    totalVolume > 0
      ? Math.round((metrics.paymentModeSplit.onlineCount / totalVolume) * 100)
      : 100;
  const codPct = 100 - onlinePct;

  // Status badge styling — all hairline, sharp corners, no rounded pills
  const statusStyles = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'border-emerald-700/50 text-emerald-400';
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'border-[var(--brand)]/50 text-[var(--brand)]';
      case OrderStatus.CONFIRMED:
      case OrderStatus.PACKED:
        return 'border-indigo-700/50 text-indigo-300';
      default:
        return 'border-amber-700/50 text-amber-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            <span>Live Real-Time</span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-semibold tracking-tight text-foreground">
            Operations Command Center
          </h1>
          <p className="text-[13px] text-stone-500 mt-2">
            Surat Central Hub telemetry, B2B/B2C fulfillment queue, and inventory alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white text-[12px] font-medium hover:bg-[var(--brand-soft)] transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Process Orders</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-[12px] font-medium text-stone-300 hover:text-foreground hover:border-foreground transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Audit</span>
          </Link>
        </div>
      </div>

      {/* KPI rows — hairline rows, not gradient tiles */}
      <div className="border-t border-border">
        {/* GMV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-border border-b border-border">
          <KpiRow
            label="Gross Merchandise Value"
            value={formatInr(metrics.totalRevenue)}
            sub={
              <>
                <span className="text-[var(--brand)]">18% GST</span>
                <span className="text-stone-600">·</span>
                <span>{formatInr(metrics.totalGst)}</span>
              </>
            }
            icon={<TrendingUp className="w-3.5 h-3.5 text-[var(--brand)]" />}
          />
          <KpiRow
            label="Active Pipeline Orders"
            value={String(metrics.activeOrdersCount)}
            sub={<span>{metrics.totalOrders} lifetime orders</span>}
            icon={<Package className="w-3.5 h-3.5 text-stone-400" />}
          />
          <KpiRow
            label="Delivered & Closed"
            value={String(metrics.deliveredOrdersCount)}
            sub={<span>Shiprocket & Delhivery fulfilled</span>}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          />
          <KpiRow
            label="Low Stock Alerts"
            value={String(metrics.lowStockCount)}
            sub={<span>Action needed in SKU inventory</span>}
            icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            tone={metrics.lowStockCount > 0 ? 'warn' : undefined}
          />
        </div>
      </div>

      {/* Payment channel split — hairline */}
      <div className="border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
              <Banknote className="w-3 h-3 text-[var(--brand)]" />
              <span>Payment Channel Breakdown</span>
            </div>
            <h2 className="font-sans text-[15px] font-semibold text-foreground leading-none">
              Selective COD control (ADR-004) vs Instant Online Settlement (Razorpay)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono">
            <span className="flex items-center gap-2 text-[var(--brand)]">
              <span className="w-2 h-2 bg-[var(--brand)] inline-block" aria-hidden />
              <span>
                Prepaid · {onlinePct}% · {formatInr(metrics.paymentModeSplit.onlineRevenue)}
              </span>
            </span>
            <span className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 bg-amber-500 inline-block" aria-hidden />
              <span>
                COD · {codPct}% · {formatInr(metrics.paymentModeSplit.codRevenue)}
              </span>
            </span>
          </div>
        </div>

        {/* Hairline stacked bar — no gradient, no glow */}
        <div className="w-full h-1.5 flex border border-border bg-background overflow-hidden">
          <div
            style={{ width: `${onlinePct}%` }}
            className="h-full bg-[var(--brand)] transition-all"
            title={`Online: ${onlinePct}%`}
          />
          <div
            style={{ width: `${codPct}%` }}
            className="h-full bg-amber-500 transition-all"
            title={`COD: ${codPct}%`}
          />
        </div>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent orders — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--brand)]" />
              <span>Recent Orders in Pipeline</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-border bg-card overflow-hidden">
            {metrics.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No orders created yet in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-background text-stone-500 font-medium border-b border-border text-[10px] uppercase tracking-[0.16em]">
                    <tr>
                      <th className="py-3 px-4 font-medium">Order #</th>
                      <th className="py-3 px-4 font-medium">Customer</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Method</th>
                      <th className="py-3 px-4 font-medium text-right">Amount</th>
                      <th className="py-3 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {metrics.recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{ord.recipientName}</div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">{ord.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${statusStyles(
                              ord.status
                            )}`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-stone-400">
                          {ord.paymentMethod === 'RAZORPAY' ? 'Prepaid' : 'COD'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                          {formatInr(ord.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href="/admin/orders"
                            className="text-[11px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] link-underline transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low stock alerts — 1/3 width */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Critical Low Stock</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
            >
              <span>Manage SKUs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-border bg-card">
            {metrics.lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-[11px] flex flex-col items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>All SKUs above threshold.</span>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.skuId} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-foreground line-clamp-1">
                          {item.productName}
                        </div>
                        <div className="text-[10px] font-mono text-stone-500 mt-1">
                          {item.skuCode} · {item.variantName}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 border border-amber-700/50 px-1.5 py-0.5 leading-none shrink-0">
                        ≤ {item.threshold}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border">
                      <span className="text-stone-500">Available</span>
                      <span className="font-mono font-medium text-amber-400">
                        {item.availableStock}
                        <span className="text-stone-600 font-normal ml-1.5">
                          ({item.reservedStock} res)
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/admin/inventory"
              className="block w-full py-3 border-t border-border bg-background/60 hover:bg-background text-center font-medium text-[12px] text-stone-300 hover:text-foreground transition-colors"
            >
              Open Inventory Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- KPI row ---------------- */

function KpiRow({
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
  tone?: 'warn';
}) {
  return (
    <div className="p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-stone-500">{label}</span>
        <span aria-hidden>{icon}</span>
      </div>
      <div
        className={`font-sans text-[24px] font-semibold tracking-tight leading-none ${
          tone === 'warn' ? 'text-amber-400' : 'text-foreground'
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] flex items-center gap-1.5 text-stone-500 font-mono">
        {sub}
      </div>
    </div>
  );
}
