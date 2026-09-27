import React from 'react';
import Link from 'next/link';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { EmployeeAuthService } from '@/server/services/employee-auth.service';
import { getStockMovements } from '@/server/services/stock.service';
import { MovementsFilters } from '@/components/stock/MovementsFilters';

export const revalidate = 0; // Dynamic server component

const PAGE_SIZE = 25;

/**
 * StockMovementsPage — paginated, filterable movement log.
 *
 * Filters (search, reason, dateFrom, dateTo) are read from searchParams so the
 * URL is shareable. Pagination is controlled via the `?page=` query string.
 */
export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    reason?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await EmployeeAuthService.getEmployeeSession();
  const canExport = !!session?.permissions?.includes('STOCK_EXPORT');

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const { rows, total, page: currentPage, pageSize } = await getStockMovements({
    search: params.search,
    reason: params.reason,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Build the next/prev URLs preserving filters.
  const buildPageUrl = (target: number) => {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.set('search', params.search);
    if (params.reason) urlParams.set('reason', params.reason);
    if (params.dateFrom) urlParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) urlParams.set('dateTo', params.dateTo);
    urlParams.set('page', String(target));
    return `/stock/movements?${urlParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            <span>Audit Trail</span>
          </div>
          <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-bold tracking-tight text-foreground">
            Stock Movement Log
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 max-w-2xl">
            Every inventory delta — purchase receipts, order reservations, dispatches,
            restocks, returns, manual adjustments, and damaged write-offs.
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

      {/* Filters + export */}
      <MovementsFilters
        initialSearch={params.search || ''}
        initialReason={params.reason || 'ALL'}
        initialDateFrom={params.dateFrom || ''}
        initialDateTo={params.dateTo || ''}
        canExport={canExport}
      />

      {/* Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--brand)]" />
            <span>
              {total.toLocaleString('en-IN')} movement{total === 1 ? '' : 's'}
            </span>
            <span className="text-stone-500 font-normal text-[12px] font-sans">
              · page {currentPage} of {totalPages}
            </span>
          </h2>
        </div>

        <div className="border border-border-strong bg-card overflow-hidden">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-stone-500 text-xs">
              No movements match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-background text-stone-500 border-b border-border-subtle text-[10px] uppercase tracking-[0.16em]">
                  <tr>
                    <th className="py-3 px-4 font-medium">SKU</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium text-right">Qty</th>
                    <th className="py-3 px-4 font-medium">Reason</th>
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((m) => {
                    const isIn = m.quantity >= 0;
                    return (
                      <tr key={m.id} className="hover:bg-background/60 transition-colors align-top">
                        <td className="py-3 px-4 font-mono text-foreground">
                          {m.skuCode}
                          <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                            {m.productName}
                          </div>
                          {m.variantName && m.variantName !== 'Default' && (
                            <div className="text-[10px] text-stone-400 font-sans">
                              {m.variantName}
                            </div>
                          )}
                          {m.notes && (
                            <div className="text-[10px] text-stone-500 font-sans mt-1 italic">
                              “{m.notes}”
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider">
                            {isIn ? (
                              <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ArrowUpCircle className="w-3.5 h-3.5 text-[var(--destructive)]" />
                            )}
                            <span className={isIn ? 'text-emerald-600' : 'text-[var(--destructive)]'}>
                              {isIn ? 'IN' : 'OUT'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </td>
                        <td className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-stone-600">
                          {m.reason.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-500 font-mono">
                          {m.createdByEmail || m.createdById?.slice(0, 8) || 'system'}
                        </td>
                        <td className="py-3 px-4 text-right text-[10px] font-mono text-stone-500">
                          {new Date(m.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href={hasPrev ? buildPageUrl(currentPage - 1) : '#'}
              aria-disabled={!hasPrev}
              className={`px-3 py-1.5 border border-border text-[11px] font-medium transition-colors ${
                hasPrev
                  ? 'text-stone-600 hover:text-foreground hover:border-border-strong cursor-pointer'
                  : 'text-stone-400 opacity-50 pointer-events-none'
              }`}
            >
              ← Previous
            </Link>

            <span className="text-[11px] text-stone-500 font-mono">
              {currentPage} / {totalPages}
            </span>

            <Link
              href={hasNext ? buildPageUrl(currentPage + 1) : '#'}
              aria-disabled={!hasNext}
              className={`px-3 py-1.5 border border-border text-[11px] font-medium transition-colors ${
                hasNext
                  ? 'text-stone-600 hover:text-foreground hover:border-border-strong cursor-pointer'
                  : 'text-stone-400 opacity-50 pointer-events-none'
              }`}
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
