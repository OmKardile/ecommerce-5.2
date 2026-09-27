'use client';

import React, { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Download, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { exportMovementsCsvAction } from '@/app/stock/actions/export.actions';

interface MovementsFiltersProps {
  initialSearch: string;
  initialReason: string;
  initialDateFrom: string;
  initialDateTo: string;
  canExport: boolean;
}

const REASONS = [
  { value: 'ALL', label: 'All reasons' },
  { value: 'PURCHASE_RECEIPT', label: 'Purchase Receipt' },
  { value: 'ORDER_RESERVED', label: 'Order Reserved' },
  { value: 'ORDER_DISPATCHED', label: 'Order Dispatched' },
  { value: 'ORDER_CANCELLED_RESTOCK', label: 'Order Cancelled (Restock)' },
  { value: 'RETURN_RESTOCK', label: 'Return Restock' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'DAMAGED_WRITE_OFF', label: 'Damaged / Write-off' },
];

/**
 * MovementsFilters — client component that drives the server-rendered
 * movements table via URL search params (so filters are shareable + survive
 * refresh). Also hosts the CSV export button.
 */
export function MovementsFilters({
  initialSearch,
  initialReason,
  initialDateFrom,
  initialDateTo,
  canExport,
}: MovementsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [reason, setReason] = useState(initialReason || 'ALL');
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (reason && reason !== 'ALL') params.set('reason', reason);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const qs = params.toString();
    router.push(`/stock/movements${qs ? `?${qs}` : ''}`);
  };

  const handleExport = () => {
    setFeedback(null);
    setExporting(true);
    startTransition(async () => {
      try {
        const res = await exportMovementsCsvAction({
          search: search.trim(),
          reason,
          dateFrom,
          dateTo,
        });
        if (res.success) {
          // Trigger a browser download of the CSV blob.
          const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = res.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setFeedback({ ok: true, msg: 'CSV exported.' });
        } else {
          setFeedback({ ok: false, msg: res.error || 'Export failed.' });
        }
      } catch (err: any) {
        setFeedback({ ok: false, msg: err?.message || 'Unexpected error.' });
      } finally {
        setExporting(false);
      }
    });
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={applyFilters}
        className="border border-border bg-card p-4 flex flex-col gap-3 lg:flex-row lg:items-end"
      >
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="mv-search" className="eyebrow text-stone-500 mb-1.5 block">
            Search SKU / product / notes
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="mv-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. CPP-B01 or Hikvision"
              className="w-full pl-9 pr-3 py-2 bg-background border border-border focus:border-border-strong text-sm text-foreground placeholder:text-stone-400 transition-colors outline-none"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="lg:w-56">
          <label htmlFor="mv-reason" className="eyebrow text-stone-500 mb-1.5 block">
            Movement reason
          </label>
          <select
            id="mv-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border focus:border-border-strong text-sm text-foreground transition-colors outline-none cursor-pointer"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label htmlFor="mv-from" className="eyebrow text-stone-500 mb-1.5 block">
            From date
          </label>
          <input
            id="mv-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-background border border-border focus:border-border-strong text-sm text-foreground transition-colors outline-none cursor-pointer"
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="mv-to" className="eyebrow text-stone-500 mb-1.5 block">
            To date
          </label>
          <input
            id="mv-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-background border border-border focus:border-border-strong text-sm text-foreground transition-colors outline-none cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-ink inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
          <span>Apply</span>
        </button>
      </form>

      {canExport && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-[12px] font-medium text-stone-600 hover:text-foreground hover:border-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[var(--brand)]" />
            )}
            <span>{exporting ? 'Exporting…' : 'Export matching rows to CSV'}</span>
          </button>

          {feedback && (
            <div
              className={`flex items-center gap-1.5 text-[11px] ${
                feedback.ok ? 'text-emerald-600' : 'text-[var(--destructive)]'
              }`}
            >
              {feedback.ok ? (
                <Check className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
