import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';

export const metadata = {
  title: 'Privacy Policy | Patel Networks Security Data Protection',
  description: 'Compliance with Information Technology Act 2000, SPDI rules, 15-character GSTIN handling, and Razorpay PCI-DSS encryption protocols.',
};

const PILLARS = [
  {
    label: 'Zero Payment Storage',
    body: 'We never store your credit/debit card numbers, CVVs, or UPI PINs. All payments are encrypted via Razorpay’s certified PCI-DSS Level 1 infrastructure.',
  },
  {
    label: 'B2B Tax Data Protection',
    body: 'Company GSTINs and legal billing names are stored securely in PostgreSQL with row-level access controls solely for GSTR-1 tax compliance.',
  },
  {
    label: 'No Third-Party Selling',
    body: 'Your contact numbers and addresses are strictly shared with carrier partners (Delhivery / Shiprocket) for delivery dispatch and never sold to third-party telemarketers.',
  },
];

const COLLECTED = [
  {
    label: 'Primary Identity',
    body: 'Mobile phone number verified via 6-digit SMS OTP (ADR-003, ADR-011).',
  },
  {
    label: 'Dispatch Information',
    body: 'Recipient name, complete shipping address, postal PIN code, and contact number.',
  },
  {
    label: 'Commercial B2B Credentials',
    body: 'Company trade name and 15-character Indian GSTIN for 18% Input Tax Credit.',
  },
  {
    label: 'Hardware Traceability',
    body: 'Individual hardware serial numbers linked to your order records for RMA warranty enforcement.',
  },
];

const NOTIFICATIONS = [
  'OTP verification codes for customer authentication.',
  'Order confirmation notifications with total INR amounts and links to your 18% GST Tax Invoice.',
  'Real-time courier AWB dispatch alerts and out-for-delivery notices.',
  'B2B contractor wholesale quote responses requested via our quote desks.',
];

export default function PrivacyPolicyPage() {
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
              <span className="text-foreground">Privacy Policy</span>
            </nav>

            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-stone-500">Indian IT Act 2000 &amp; SPDI compliant</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.02] text-foreground max-w-4xl">
                Privacy &amp; <span className="ital">data security</span> policy.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                Patel Networks is committed to protecting the privacy, corporate
                tax data, and financial transactions of all retail consumers and commercial
                surveillance contractors.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PILLARS */}
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

            {/* Section 1 — Information Collected */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">01 — Information collected</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Information we collect.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
                When using Patel Networks, we collect only the necessary data points to
                fulfill hardware procurement:
              </p>
              <div className="border-t border-border">
                {COLLECTED.map((c, i) => (
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

            {/* Section 2 — Transactional Communications */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">02 — Transactional communications</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                WhatsApp &amp; SMS notifications.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                By checking out or placing an inquiry on our platform, you consent to receive
                critical transactional updates via the official{' '}
                <span className="text-foreground font-medium">Meta WhatsApp Cloud API</span>{' '}
                and SMS gateways. These notifications are limited strictly to:
              </p>
              <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {NOTIFICATIONS.map((n, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="font-mono text-[11px] text-[var(--brand)] mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="rule my-14" />

            {/* Section 3 — Cookies */}
            <Reveal>
              <div className="eyebrow text-stone-500 mb-3">03 — Cookies &amp; sessions</div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-foreground mb-5">
                Cookies and session management.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                We employ strict, HTTP-only, secure, SameSite cookies{' '}
                (<code className="font-mono text-foreground">pn_session</code>,{' '}
                <code className="font-mono text-foreground">pn_cart_id</code>) to maintain
                shopping carts across visits and secure customer logins without exposing
                tokens to client-side scripts.
              </p>
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
                  <div className="eyebrow text-stone-500 mb-3">Data &amp; security desk</div>
                  <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight text-foreground max-w-lg">
                    Questions about how your data is handled?
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-4 max-w-md">
                    Our team can clarify what is stored, what is shared with carrier
                    partners, and how your B2B credentials are protected.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/contact" className="btn-ink">
                    Contact the desk <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/terms" className="btn-ghost">
                    Terms of service <ArrowUpRight className="w-3.5 h-3.5" />
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
