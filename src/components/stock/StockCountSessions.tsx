'use client';

import React, { useTransition, useState } from 'react';
import {
  ClipboardList,
  Loader2,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { createCountSessionAction } from '@/app/stock/actions/stock.actions';

interface SessionSummary {
  id: string;
  name: string;
  status: string;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  totalItems: number;
  completedItems: number;
  discrepancies: number;
}

interface SkuOption {
  id: string;
  code: string;
  productName: string;
  variantName: string;
  currentStock: number;
}

interface StockCountSessionsProps {
  sessions: SessionSummary[];
  skuOptions: SkuOption[];
  canReconcile: boolean;
}

/**
 * StockCountSessions — client component for the count sessions page.
 *
 * Lists existing sessions as cards + shows a "New session" form (name +
 * multi-select SKUs) for employees with STOCK_RECONCILE permission.
 */
export function StockCountSessions({
  sessions,
  skuOptions,
  canReconcile,
}: StockCountSessionsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [sessionName, setSessionName] = useState('');
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());

  const toggleSku = (id: string) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const name = sessionName.trim();
    if (!name) {
      setFeedback({ ok: false, msg: 'Session name is required.' });
      return;
    }
    if (selectedSkus.size === 0) {
      setFeedback({ ok: false, msg: 'Select at least one SKU to count.' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createCountSessionAction(name, Array.from(selectedSkus));
        if (res.success) {
          setFeedback({ ok: true, msg: `Session "${name}" created (${selectedSkus.size} SKU(s)).` });
          setSessionName('');
          setSelectedSkus(new Set());
          // Force a refresh so the new session appears in the list.
          if (typeof window !== 'undefined') window.location.reload();
        } else {
          setFeedback({ ok: false, msg: res.error || 'Failed to create session.' });
        }
      } catch (err: any) {
        setFeedback({ ok: false, msg: err?.message || 'Unexpected error.' });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Existing sessions */}
      <section className="space-y-3">
        <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[var(--brand)]" />
          <span>Existing Sessions ({sessions.length})</span>
        </h2>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs border border-border-strong bg-card">
            No count sessions yet. {canReconcile && 'Create the first one below.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions.map((s) => {
              const statusStyle =
                s.status === 'COMPLETED'
                  ? 'border-emerald-600/50 text-emerald-600'
                  : s.status === 'IN_PROGRESS'
                  ? 'border-[var(--brand)]/50 text-[var(--brand)]'
                  : s.status === 'CANCELLED'
                  ? 'border-stone-400/50 text-stone-500'
                  : 'border-amber-500/50 text-amber-600';
              return (
                <div
                  key={s.id}
                  className="border border-border-strong bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-sans text-[14px] font-bold text-foreground">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {new Date(s.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${statusStyle}`}
                    >
                      {s.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-center">
                    <div>
                      <div className="font-sans text-[16px] font-bold text-foreground leading-none">
                        {s.totalItems}
                      </div>
                      <div className="eyebrow text-stone-500 mt-1">Items</div>
                    </div>
                    <div>
                      <div className="font-sans text-[16px] font-bold text-foreground leading-none">
                        {s.completedItems}
                      </div>
                      <div className="eyebrow text-stone-500 mt-1">Counted</div>
                    </div>
                    <div>
                      <div
                        className={`font-sans text-[16px] font-bold leading-none ${
                          s.discrepancies > 0
                            ? 'text-[var(--destructive)]'
                            : 'text-foreground'
                        }`}
                      >
                        {s.discrepancies}
                      </div>
                      <div className="eyebrow text-stone-500 mt-1">Discrep.</div>
                    </div>
                  </div>

                  {s.completedAt && (
                    <div className="text-[10px] text-stone-500 font-mono pt-1">
                      Completed · {new Date(s.completedAt).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* New session form */}
      {canReconcile && (
        <section className="space-y-3">
          <h2 className="font-sans text-[15px] font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--brand)]" />
            <span>New Count Session</span>
          </h2>

          <form
            onSubmit={handleSubmit}
            className="border border-border-strong bg-card p-5 space-y-4"
          >
            <div>
              <label htmlFor="session-name" className="eyebrow text-stone-500 mb-1.5 block">
                Session name
              </label>
              <input
                id="session-name"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Q3 2026 Full Count"
                className="w-full px-3 py-2 bg-background border border-border focus:border-border-strong text-sm text-foreground placeholder:text-stone-400 transition-colors outline-none"
              />
            </div>

            <div>
              <div className="eyebrow text-stone-500 mb-1.5">
                SKUs to count ({selectedSkus.size} selected)
              </div>
              <div className="border border-border-subtle bg-background max-h-72 overflow-y-auto divide-y divide-border-subtle">
                {skuOptions.length === 0 ? (
                  <div className="p-4 text-center text-stone-500 text-xs">
                    No SKUs available.
                  </div>
                ) : (
                  skuOptions.map((sku) => {
                    const checked = selectedSkus.has(sku.id);
                    return (
                      <label
                        key={sku.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-background/60 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSku(sku.id)}
                          className="w-3.5 h-3.5 accent-[var(--brand)] cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-mono text-foreground">
                            {sku.code}
                            <span className="text-stone-500 font-sans ml-2">
                              · {sku.currentStock} on shelf
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-sans truncate">
                            {sku.productName} — {sku.variantName}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  if (selectedSkus.size === skuOptions.length) {
                    setSelectedSkus(new Set());
                  } else {
                    setSelectedSkus(new Set(skuOptions.map((s) => s.id)));
                  }
                }}
                className="text-[11px] font-medium text-[var(--brand)] hover:text-[var(--brand-soft)] link-underline transition-colors cursor-pointer"
              >
                {selectedSkus.size === skuOptions.length ? 'Clear all' : 'Select all'}
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="btn-ink inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isPending ? 'Creating…' : 'Create count session'}</span>
              </button>
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-1.5 text-[11px] ${
                  feedback.ok ? 'text-emerald-600' : 'text-[var(--destructive)]'
                }`}
              >
                {feedback.ok ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{feedback.msg}</span>
              </div>
            )}
          </form>
        </section>
      )}

      {!canReconcile && (
        <div className="border border-border-subtle bg-card p-4 text-[11px] text-stone-500">
          You do not have STOCK_RECONCILE permission — count session creation is
          disabled. Contact the operations manager if you need this permission.
        </div>
      )}
    </div>
  );
}
