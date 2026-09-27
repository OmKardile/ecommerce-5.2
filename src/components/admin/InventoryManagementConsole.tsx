'use client';

import React, { useState, useTransition } from 'react';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  X,
} from 'lucide-react';
import { MovementReason } from '@prisma/client';
import { adjustStockAction } from '@/app/actions/admin.actions';

interface InventoryItem {
  id: string; // skuId
  code: string;
  productName: string;
  variantName: string;
  brandName: string;
  categoryName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  threshold: number;
  recentMovements: Array<{
    id: string;
    quantity: number;
    reason: MovementReason;
    notes?: string | null;
    createdAt: string;
  }>;
}

interface Props {
  initialItems: InventoryItem[];
}

export function InventoryManagementConsole({ initialItems }: Props) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState<InventoryItem | null>(null);

  // Modal Form State
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState<MovementReason>(MovementReason.PURCHASE_RECEIPT);
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.code.toLowerCase().includes(q) ||
      it.productName.toLowerCase().includes(q) ||
      it.variantName.toLowerCase().includes(q) ||
      it.brandName.toLowerCase().includes(q)
    );
  });

  const lowStockCount = items.filter((it) => it.availableStock <= it.threshold).length;

  const handleOpenAdjust = (sku: InventoryItem) => {
    setSelectedSku(sku);
    setDelta(10);
    setReason(MovementReason.PURCHASE_RECEIPT);
    setNotes('');
  };

  const handleCloseAdjust = () => {
    setSelectedSku(null);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || delta === 0) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await adjustStockAction({
        skuId: selectedSku.id,
        quantityDelta: delta,
        reason,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        const newStock = res.data.currentStock;
        setItems((prev) =>
          prev.map((it) =>
            it.id === selectedSku.id
              ? {
                  ...it,
                  currentStock: newStock,
                  availableStock: Math.max(0, newStock - it.reservedStock),
                  recentMovements: [
                    {
                      id: 'new_' + Date.now(),
                      quantity: delta,
                      reason,
                      notes: notes.trim() || 'Manual adjustment',
                      createdAt: new Date().toISOString(),
                    },
                    ...it.recentMovements.slice(0, 4),
                  ],
                }
              : it
          )
        );
        setFeedback(
          `${selectedSku.code} adjusted by ${delta > 0 ? '+' : ''}${delta} units`
        );
        setSelectedSku(null);
      } else {
        alert(res.error || 'Failed to adjust stock');
      }
    });
  };

  return (
    <div className="bg-background text-foreground space-y-6">
      {/* Console meta + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-strong pb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <span className="dot-rec" /> Inventory Matrix
          </div>
          <div className="text-xs font-mono text-stone-400">
            {items.length} SKUs
            <span className="text-stone-600 mx-2">·</span>
            <span className="text-[var(--brand)]">{lowStockCount} low-stock</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, product, variant, brand"
              className="w-full pl-9 pr-3 h-9 bg-card border border-border text-xs text-foreground placeholder:text-stone-500 focus:outline-none focus:border-border-strong rounded-sm transition-colors font-sans"
            />
          </div>

          {feedback && (
            <div className="px-3 py-1.5 border border-border bg-card text-[11px] text-foreground flex items-center gap-2 rounded-sm">
              <span className="dot-rec" />
              <span className="font-mono">{feedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dense SKU Inventory Matrix — hairline editorial table */}
      <div className="border border-border-strong bg-card overflow-hidden rounded-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="border-b border-border-subtle bg-background/30">
              <tr>
                <th className="eyebrow py-3 px-4 font-medium">SKU</th>
                <th className="eyebrow py-3 px-4 font-medium">Hardware Item</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Physical</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Reserved</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Available</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Threshold</th>
                <th className="eyebrow py-3 px-4 font-medium">Status</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-stone-500">
                    No SKUs match the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.availableStock <= item.threshold;
                  return (
                    <tr key={item.id} className="hover:bg-background/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--brand)]">
                        {item.code}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-sm text-foreground font-medium line-clamp-1">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{item.variantName}</span>
                          <span className="text-stone-600">/</span>
                          <span>{item.brandName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm text-foreground">
                        {item.currentStock}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-stone-400">
                        {item.reservedStock}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm">
                        <span className={isLow ? 'text-[var(--brand)]' : 'text-foreground'}>
                          {item.availableStock}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-stone-500">
                        ≤ {item.threshold}
                      </td>

                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="text-[11px] text-[var(--brand)] flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Low
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                            <span className="dot-rec" />
                            Optimal
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2.5 py-1 text-[11px] text-foreground border border-border hover:border-border-strong hover:bg-background/40 rounded-sm transition-colors font-medium"
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
      </div>

      {/* Stock Adjustment Modal — flat, sharp, no glow */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border-strong max-w-md w-full rounded-sm">
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-border-subtle">
              <div>
                <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                  <span className="dot-rec" /> Stock Adjustment
                </div>
                <h3 className="text-base font-sans font-semibold text-foreground tracking-tight">
                  Adjust Physical Inventory
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed max-w-sm">
                  Updates cloud inventory and appends an immutable audit movement.
                </p>
              </div>
              <button
                onClick={handleCloseAdjust}
                className="text-stone-400 hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target SKU block */}
            <div className="mx-5 mt-5 p-3 border border-border-subtle bg-background/40 rounded-sm space-y-1">
              <div className="font-mono text-xs text-[var(--brand)]">{selectedSku.code}</div>
              <div className="text-sm text-foreground font-medium">{selectedSku.productName}</div>
              <div className="text-[11px] text-stone-500">
                {selectedSku.variantName}
                <span className="text-stone-600 mx-1.5">·</span>
                Current:{' '}
                <span className="font-mono text-foreground">{selectedSku.currentStock}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="p-5 space-y-5 text-xs">
              {/* Delta input */}
              <div className="space-y-2">
                <label className="eyebrow text-stone-500 block">
                  Quantity Delta · + restock / − decrease
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev - 5)}
                    className="w-9 h-9 flex items-center justify-center border border-border hover:border-border-strong text-stone-400 hover:text-foreground rounded-sm transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 text-center h-9 bg-background border border-border text-foreground font-mono text-sm focus:outline-none focus:border-border-strong rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev + 5)}
                    className="w-9 h-9 flex items-center justify-center border border-border hover:border-border-strong text-stone-400 hover:text-foreground rounded-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-stone-500">
                  Projected stock:{' '}
                  <span className="font-mono text-foreground">
                    {Math.max(0, selectedSku.currentStock + delta)}
                  </span>{' '}
                  units
                </div>
              </div>

              {/* Reason dropdown */}
              <div className="space-y-2">
                <label className="eyebrow text-stone-500 block">Movement Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as MovementReason)}
                  className="w-full h-9 px-3 bg-background border border-border text-foreground text-xs focus:outline-none focus:border-border-strong rounded-sm"
                >
                  <option value={MovementReason.PURCHASE_RECEIPT}>
                    PURCHASE_RECEIPT — Vendor PO arrival
                  </option>
                  <option value={MovementReason.MANUAL_ADJUSTMENT}>
                    MANUAL_ADJUSTMENT — Audit reconciliation
                  </option>
                  <option value={MovementReason.DAMAGED_WRITE_OFF}>
                    DAMAGED_WRITE_OFF — Defective hardware
                  </option>
                  <option value={MovementReason.RETURN_RESTOCK}>
                    RETURN_RESTOCK — Customer / RMA return
                  </option>
                </select>
              </div>

              {/* Notes textarea */}
              <div className="space-y-2">
                <label className="eyebrow text-stone-500 block">Audit Notes / PO Reference</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received 20 units via Delhivery cargo from Hikvision Ahmedabad"
                  className="w-full px-3 py-2 bg-background border border-border text-foreground text-xs placeholder:text-stone-600 focus:outline-none focus:border-border-strong rounded-sm resize-none font-sans"
                />
              </div>

              {/* Submit row */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCloseAdjust}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-foreground border border-border hover:border-border-strong rounded-sm transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || delta === 0}
                  className="btn-ink disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {isPending ? 'Updating…' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
