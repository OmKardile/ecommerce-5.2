import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EmployeeAuthService } from '@/server/services/employee-auth.service';
import { prisma } from '@/server/db';
import { StockCountSessions } from '@/components/stock/StockCountSessions';

export const revalidate = 0; // Dynamic server component

/**
 * StockCountPage — list of stock count sessions.
 *
 * Renders the live list of sessions + a "New session" form (client) for
 * employees with STOCK_RECONCILE permission.
 */
export default async function StockCountPage() {
  const session = await EmployeeAuthService.getEmployeeSession();
  const canReconcile = !!session?.permissions?.includes('STOCK_COUNT');

  const [sessions, skus] = await Promise.all([
    prisma.stockCountSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reconciliations: {
          select: { id: true, status: true, variance: true },
        },
      },
    }),
    canReconcile
      ? prisma.sku.findMany({
          take: 200,
          orderBy: { code: 'asc' },
          include: {
            inventory: { select: { currentStock: true } },
            variant: { include: { product: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
  ]);

  const sessionSummaries = sessions.map((s) => {
    const total = s.reconciliations.length;
    const completed = s.reconciliations.filter(
      (r) => r.status === 'MATCHED' || r.status === 'DISCREPANCY' || r.status === 'RESOLVED'
    ).length;
    const discrepancies = s.reconciliations.filter((r) => r.status === 'DISCREPANCY').length;
    return {
      id: s.id,
      name: s.name,
      status: s.status,
      assignedTo: s.assignedTo,
      createdBy: s.createdBy,
      createdAt: s.createdAt.toISOString(),
      startedAt: s.startedAt?.toISOString() || null,
      completedAt: s.completedAt?.toISOString() || null,
      totalItems: total,
      completedItems: completed,
      discrepancies,
    };
  });

  const skuOptions = skus.map((sku) => ({
    id: sku.id,
    code: sku.code,
    productName: sku.variant?.product?.name || 'Surveillance Hardware',
    variantName: sku.variant?.name || 'Default',
    currentStock: sku.inventory?.currentStock ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            <span>Physical Inventory Counts</span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-bold tracking-tight text-foreground">
            Count Sessions
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 max-w-2xl">
            Schedule batch physical counts, assign SKUs to warehouse staff, and
            reconcile counted quantities against the database. Discrepancies are
            flagged for review.
          </p>
        </div>
        <Link
          href="/stock"
          className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] flex items-center gap-1 link-underline transition-colors"
        >
          <span>Back to dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <StockCountSessions
        sessions={sessionSummaries}
        skuOptions={skuOptions}
        canReconcile={canReconcile}
      />
    </div>
  );
}
