'use client';

import React, { useTransition, useState } from 'react';
import { Loader2, Zap, AlertCircle, Check } from 'lucide-react';
import { generateAlertsAction } from '@/app/stock/actions/stock.actions';

/**
 * GenerateAlertsButton — triggers the inventory-wide scan that creates OPEN
 * alerts for any SKU at or below its low stock threshold (idempotent).
 */
export function GenerateAlertsButton({ canManageAlerts }: { canManageAlerts: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!canManageAlerts) return null;

  const handleScan = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await generateAlertsAction();
        if (res.success) {
          setFeedback({
            ok: true,
            msg: `Scan complete — ${res.created ?? 0} new alert(s) created, ${res.skipped ?? 0} skipped.`,
          });
        } else {
          setFeedback({ ok: false, msg: res.error || 'Scan failed.' });
        }
      } catch (err: any) {
        setFeedback({ ok: false, msg: err?.message || 'Unexpected error.' });
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={handleScan}
        className="inline-flex items-center gap-2 px-3.5 py-2 border border-border text-[12px] font-medium text-stone-600 hover:text-foreground hover:border-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-[var(--brand)]" />
        )}
        <span>{isPending ? 'Scanning inventory…' : 'Scan inventory for alerts'}</span>
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
  );
}
