import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';

export const metadata = {
  title: 'Terms of Service & Sale | Patel Networks Commercial Platform',
  description: 'Legal terms of sale, 18% GST invoice generation, B2B Input Tax Credit liabilities, pricing policies, and jurisdiction guidelines.',
};

const GST_POINTS = [
  'All displayed prices reflect both the base price and the applicable 18% GST breakdown.',
  'Customers requesting B2B invoices must enter a valid 15-character Indian GSTIN and legal trade name at checkout.',
  'Patel Networks files all B2B invoices into GSTR-1 by the statutory deadline, allowing verified registered businesses to claim 100% Input Tax Credit (ITC).',
  'The purchaser is solely responsible for ensuring the accuracy of their GSTIN before placing an order. Once an invoice is generated and dispatched, retrospective amendments cannot be made.',
];

const VERIFICATION_POINTS = [
  'Order placement does not constitute unconditional binding acceptance until our warehouse reserves stock and verifies payment status or COD serviceability.',
  'In the rare event of concurrent inventory depletion or pricing inaccuracies, Patel Networks reserves the right to cancel the order and provide an immediate 100% refund.',
];

const LIABILITY_POINTS = [
  'Loss of recorded video footage, data corruption on hard disk drives, or improper CCTV camera placement.',
  'Improper installation, incorrect wiring polarities, or third-party electrical surge damage.',
  'Any indirect, incidental, or consequential damages resulting from equipment downtime.',
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HEADER BAND */}
        {/* ============================================================ */}
        <section className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 lg:pt-14 pb-12 lg:pb-16">
            <nav className="text-[11px] text-stone-500 dark:text-stone-500 mb-8 flex items-center gap-2">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-stone-300 dark:text-stone-600">/</span>
              <span className="text-foreground">Terms of Service</span>
            </nav>

            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-stone-500">Commercial e-commerce agreement</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.02] text-foreground max-w-4xl">
                Terms of <span className="ital">service</span> &amp; sale.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                These terms govern all purchases of security, surveillance, and networking
                hardware made on Patel Networks by retail consumers, electrical
                contractors, and institutional buyers.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PROSE BODY */}
        {/* ============================================================ */}
        <section className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">

          {/* Section 1 — GST Invoicing & ITC */}
          <Reveal>
            <div className="eyebrow text-stone-500 mb-3">01 — GST invoicing &amp; ITC</div>
            <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
              18% GST tax invoicing &amp; Input Tax Credit.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              All commercial hardware — cameras, recorders, cabling, optical converters, hard
              drives — sold on Patel Networks is subject to the Indian Goods and Services Tax
              (GST) Act:
            </p>
            <ul className="space-y-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {GST_POINTS.map((p, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="rule my-14" />

          {/* Section 2 — Order Verification */}
          <Reveal>
            <div className="eyebrow text-stone-500 mb-3">02 — Order verification</div>
            <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
              Order verification &amp; concurrency safeguards.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              Due to real-time physical warehouse inventory management (ADR-010):
            </p>
            <ul className="space-y-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {VERIFICATION_POINTS.map((p, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="rule my-14" />

          {/* Section 3 — Limitation of Liability */}
          <Reveal>
            <div className="eyebrow text-stone-500 mb-3">03 — Limitation of liability</div>
            <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
              Liability for surveillance data.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              Patel Networks acts solely as an authorized commercial distributor of hardware.
              We are not liable for:
            </p>
            <ul className="space-y-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {LIABILITY_POINTS.map((p, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="rule my-14" />

          {/* Section 4 — Governing Law */}
          <Reveal>
            <div className="eyebrow text-stone-500 mb-3">04 — Governing law</div>
            <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
              Governing law &amp; jurisdiction.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              These terms of sale are governed by the laws of the Republic of India. Any
              legal disputes arising out of transactions on this platform shall be subject to
              the exclusive jurisdiction of the competent courts in{' '}
              <span className="text-foreground font-medium">Surat, Gujarat, India</span>.
            </p>
          </Reveal>
        </section>

        {/* ============================================================ */}
        {/* CTA */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-card/30">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">Compliance desk</div>
                  <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight text-foreground max-w-lg">
                    Need a clause clarified before ordering?
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-4 max-w-md">
                    Our compliance desk can walk through GST invoicing, ITC claims, or
                    liability terms before you place an institutional order.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/contact" className="btn-ink">
                    Contact the desk <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/privacy-policy" className="btn-ghost">
                    Privacy policy <ArrowUpRight className="w-3.5 h-3.5" />
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
