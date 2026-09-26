'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Product & Technical',
    question: 'What is the difference between HD Analog (DVR) and Network IP (NVR) systems?',
    answer:
      'HD Analog systems (CP Plus Cosmic, Hikvision Turbo HD) transmit video over coaxial 3+1 cabling to a DVR. They are cost-effective, straightforward to install, and ideal for standard residential or small retail shops. Network IP systems transmit digital video packets over Cat6 ethernet cabling to an NVR, supporting ultra-high 4K resolutions, PoE (Power over Ethernet) single-cable power, and advanced AI analytics (human/vehicle detection, perimeter tripwires).',
  },
  {
    category: 'Product & Technical',
    question: 'How do I calculate how much hard drive storage (TB) I need?',
    answer:
      'Under modern H.265 video compression, a 2MP camera recording continuously at 1080p consumes approximately 20–25GB per day. A 4-camera 2MP system recording for 30 days requires ~2.5TB to 3TB. With motion-detection recording enabled, storage requirements drop by 40–50%. We exclusively supply surveillance-grade hard drives (Western Digital Purple and Seagate SkyHawk) engineered for 24/7 continuous write cycles.',
  },
  {
    category: 'Product & Technical',
    question: 'Can I combine dome and bullet cameras in the same kit?',
    answer:
      'Yes! Dome cameras are typically installed indoors (living rooms, retail counters, office corridors) for discreet appearance and wide fields of view. Bullet cameras are weather-rated (IP67) with extended IR/ColorVu night vision spotlights, making them ideal for outdoor boundaries, parking lots, and building facades. You can customize any combination using our Interactive CCTV Kit Builder.',
  },
  {
    category: 'B2B & GST Invoicing',
    question: 'How do I claim 18% GST Input Tax Credit (ITC) for my business?',
    answer:
      'During checkout, simply check the "Are you purchasing for a registered business?" toggle and input your legal Company Name and 15-character Indian GSTIN. Our system dynamically computes the CGST/SGST (for Gujarat intra-state) or IGST (for inter-state) and generates an official Tax Invoice uploaded to GSTR-1, enabling full credit offset on your business GST returns.',
  },
  {
    category: 'Shipping & Payment',
    question: 'What are the rules and limits for Cash on Delivery (COD)?',
    answer:
      'Cash on Delivery is available for orders up to ₹15,000 in serviceable postal zones. For high-value heavy surveillance equipment (16-channel NVRs, 305m cable rolls) or remote air-cargo postal circles (North-East states, J&K), orders must be prepaid via Razorpay (UPI, Cards, Net Banking) to prevent transit refusal and high courier return costs.',
  },
  {
    category: 'Shipping & Payment',
    question: 'How fast will my order arrive and how do I track it?',
    answer:
      'Orders placed before 4:00 PM IST (Mon–Sat) are dispatched on the same day. Deliveries within Gujarat take 1–2 business days; metro cities take 2–3 business days; regional locations take 3–5 business days. Once dispatched, you receive instant WhatsApp and SMS alerts containing your live Delhivery or Shiprocket AWB tracking link.',
  },
  {
    category: 'Warranty & RMA',
    question: 'How does warranty work for CP Plus, Hikvision, and Dahua cameras?',
    answer:
      'All cameras and recorders carry standard 1-to-3-year authorized manufacturer warranties. In addition, Patel Networks scans and embeds every unique hardware serial number onto your GST Tax Invoice. You can claim warranty service directly at any authorized service center across India or contact our RMA desk for assistance.',
  },
];

const CATEGORIES = ['ALL', 'Product & Technical', 'B2B & GST Invoicing', 'Shipping & Payment', 'Warranty & RMA'] as const;

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredFaqs = selectedCategory === 'ALL'
    ? FAQS
    : FAQS.filter((f) => f.category === selectedCategory);

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
              <span className="text-foreground">Frequently Asked Questions</span>
            </nav>

            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-stone-500">Knowledge base &amp; buying guides</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.02] text-foreground max-w-4xl">
                Frequently asked <span className="ital">questions.</span>
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-8 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                Everything you need to know about CCTV camera resolutions, DVR/NVR matching,
                hard drive calculations, 18% GST Input Tax Credit, and shipping policies.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORY FILTER — hairline pill row */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-6">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-4 py-2 text-xs font-medium rounded-sm border transition-colors',
                      isActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-stone-600 dark:text-stone-400 border-border hover:border-foreground hover:text-foreground'
                    )}
                  >
                    {cat === 'ALL' ? 'All questions' : cat}
                  </button>
                );
              })}
              <span className="ml-auto font-mono text-[11px] text-stone-400">
                {String(filteredFaqs.length).padStart(2, '0')} / {String(FAQS.length).padStart(2, '0')}
              </span>
            </div>
          </Reveal>
        </section>

        {/* ============================================================ */}
        {/* ACCORDION — hairline rows */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
          <div className="border-t border-border">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <Reveal key={`${selectedCategory}-${idx}`} delay={idx * 30}>
                  <div className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full py-6 lg:py-7 flex items-start justify-between text-left gap-6 group"
                    >
                      <div className="flex items-start gap-5 min-w-0">
                        <span className="font-mono text-[11px] text-stone-400 mt-1 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div className="eyebrow text-stone-400 mb-2">{faq.category}</div>
                          <div
                            className={cn(
                              'display text-lg sm:text-xl leading-tight transition-colors',
                              isOpen ? 'text-[var(--brand)]' : 'text-foreground group-hover:text-[var(--brand)]'
                            )}
                          >
                            {faq.question}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-stone-400 shrink-0 mt-1 transition-transform duration-300',
                          isOpen && 'rotate-180 text-[var(--brand)]'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-7 pl-10 pr-10 max-w-3xl">
                        <div className="rule mb-5" />
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-card/30">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">Engineering desk</div>
                  <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight text-foreground max-w-lg">
                    Have a specific project requirement?
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-4 max-w-md">
                    Our surveillance solutions engineers can review your floor plan, camera
                    count, and storage needs.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/contact" className="btn-ink">
                    Contact engineering desk <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/kit-builder" className="btn-ghost">
                    CCTV kit builder <ArrowUpRight className="w-3.5 h-3.5" />
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
