'use client';

import React, { useState, useTransition } from 'react';
import { Search, Loader2, Check, AlertCircle } from 'lucide-react';
import { adjustStockAction } from '@/app/actions/admin.actions';
import { formatInr } from '@/lib/utils';

interface SkuItem {
  id: string;
  code: string;
  variantName: string;
  productName: string;
  brandName: string;
  sellingPrice: number;
  currentStock: number;
  reservedStock: number;
  lowStockThreshold: number;
}

interface StockAdjustPanelProps {
  skus: SkuItem[];
}

export function StockAdjustPanel({ skus }: StockAdjustPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedSku, setSelectedSku] = useState<SkuItem | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = skus.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.productName.toLowerCase().includes(q) ||
      s.brandName.toLowerCase().includes(q) ||
      s.variantName.toLowerCase().includes(q)
    );
  });

  const handleAdjust = () => {
    if (!selectedSku || delta === 0) return;
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      const res = await adjustStockAction({
        skuId: selectedSku.id,
        delta,
        reason: reason || 'MANUAL_ADJUSTMENT',
        notes: notes.trim() || `Adjusted by stock clerk via /stock/adjust`,
      });
      if (res.success) {
        setFeedback(`${selectedSku.code} adjusted by ${delta > 0 ? '+' : ''}${delta} units`);
        setSelectedSku(null);
        setDelta(0);
        setReason('');
        setNotes('');
      } else {
        setError(res.error || 'Failed to adjust stock');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-border-strong pb-4">
        <div>
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <span className="dot-rec" /> Adjust Stock
          </div>
          <h1 className="text-xl font-bold text-foreground mt-2">Stock Adjustments</h1>
          <p className="text-xs text-stone-500 mt-1">
            Log stock in (restock), stock out (dispatch/damage), or manual corrections.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SKU code, product name, or brand…"
          className="w-full pl-10 pr-4 py-2.5 bg-transparent border-b border-border focus:border-foreground focus:outline-none text-sm text-foreground placeholder:text-stone-400"
        />
      </div>

      {/* SKU list */}
      <div className="border border-border-strong">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="eyebrow py-2.5 px-3 text-left font-medium">SKU</th>
              <th className="eyebrow py-2.5 px-3 text-left font-medium">Product</th>
              <th className="eyebrow py-2.5 px-3 text-right font-medium">Price</th>
              <th className="eyebrow py-2.5 px-3 text-right font-medium">Stock</th>
              <th className="eyebrow py-2.5 px-3 text-right font-medium">Available</th>
              <th className="eyebrow py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                  No SKUs match your search.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((sku) => {
                const available = Math.max(0, sku.currentStock - sku.reservedStock);
                return (
                  <tr key={sku.id} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{sku.code}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-medium text-foreground">{sku.productName}</div>
                      <div className="text-[10px] text-stone-500">{sku.brandName} · {sku.variantName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{formatInr(sku.sellingPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                      {sku.currentStock}
                      {sku.currentStock <= sku.lowStockThreshold && sku.currentStock > 0 && (
                        <span className="text-[var(--brand)] ml-1">⚠</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{available}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSku(sku);
                          setDelta(0);
                          setReason('');
                          setNotes('');
                          setFeedback(null);
                          setError(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium border border-border hover:border-foreground hover:bg-surface-3 transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSelectedSku(null)}
          />
          <div className="relative bg-card border border-border-strong max-w-md w-full p-6">
            <h2 className="text-base font-bold text-foreground mb-1">Adjust Stock</h2>
            <p className="text-xs text-stone-500 mb-4 font-mono">{selectedSku.code} · {selectedSku.productName}</p>

            <div className="space-y-4">
              {/* Current stock */}
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Current stock</span>
                <span className="font-mono font-bold text-foreground">{selectedSku.currentStock}</span>
              </div>

              {/* Delta input */}
              <div>
                <label className="eyebrow text-stone-500 block mb-1.5">Adjustment (±)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDelta(delta - 1)}
                    className="w-8 h-8 border border-border hover:border-foreground flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
                    className="w-16 text-center font-mono border border-border py-1.5 bg-transparent text-foreground focus:outline-none focus:border-foreground"
                  />
                  <button
                    onClick={() => setDelta(delta + 1)}
                    className="w-8 h-8 border border-border hover:border-foreground flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-xs text-stone-500 ml-2">
                    → New stock: <span className="font-mono font-bold text-foreground">{selectedSku.currentStock + delta}</span>
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="eyebrow text-stone-500 block mb-1.5">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-transparent border border-border py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value="">Select reason…</option>
                  <option value="PURCHASE_RECEIPT">Restock (new stock in)</option>
                  <option value="ORDER_DISPATCHED">Sale / dispatch</option>
                  <option value="DAMAGED_WRITE_OFF">Damage / write-off</option>
                  <option value="RETURN_RESTOCK">Return (customer return)</option>
                  <option value="MANUAL_ADJUSTMENT">Manual correction</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="eyebrow text-stone-500 block mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Received 5 units from Hikvision dealer, invoice INV-2026-0042"
                  className="w-full bg-transparent border border-border p-2 text-sm text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground resize-none"
                />
              </div>

              {/* Feedback / Error */}
              {feedback && (
                <div className="flex items-center gap-2 text-xs text-foreground bg-surface-2 p-2.5 border border-border">
                  <Check className="w-4 h-4 text-[var(--brand)]" /> {feedback}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-surface-2 p-2.5 border border-border">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAdjust}
                  disabled={isPending || delta === 0 || !reason}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-foreground text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isPending ? 'Saving…' : 'Confirm Adjustment'}
                </button>
                <button
                  onClick={() => setSelectedSku(null)}
                  className="px-4 py-2.5 border border-border text-sm font-medium text-stone-500 hover:text-foreground hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
