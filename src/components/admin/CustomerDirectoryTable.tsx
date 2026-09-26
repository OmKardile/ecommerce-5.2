'use client';

import React, { useState } from 'react';
import {
  Search,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { AdminCustomerSummary } from '@/server/services/admin.service';

interface Props {
  initialCustomers: AdminCustomerSummary[];
}

export function CustomerDirectoryTable({ initialCustomers }: Props) {
  const [customers] = useState<AdminCustomerSummary[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'B2B' | 'RETAIL'>('ALL');

  const filteredCustomers = customers.filter((c) => {
    if (selectedFilter === 'B2B' && (!c.gstin && !c.companyName)) return false;
    if (selectedFilter === 'RETAIL' && (c.gstin || c.companyName)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const b2bCount = customers.filter((c) => c.gstin || c.companyName).length;
  const retailCount = customers.length - b2bCount;
  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="dark bg-background text-foreground space-y-6">
      {/* Editorial metric strip — 3 hairline cells */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2A2823] border border-[#2A2823] rounded-sm overflow-hidden">
        <div className="bg-card p-5">
          <div className="eyebrow text-stone-500 mb-2">Total Accounts</div>
          <div className="text-2xl font-mono text-foreground">{customers.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Retail consumers &amp; registered contractors
          </div>
        </div>

        <div className="bg-card p-5">
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-1.5">
            <Building2 className="w-3 h-3" /> B2B Commercial
          </div>
          <div className="text-2xl font-mono text-[var(--brand)]">{b2bCount}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            With 15-char GSTIN · 18% input credit eligible
          </div>
        </div>

        <div className="bg-card p-5">
          <div className="eyebrow text-stone-500 mb-2">Customer LTV</div>
          <div className="text-2xl font-mono text-foreground">{formatInr(totalSpend)}</div>
          <div className="text-[11px] text-stone-500 mt-1">Aggregate procurement GMV</div>
        </div>
      </div>

      {/* Filter + search bar */}
      <div className="border border-[#2A2823] bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm">
        <div className="flex items-center gap-px bg-[#2A2823] border border-[#2A2823] rounded-sm overflow-hidden">
          {([
            ['ALL', `All · ${customers.length}`],
            ['B2B', `B2B · ${b2bCount}`],
            ['RETAIL', `Retail · ${retailCount}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                selectedFilter === key
                  ? 'bg-foreground text-background'
                  : 'bg-card text-stone-400 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, company, GSTIN"
            className="w-full pl-9 pr-3 h-9 bg-background border border-[#2A2823] text-xs text-foreground placeholder:text-stone-500 focus:outline-none focus:border-[var(--brand)] rounded-sm transition-colors font-sans"
          />
        </div>
      </div>

      {/* Customer directory table */}
      <div className="border border-[#2A2823] bg-card overflow-hidden rounded-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="border-b border-[#2A2823] bg-background/30">
              <tr>
                <th className="eyebrow py-3 px-4 font-medium">Customer</th>
                <th className="eyebrow py-3 px-4 font-medium">B2B Company / GSTIN</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Orders</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Lifetime Spend</th>
                <th className="eyebrow py-3 px-4 font-medium">Location</th>
                <th className="eyebrow py-3 px-4 font-medium">Joined</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2823]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-stone-500">
                    No matching customer accounts found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                    cust.fullName
                  )},%20regarding%20your%20Patel%20Networks%20order`;

                  return (
                    <tr key={cust.id} className="hover:bg-background/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="text-sm text-foreground font-medium">{cust.fullName}</div>
                        <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {cust.companyName || cust.gstin ? (
                          <div className="space-y-1">
                            <div className="text-[11px] text-foreground flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-stone-500" />
                              <span>{cust.companyName || 'Registered Enterprise'}</span>
                            </div>
                            {cust.gstin && (
                              <div className="font-mono text-[10px] text-[var(--brand)] inline-block">
                                GSTIN · {cust.gstin}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-500 italic">Retail account</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm text-foreground">
                        {cust.totalOrders}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm text-foreground">
                        {formatInr(cust.totalSpent)}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-stone-400">
                        {cust.city ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                            <span>
                              {cust.city}, {cust.state}{' '}
                              <span className="font-mono text-stone-500">{cust.pincode}</span>
                            </span>
                          </span>
                        ) : (
                          <span className="text-stone-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-stone-400">
                        <div>
                          {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {cust.lastOrderDate && (
                          <div className="text-stone-500 text-[10px] mt-0.5">
                            Last:{' '}
                            {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#3A3830] hover:border-foreground text-[11px] text-foreground rounded-sm transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
