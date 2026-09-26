import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';

export const metadata = {
  title: 'Warranty & Returns (RMA) Policy | Patel Networks Commercial Hardware',
  description: '7-Day DOA replacement guarantee, manufacturer warranty claims for Hikvision, CP Plus, Dahua, and hardware serial verification guidelines.',
};

const PILLARS = [
  {
    label: '7-Day DOA Replacement',
    body: 'If any camera, DVR/NVR, or switch arrives Dead On Arrival (DOA) or damaged in transit, we provide a free reverse pickup and immediate brand-new replacement.',
  },
  {
    label: '1–3 Year Brand Warranty',
    body: 'All Hikvision, CP Plus, Dahua, and Western Digital Purple HDDs carry official manufacturer warranty honored at any authorized service center across India.',
  },
  {
    label: 'Serial-Tracked Invoices',
    body: 'Every item dispatched includes individual hardware serial numbers recorded on your official 18% GST Tax Invoice, simplifying warranty claims.',
  },
];

const VOID_CONDITIONS = [
  {
    label: 'Cut or installed cable spools',
    body: 'Coaxial cable or Cat6 networking spools that have been cut, unspooled, or crimped cannot be accepted for return.',
  },
  {
    label: 'Electrical surge or lightning damage',
    body: 'Camera boards or SMPS power supplies showing burned PCB tracks due to lightning strikes or improper high-voltage power adapters.',
  },
  {
    label: 'Tampered warranty stickers',
    body: 'Products with missing, scratched, or altered factory barcode / serial stickers.',
  },
  {
    label: 'Indoor models exposed outdoors',
    body: 'Physical drops & water ingress on indoor dome cameras installed in unshaded outdoor rainfall conditions.',
  },
];

export default function ReturnPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HEADER BAND — editorial intro */}
        {/* ============================================================ */}
        <section className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 lg:pt-14 pb-12 lg:pb-16">
            <nav className="text-[11px] text-stone-500 dark:text-stone-500 mb-8 flex items-center gap-2">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-stone-300 dark:text-stone-600">/</span>
              <span className="text-foreground">Warranty & Returns Policy</span>
            </nav>

            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-stone-500">Commercial RMA & warranty assurance</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.02] text-foreground max-w-4xl">
                Warranty &amp; <span className="ital">returns</span> (RMA) policy.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                Patel Networks supplies 100% genuine commercial surveillance hardware backed
                by authorized manufacturer warranties. Our Return Merchandise Authorization
                (RMA) process is streamlined for retail buyers, electrical contractors, and
                system integrators.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PILLARS — hairline-row grid */}
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
        {/* PROSE BODY */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-card/30">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">

            {/* Section 1 — DOA Claims Procedure */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">01 — DOA Claims</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Dead-on-arrival claims procedure.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
                In the rare event of receiving defective or damaged surveillance equipment:
              </p>
              <ol className="space-y-5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">01</span>
                  <span>Notify our RMA desk within <span className="text-foreground font-medium">7 days of delivery</span> via WhatsApp or email to <code className="font-mono text-foreground">support@patelnetworks.com</code>.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">02</span>
                  <span>Provide your <span className="text-foreground font-medium">Order Number</span> (e.g. <code className="font-mono text-foreground">ORD-1234</code>) and a brief video or photo showing the hardware defect or physical damage.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">03</span>
                  <span>Our technical desk will verify the serial number against the dispatch records and arrange a complimentary reverse courier pickup via Delhivery.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">04</span>
                  <span>Upon inspection at our Surat warehouse, a brand-new replacement unit will be dispatched within 24 hours.</span>
                </li>
              </ol>
            </Reveal>

            <div className="rule my-14" />

            {/* Section 2 — Void Conditions */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">02 — Non-returnable conditions</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Conditions that void eligibility.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
                The following circumstances invalidate return eligibility and manufacturer
                warranty:
              </p>
              <div className="border-t border-border">
                {VOID_CONDITIONS.map((c, i) => (
                  <div
                    key={c.label}
                    className="grid grid-cols-[auto_1fr] gap-6 py-5 border-b border-border"
                  >
                    <span className="font-mono text-[11px] text-stone-400 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-sm text-foreground font-medium mb-1">{c.label}</div>
                      <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        {c.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="rule my-14" />

            {/* Section 3 — Refund Processing */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">03 — Refund processing</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Refund processing timelines.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                When a refund is approved by our RMA desk:
              </p>
              <ul className="space-y-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">A</span>
                  <span><span className="text-foreground font-medium">Prepaid Razorpay orders:</span> Credited back to the original source account (UPI, Debit/Credit Card, Net Banking) within 3–5 business days.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">B</span>
                  <span><span className="text-foreground font-medium">COD orders:</span> Processed via direct NEFT/IMPS bank transfer upon customer providing account details and cancelled cheque.</span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">C</span>
                  <span><span className="text-foreground font-medium">B2B GST credit note:</span> For registered commercial entities, an official GST Credit Note is issued and uploaded to GSTR-1, ensuring compliant accounting.</span>
                </li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA */}
        {/* ============================================================ */}
        <section className="border-t border-border">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">RMA &amp; support desk</div>
                  <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight text-foreground max-w-lg">
                    Need technical support or RMA help?
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-4 max-w-md">
                    Our engineers can help diagnose camera configuration issues before
                    requesting physical returns.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/contact" className="btn-ink">
                    Contact RMA desk <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/account" className="btn-ghost">
                    My orders &amp; invoices <ArrowUpRight className="w-3.5 h-3.5" />
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
