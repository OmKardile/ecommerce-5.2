import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';

export const metadata = {
  title: 'Shipping & Delivery Policy | Patel Networks Commercial Logistics',
  description: 'Pan-India shipping rates, express transit SLAs, 6-digit Pincode dispatch zones, and Cash on Delivery serviceability guidelines.',
};

const PILLARS = [
  {
    label: 'Same-Day Dispatch',
    body: 'All prepaid orders and verified COD orders placed before 4:00 PM IST (Mon–Sat) are packaged, serial-numbered, and handed over to courier hubs on the same day.',
  },
  {
    label: 'Free Express Shipping',
    body: 'All commercial orders above ₹999 qualify for complimentary insured surface or air delivery with real-time AWB tracking.',
  },
  {
    label: 'Transit Insurance',
    body: 'Every shipment is 100% insured against loss or transit damage. We recommend recording an unboxing video upon parcel handover for instant DOA claims.',
  },
];

const TRANSIT_ROWS = [
  {
    zone: 'Intra-State (Gujarat)',
    coverage: 'Surat, Ahmedabad, Vadodara, Rajkot',
    transit: '1 – 2 Business Days',
    mode: 'Direct Express Surface',
  },
  {
    zone: 'Tier-1 Metro Cities',
    coverage: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata',
    transit: '2 – 3 Business Days',
    mode: 'Priority Air / Fast Surface',
  },
  {
    zone: 'Regional Hubs',
    coverage: 'Pune, Jaipur, Lucknow, Indore, Chandigarh, Kochi',
    transit: '3 – 5 Business Days',
    mode: 'National Surface Express',
  },
  {
    zone: 'Special / Remote Zones',
    coverage: 'North-East states, Jammu & Kashmir, Ladakh, Andaman & Nicobar',
    transit: '5 – 8 Business Days',
    mode: 'Dedicated Air Cargo',
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HEADER BAND — editorial intro, hairline, no gradient */}
        {/* ============================================================ */}
        <section className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 lg:pt-14 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            <nav className="text-[11px] text-stone-500 dark:text-stone-500 mb-8 flex items-center gap-2">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-stone-300 dark:text-stone-600">/</span>
              <span className="text-foreground">Shipping & Delivery Policy</span>
            </nav>

            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-stone-500">Pan-India express surveillance logistics</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.02] text-foreground max-w-4xl">
                Shipping & <span className="ital">dispatch</span> policy.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                Patel Networks partners with tier-1 logistics couriers — Delhivery,
                Shiprocket, BlueDart — to deliver fragile, commercial-grade security
                cameras, DVRs, NVRs, and cabling safely across 19,000+ Indian PIN codes.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PILLARS — hairline-row grid, no colored icon tiles */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
            {PILLARS.map((p, i) => (
              <Reveal key={p.label} delay={i * 60}>
                <div className="border-r border-b border-border p-8 lg:p-10 h-full">
                  <div className="font-mono text-[11px] text-stone-400 mb-4">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="display text-xl text-foreground mb-3">{p.label}</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* PROSE BODY — editorial sections with hairline dividers */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-card/30">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">

            {/* Section 1 — Transit SLAs */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">01 — Transit SLAs</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Delivery timelines by Indian postal zone.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
                Transit timelines are calculated based on your 6-digit postal PIN code
                from our Central Warehouse Hub in Surat, Gujarat.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="border border-border overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="py-3 px-4 font-medium text-stone-500 eyebrow">Zone</th>
                      <th className="py-3 px-4 font-medium text-stone-500 eyebrow">Coverage</th>
                      <th className="py-3 px-4 font-medium text-stone-500 eyebrow">Transit</th>
                      <th className="py-3 px-4 font-medium text-stone-500 eyebrow">Carrier Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TRANSIT_ROWS.map((r) => (
                      <tr key={r.zone} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{r.zone}</td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400">{r.coverage}</td>
                        <td className="py-3 px-4 text-[var(--brand)] font-mono">{r.transit}</td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">{r.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <div className="rule my-14" />

            {/* Section 2 — COD Rules */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">02 — Cash on Delivery</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                COD rules &amp; RTO safeguards.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                To mitigate Return-To-Origin (RTO) risks on high-value, heavy commercial
                equipment (16-channel NVRs, 305-meter drum cable spools), selective Cash on
                Delivery policies apply (ADR-004):
              </p>
              <ul className="space-y-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">A</span>
                  <span><span className="text-foreground font-medium">Order value ceiling:</span> COD is available for orders up to ₹15,000. Orders exceeding ₹15,000 must be prepaid via Razorpay (UPI, Credit/Debit Card, Net Banking).</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">B</span>
                  <span><span className="text-foreground font-medium">Air cargo exclusions:</span> Remote delivery zones (PIN prefixes 79, 19, 744) requiring dedicated air freight are restricted to prepaid online payment.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">C</span>
                  <span><span className="text-foreground font-medium">COD verification:</span> For first-time COD customers, our dispatch operations team sends an automated WhatsApp confirmation before generating courier manifests.</span>
                </li>
              </ul>
            </Reveal>

            <div className="rule my-14" />

            {/* Section 3 — Tracking */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">03 — Tracking & Notifications</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Real-time tracking &amp; WhatsApp notifications.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                As soon as your shipment manifest is generated, an automated notification is
                sent via <span className="text-foreground font-medium">WhatsApp</span> and{' '}
                <span className="text-foreground font-medium">SMS</span> containing your
                Carrier Partner name (Delhivery / Shiprocket) and direct live AWB tracking
                link. You can also track your order anytime on our{' '}
                <Link href="/account" className="text-[var(--brand)] link-underline">
                  Account Tracking Portal
                </Link>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA — editorial, sharp */}
        {/* ============================================================ */}
        <section className="border-t border-border">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">Dispatch desk</div>
                  <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight text-foreground max-w-lg">
                    Have questions about your delivery?
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-4 max-w-md">
                    Contact our logistics dispatch desk or track your active consignment
                    directly through your account.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/account" className="btn-ink">
                    Track order <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    Contact dispatch <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
