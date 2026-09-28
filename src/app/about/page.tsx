import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';

export const metadata = {
  title: 'About Patel Networks | Authorized CCTV Distribution',
  description: 'Gujarat premier commercial security distributor for CP Plus, Hikvision, Dahua, and enterprise networking hardware.',
};

const BRAND_PARTNERS = [
  { name: 'CP Plus', slug: 'cp-plus' },
  { name: 'Hikvision', slug: 'hikvision' },
  { name: 'Dahua Tech', slug: 'dahua' },
  { name: 'WD Purple', slug: 'western-digital' },
  { name: 'D-Link', slug: 'd-link' },
];

const PILLARS = [
  {
    no: '01',
    label: 'Strict serial tracking',
    body: 'Every surveillance camera, hard drive, and recorder leaving our warehouse has its unique factory serial number scanned and printed on your official 18% GST Tax Invoice, safeguarding genuine manufacturer warranty claims.',
  },
  {
    no: '02',
    label: 'Express same-day dispatch',
    body: 'Equipped with a high-density warehouse in Surat, we dispatch orders before 4:00 PM IST on the same day via Delhivery Air and Surface logistics, ensuring 1–2 day delivery across Gujarat and 2–3 days across Indian metros.',
  },
  {
    no: '03',
    label: 'Engineer-vetted catalog',
    body: 'Every SKU in our catalog is specified and deployed in the field by engineers who install these systems. No rebranded grey market, no mystery SKUs — only serial-tracked, manufacturer-warranted hardware.',
  },
  {
    no: '04',
    label: 'B2B GST compliance',
    body: 'Enter your GSTIN at checkout and our system dynamically computes CGST/SGST or IGST, issues an official Tax Invoice, and files it into GSTR-1 — enabling full 18% Input Tax Credit on your business returns.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO — editorial ink band, no gradient */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-foreground text-background">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
            <Reveal>
              <div className="flex items-center gap-4 mb-10">
                <span className="dot-rec" aria-hidden />
                <span className="text-[12px] tracking-[0.24em] uppercase font-medium text-background/55">
                  Authorized surveillance &amp; networking distributor
                </span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] max-w-4xl text-background">
                Building India&apos;s most trusted
                <br />
                <span className="ital">surveillance</span> supply chain.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-background/70 leading-relaxed max-w-xl">
                Headquartered in Surat, Gujarat, Patel Networks supplies
                commercial security cameras, AI-enabled NVRs, structured Cat6 cabling, and
                enterprise fiber equipment to security installers, electrical contractors,
                and corporate institutions.
              </p>
            </Reveal>

            {/* Trust line */}
            <Reveal delay={180}>
              <div className="mt-14 pt-8 border-t border-background/15 grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-8 max-w-3xl">
                {[
                  ['Headquarters', 'Surat, Gujarat'],
                  ['Brand alliances', '5 authorized'],
                  ['Pincode coverage', '19,000+'],
                  ['Dispatch SLA', 'Same-day, 4 PM IST'],
                ].map(([a, b]) => (
                  <div key={a}>
                    <div className="text-sm text-background font-medium">{a}</div>
                    <div className="text-[11px] text-background/50 mt-0.5">{b}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRAND PARTNERS — hairline grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
          <Reveal>
            <div className="eyebrow text-stone-500 mb-3 text-center">Direct authorized brand alliances</div>
          </Reveal>
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-border">
              {BRAND_PARTNERS.map((b) => (
                <Link
                  key={b.slug}
                  href={`/products?brand=${b.slug}`}
                  className="group flex items-center justify-center py-10 px-4 border-r border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <span className="display text-xl text-foreground group-hover:text-[var(--brand)] transition-colors">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============================================================ */}
        {/* STORY — editorial still-life band */}
        {/* ============================================================ */}
        <section className="border-y border-border bg-card/30">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <Reveal className="lg:col-span-7 order-1">
                <div className="eyebrow text-stone-500 mb-5">The discipline</div>
                <h2 className="display text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-foreground max-w-xl">
                  Hardware chosen by people who <span className="ital">install it.</span>
                </h2>
                <div className="mt-8 space-y-5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl">
                  <p>
                    Patel Networks was founded by engineers who specify, deploy, and service
                    these systems in the field. That origin informs every part of the
                    operation — from the SKUs we stock to the way serials are recorded on
                    every invoice.
                  </p>
                  <p>
                    The catalog is intentionally narrow: only commercial-grade hardware from
                    the brands Indian installers already trust. No rebranded grey market, no
                    mystery SKUs — only serial-tracked, manufacturer-warranted equipment
                    shipped from our central warehouse in Surat.
                  </p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 mt-8 text-sm text-foreground link-underline"
                >
                  Browse the catalog <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Reveal>

              <Reveal delay={80} className="lg:col-span-5 order-2">
                <div className="border border-border p-8 lg:p-10 bg-background">
                  <div className="eyebrow text-stone-500 mb-6">Operating principles</div>
                  <ul className="space-y-5">
                    {[
                      ['Genuine serials', 'Every unit scanned, every invoice serial-attached.'],
                      ['Same-day dispatch', 'Cut-off 4:00 PM IST, Mon–Sat.'],
                      ['B2B GST invoicing', 'CGST/SGST or IGST, filed to GSTR-1.'],
                      ['RMA accountability', '7-day DOA replacement guarantee.'],
                    ].map(([k, v]) => (
                      <li key={k} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                        <div className="text-sm text-foreground font-medium">{k}</div>
                        <div className="text-[12px] text-stone-500 mt-1 leading-relaxed">{v}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PILLARS — numbered editorial rows */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <div className="mb-12">
              <div className="eyebrow text-stone-500 mb-3">What we hold to</div>
              <h2 className="display text-[clamp(1.9rem,4vw,2.8rem)] leading-tight text-foreground max-w-xl">
                Four commitments behind every shipment.
              </h2>
            </div>
          </Reveal>

          <div className="border-t border-border">
            {PILLARS.map((p, i) => (
              <Reveal key={p.no} delay={i * 50}>
                <div className="grid grid-cols-12 gap-4 py-8 border-b border-border items-start">
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-stone-400">
                    {p.no}
                  </span>
                  <div className="col-span-10 sm:col-span-4">
                    <h3 className="display text-xl sm:text-2xl text-foreground">
                      {p.label}
                    </h3>
                  </div>
                  <p className="col-span-12 sm:col-span-7 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA — kit builder */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-foreground text-background">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <Reveal className="lg:col-span-8">
                <div className="eyebrow text-background/50 mb-4">Configuration tool</div>
                <h2 className="display text-[clamp(1.9rem,4vw,3rem)] leading-tight">
                  Try our interactive CCTV <span className="ital">kit builder.</span>
                </h2>
                <p className="mt-5 text-base text-background/70 leading-relaxed max-w-xl">
                  Configure compatible cameras, DVR/NVR recorders, hard drives, and power
                  supplies in five simple steps with an automatic 5% bundle discount.
                </p>
              </Reveal>
              <Reveal delay={80} className="lg:col-span-4">
                <Link
                  href="/kit-builder"
                  className="inline-flex items-center gap-2.5 bg-background text-foreground px-7 py-4 text-sm font-medium rounded-sm transition-transform hover:-translate-y-0.5"
                >
                  Launch kit builder <ArrowRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
