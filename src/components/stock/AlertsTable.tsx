'use client';

import React, { useTransition, useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import type { StockAlertRow } from '@/server/services/stock.service';
import {
  acknowledgeAlertAction,
  resolveAlertAction,
} from '@/app/stock/actions/stock.actions';

interface AlertsTableProps {
  alerts: StockAlertRow[];
  canManageAlerts: boolean;
}

/**
 * AlertsTable — interactive table of stock alerts.
 *
 * Renders the list server-side (via props) but wires Acknowledge + Resolve
 * buttons to server actions via useTransition. Shows inline success/error
 * feedback without a full page reload (router.refresh happens via
 * revalidatePath on the server action side).
 */
export function AlertsTable({ alerts, canManageAlerts }: AlertsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (
    alertId: string,
    fn: (id: string) => Promise<{ success: boolean; error?: string }>
  ) => {
    setPendingId(alertId);
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await fn(alertId);
        setFeedback({
          id: alertId,
          ok: res.success,
          msg: res.success
            ? 'Updated.'
            : res.error || 'Action failed.',
        });
      } catch (err: any) {
        setFeedback({
          id: alertId,
          ok: false,
          msg: err?.message || 'Unexpected error.',
        });
      } finally {
        setPendingId(null);
      }
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="p-10 text-center text-stone-500 text-xs border border-border-strong bg-card">
        No alerts match this filter. All inventory is above threshold.
      </div>
    );
  }

  return (
    <div className="border border-border-strong bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-background text-stone-500 border-b border-border-subtle text-[10px] uppercase tracking-[0.16em]">
            <tr>
              <th className="py-3 px-4 font-medium">SKU</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium text-right">Stock / Threshold</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Created</th>
              {canManageAlerts && <th className="py-3 px-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.map((a) => {
              const isPendingThis = isPending && pendingId === a.id;
              const feedbackThis = feedback?.id === a.id ? feedback : null;
              return (
                <tr key={a.id} className="hover:bg-background/60 transition-colors align-top">
                  <td className="py-3 px-4 font-mono text-foreground">
                    {a.skuCode}
                    <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                      {a.productName}
                    </div>
                    {a.variantName && a.variantName !== 'Default' && (
                      <div className="text-[10px] text-stone-400 font-sans">
                        {a.variantName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-right font-mono">
                    <span className="text-foreground">{a.currentStock}</span>
                    <span className="text-stone-500"> / {a.threshold}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={a.status} />
                    {a.acknowledgedAt && (
                      <div className="text-[9px] text-stone-500 font-mono mt-1">
                        ack · {new Date(a.acknowledgedAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                    {a.resolvedAt && (
                      <div className="text-[9px] text-stone-500 font-mono">
                        resolved · {new Date(a.resolvedAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-stone-500 text-[10px] font-mono">
                    {new Date(a.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  {canManageAlerts && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPendingThis || a.status !== 'OPEN'}
                          onClick={() => runAction(a.id, acknowledgeAlertAction)}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-border text-[10px] font-medium text-stone-600 hover:text-foreground hover:border-border-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isPendingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Acknowledge</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPendingThis || a.status === 'RESOLVED'}
                          onClick={() => runAction(a.id, resolveAlertAction)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-foreground text-background text-[10px] font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isPendingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Resolve</span>
                        </button>
                      </div>
                      {feedbackThis && (
                        <div
                          className={`mt-1.5 flex items-center gap-1 justify-end text-[10px] ${
                            feedbackThis.ok ? 'text-emerald-600' : 'text-[var(--destructive)]'
                          }`}
                        >
                          {feedbackThis.ok ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{feedbackThis.msg}</span>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'OPEN'
      ? 'border-amber-500/50 text-amber-600'
      : status === 'ACKNOWLEDGED'
      ? 'border-[var(--brand)]/50 text-[var(--brand)]'
      : 'border-emerald-600/50 text-emerald-600';
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${styles}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
