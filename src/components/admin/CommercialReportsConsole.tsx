'use client';

import React from 'react';
import {
  Boxes,
  CreditCard,
  Banknote,
  Download,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { CommercialReportData } from '@/server/services/admin.service';

interface Props {
  data: CommercialReportData;
}

export function CommercialReportsConsole({ data }: Props) {
  const { summary, taxBreakdown, inventoryValuation, paymentSplit, dailySales } = data;

  const totalPayments = paymentSplit.razorpayCount + paymentSplit.codCount;
  const prepaidRatio = totalPayments > 0 ? Math.round((paymentSplit.razorpayCount / totalPayments) * 100) : 0;
  const codRatio = 100 - prepaidRatio;

  const maxDailyRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

  const exportGstr1Csv = () => {
    const intraTaxable =
      taxBreakdown.cgstTotal > 0
        ? Math.round((taxBreakdown.cgstTotal + taxBreakdown.sgstTotal) / 0.18)
        : 0;
    const interTaxable =
      taxBreakdown.igstTotal > 0 ? Math.round(taxBreakdown.igstTotal / 0.18) : 0;
    const totalTaxable = intraTaxable + interTaxable;

    const headers = [
      'Tax Schedule',
      'Tax Component',
      'Statutory Rate',
      'Taxable Base (INR)',
      'Tax Amount (INR)',
      'Jurisdiction Applicability',
    ];
    const rows = [
      [
        'Intra-State (Gujarat)',
        'CGST (Central Goods & Services Tax)',
        '9%',
        intraTaxable,
        taxBreakdown.cgstTotal,
        'Within Gujarat State',
      ],
      [
        'Intra-State (Gujarat)',
        'SGST (State Goods & Services Tax)',
        '9%',
        intraTaxable,
        taxBreakdown.sgstTotal,
        'Within Gujarat State',
      ],
      [
        'Inter-State (Pan-India)',
        'IGST (Integrated Goods & Services Tax)',
        '18%',
        interTaxable,
        taxBreakdown.igstTotal,
        'Outside Gujarat State',
      ],
      [
        'Consolidated Total',
        'All GST Components Combined',
        '18%',
        totalTaxable,
        taxBreakdown.totalGst,
        'Statutory GSTR-1 Return Filing',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patel_networks_gstr1_tax_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric tiles for the top strip
  const topMetrics = [
    {
      eyebrow: 'Gross Revenue (GMV)',
      value: formatInr(summary.totalRevenue),
      sub: `${summary.totalOrders} confirmed orders`,
      accent: false,
    },
    {
      eyebrow: 'GST Collected · 18%',
      value: formatInr(summary.totalGstCollected),
      sub: 'Statutory · GSTR-1 filing',
      accent: true,
    },
    {
      eyebrow: 'Average Order Value',
      value: formatInr(summary.avgOrderValue),
      sub: 'Commercial surveillance ticket',
      accent: false,
    },
    {
      eyebrow: 'Warehouse Asset Value',
      value: formatInr(inventoryValuation.totalAssetValue),
      sub: `${inventoryValuation.totalPhysicalUnits} physical units`,
      accent: false,
    },
  ];

  return (
    <div className="bg-background text-foreground space-y-8">
      {/* Console meta */}
      <div className="border-b border-border-strong pb-5">
        <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
          <span className="dot-rec" /> Commercial Reports
        </div>
        <p className="text-sm text-stone-400 max-w-2xl">
          Real-time accounting, statutory tax breakdown, inventory valuation, and payment
          analytics for the Gujarat fulfillment hub.
        </p>
      </div>

      {/* 4 primary metrics — hairline strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border-strong rounded-sm overflow-hidden">
        {topMetrics.map((m) => (
          <div key={m.eyebrow} className="bg-card p-5">
            <div className="eyebrow text-stone-500 mb-2">{m.eyebrow}</div>
            <div
              className={`text-2xl font-mono ${m.accent ? 'text-[var(--brand)]' : 'text-foreground'}`}
            >
              {m.value}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid: GSTR-1 Tax + Payment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GSTR-1 Tax Schedule */}
        <div className="border border-border-strong bg-card rounded-sm">
          <div className="flex items-start justify-between p-5 border-b border-border-subtle">
            <div>
              <div className="eyebrow text-stone-500 mb-1.5 flex items-center gap-1.5">
                <Download className="w-3 h-3" /> GSTR-1 Tax Schedule
              </div>
              <h2 className="text-sm font-sans font-semibold text-foreground tracking-tight">
                Goods &amp; Services Tax Breakdown
              </h2>
              <p className="text-[11px] text-stone-500 mt-1">
                Statutory GST for Gujarat hub · 18% commercial rate
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--brand)] border border-[var(--brand)]/40 px-2 py-1 rounded-sm">
                18% GST
              </span>
              <button
                type="button"
                onClick={exportGstr1Csv}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-foreground border border-border hover:border-border-strong rounded-sm transition-colors font-medium"
                title="Download statutory GSTR-1 CSV report"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-border-subtle">
            {[
              { label: 'Intra-State CGST', detail: 'Central · 9%', value: taxBreakdown.cgstTotal },
              { label: 'Intra-State SGST', detail: 'State · 9%', value: taxBreakdown.sgstTotal },
              { label: 'Inter-State IGST', detail: 'Integrated · 18%', value: taxBreakdown.igstTotal },
            ].map((row) => (
              <div key={row.label} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-foreground">{row.label}</div>
                  <div className="eyebrow text-stone-500 mt-0.5">{row.detail}</div>
                </div>
                <div className="font-mono text-sm text-foreground">{formatInr(row.value)}</div>
              </div>
            ))}
            <div className="px-5 py-3.5 flex items-center justify-between bg-background/30">
              <div className="text-sm text-foreground font-medium">Total GST Collected</div>
              <div className="font-mono text-base text-[var(--brand)]">
                {formatInr(taxBreakdown.totalGst)}
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border-subtle text-[11px] text-stone-500 leading-relaxed">
            All B2B commercial invoices are tagged with 15-character GSTINs and recorded for
            monthly GSTR-1 return filing under Indian tax law.
          </div>
        </div>

        {/* Payment Method Split */}
        <div className="border border-border-strong bg-card rounded-sm">
          <div className="flex items-start justify-between p-5 border-b border-border-subtle">
            <div>
              <div className="eyebrow text-stone-500 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> Payment Methods
              </div>
              <h2 className="text-sm font-sans font-semibold text-foreground tracking-tight">
                Razorpay Prepaid vs Selective COD
              </h2>
              <p className="text-[11px] text-stone-500 mt-1">
                Gateway distribution &amp; RTO risk exposure
              </p>
            </div>
            <span className="font-mono text-[10px] text-foreground border border-border px-2 py-1 rounded-sm">
              {prepaidRatio}% prepaid
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Prepaid row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                  Online Prepaid · Razorpay
                </span>
                <span className="font-mono text-foreground">
                  {formatInr(paymentSplit.razorpayAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>{paymentSplit.razorpayCount} orders</span>
                <span className="font-mono">{prepaidRatio}%</span>
              </div>
              <div className="h-1 bg-background border border-border-subtle">
                <div
                  className="h-full bg-[var(--brand)] transition-all duration-500"
                  style={{ width: `${prepaidRatio}%` }}
                />
              </div>
            </div>

            {/* COD row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-stone-400" />
                  Cash on Delivery · Selective COD
                </span>
                <span className="font-mono text-foreground">
                  {formatInr(paymentSplit.codAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>{paymentSplit.codCount} orders</span>
                <span className="font-mono">{codRatio}%</span>
              </div>
              <div className="h-1 bg-background border border-border-subtle">
                <div
                  className="h-full bg-stone-400 transition-all duration-500"
                  style={{ width: `${codRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Inventory Valuation */}
      <div className="border border-border-strong bg-card rounded-sm">
        <div className="flex items-start justify-between p-5 border-b border-border-subtle">
          <div>
            <div className="eyebrow text-stone-500 mb-1.5 flex items-center gap-1.5">
              <Boxes className="w-3 h-3" /> Warehouse Capital Assets
            </div>
            <h2 className="text-sm font-sans font-semibold text-foreground tracking-tight">
              Live Inventory Valuation
            </h2>
            <p className="text-[11px] text-stone-500 mt-1">
              Across all camera, DVR/NVR, cable, and hard drive SKUs · Surat central hub
            </p>
          </div>
          <div className="text-right">
            <div className="eyebrow text-stone-500">Active SKUs</div>
            <div className="font-mono text-sm text-foreground mt-1">
              {inventoryValuation.totalSkusCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
          <div className="bg-card p-5">
            <div className="eyebrow text-stone-500 mb-2">Physical Units</div>
            <div className="text-xl font-mono text-foreground">
              {inventoryValuation.totalPhysicalUnits}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Inside Surat warehouse</div>
          </div>
          <div className="bg-card p-5">
            <div className="eyebrow text-stone-500 mb-2">Available for Sale</div>
            <div className="text-xl font-mono text-foreground">
              {inventoryValuation.totalAvailableUnits}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Unreserved net available</div>
          </div>
          <div className="bg-card p-5">
            <div className="eyebrow text-stone-500 mb-2">Asset Value</div>
            <div className="text-xl font-mono text-[var(--brand)]">
              {formatInr(inventoryValuation.totalAssetValue)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">At current selling prices</div>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend — hairline bars */}
      {dailySales.length > 0 && (
        <div className="border border-border-strong bg-card rounded-sm">
          <div className="p-5 border-b border-border-subtle">
            <div className="eyebrow text-stone-500 mb-1.5">Daily Sales · Last 30 Days</div>
            <h2 className="text-sm font-sans font-semibold text-foreground tracking-tight">
              Order Velocity &amp; GMV Distribution
            </h2>
          </div>

          <div className="p-5 space-y-2.5">
            {dailySales.map((day) => {
              const widthPct = Math.round((day.revenue / maxDailyRevenue) * 100);
              return (
                <div key={day.date} className="flex items-center gap-4 text-xs">
                  <span className="w-24 text-stone-500 font-mono text-[11px] shrink-0">
                    {day.date}
                  </span>
                  <div className="flex-1 h-5 bg-background border border-border-subtle relative">
                    <div
                      className="h-full bg-[var(--brand)] transition-all"
                      style={{ width: `${Math.max(widthPct, 1)}%` }}
                    />
                  </div>
                  <span className="w-24 text-right font-mono text-foreground shrink-0">
                    {formatInr(day.revenue)}
                  </span>
                  <span className="w-20 text-right text-stone-500 text-[11px] shrink-0 font-mono">
                    {day.orders} {day.orders === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
