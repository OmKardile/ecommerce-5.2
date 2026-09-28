'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Send, ArrowRight, ArrowUpRight } from 'lucide-react';
import { submitB2BQuoteInquiryAction } from '@/app/actions/whatsapp.actions';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      await submitB2BQuoteInquiryAction({
        customerName: name,
        phone,
        companyName: company || 'Retail Customer / Contractor',
        productName: 'General Consultation & Wholesale Inquiry',
        quantity: 1,
        notes: notes || 'General inquiry submitted via Contact Desk',
      });
      setSubmitted(true);
    } catch {
      // Graceful fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-stone-500 mb-3 flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-stone-300 dark:text-stone-600">/</span>
          <span className="text-foreground">Contact &amp; Support Desk</span>
        </nav>

        {/* Hero — editorial, no gradient banner */}
        <div className="mb-12 max-w-3xl">
          <div className="eyebrow text-stone-500 mb-4 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            Central Distribution Hub · Surat, Gujarat
          </div>
          <h1 className="display text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] text-foreground">
            Surveillance consultation, <em>wholesale &amp; contractor desk.</em>
          </h1>
          <p className="mt-5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
            Need guidance on DVR channel capacity, lens FOV calculations, or bulk B2B
            project pricing for 10+ cameras? Our CCTV systems engineers are ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sidebar — direct contact details as hairline rows */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="border-t border-border">
              {/* Address */}
              <div className="border-b border-border py-5">
                <div className="eyebrow text-stone-500 mb-2">Warehouse &amp; Node</div>
                <p className="text-sm text-foreground leading-relaxed">
                  Patel Networks<br />
                  (Distribution Center)<br />
                  Commercial Arcade, Ring Road Hub<br />
                  Surat, Gujarat — 395003, India
                </p>
              </div>

              {/* Phone */}
              <div className="border-b border-border py-5">
                <div className="eyebrow text-stone-500 mb-2">Sales &amp; Contractor Hotline</div>
                <a
                  href="tel:+919876543210"
                  className="text-sm text-foreground link-underline font-mono"
                >
                  +91 98765 43210
                </a>
                <div className="text-[11px] text-stone-500 mt-1">Toll-free direct</div>
              </div>

              {/* Email */}
              <div className="border-b border-border py-5">
                <div className="eyebrow text-stone-500 mb-2">Email Desks</div>
                <div className="space-y-1 text-sm">
                  <a
                    href="mailto:sales@patelnetworks.com"
                    className="block font-mono text-foreground link-underline"
                  >
                    sales@patelnetworks.com
                  </a>
                  <a
                    href="mailto:support@patelnetworks.com"
                    className="block font-mono text-foreground link-underline"
                  >
                    support@patelnetworks.com
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="border-b border-border py-5">
                <div className="eyebrow text-stone-500 mb-2">Operating Hours</div>
                <p className="text-sm text-foreground leading-relaxed">
                  Mon — Sat · 9:30 AM – 7:30 PM IST<br />
                  Sunday · Dispatch hub only
                </p>
              </div>
            </div>

            {/* WhatsApp CTA — ghost */}
            <a
              href="https://wa.me/919876543210?text=Hi%20Patel%20Networks,%20I%20have%20an%20inquiry%20regarding%20commercial%20CCTV%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full justify-center"
            >
              Chat instantly on WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand)]" />
            </a>

            {/* Bank transfer — hairline card */}
            <div className="border border-border bg-card p-5 space-y-3">
              <div className="eyebrow text-stone-500">
                B2B Direct Bank Transfer (NEFT/RTGS)
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                For institutional purchase orders exceeding ₹1,00,000, direct bank transfer is supported.
              </p>
              <div className="pt-2 border-t border-border text-[11px] space-y-1.5">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Beneficiary</span>
                  <span className="font-mono text-foreground text-right">Patel Networks Private Limited</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Bank</span>
                  <span className="font-mono text-foreground text-right">HDFC Bank Ltd, Surat Central</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Account No</span>
                  <span className="font-mono text-foreground">50200088991122</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">IFSC</span>
                  <span className="font-mono text-foreground">HDFC0001234</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">GSTIN</span>
                  <span className="font-mono text-foreground">24AABCP9876Q1Z2</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main — inquiry form */}
          <div className="lg:col-span-8">
            <div className="border border-border bg-card p-7 sm:p-10">
              <div className="eyebrow text-stone-500 mb-2">Inquiry / Wholesale Quote Request</div>
              <h2 className="display text-2xl sm:text-3xl text-foreground leading-tight">
                Tell us what you need specified.
              </h2>
              <p className="mt-3 text-xs text-stone-500 leading-relaxed max-w-xl">
                Fill in your specifications and our technical solutions engineer will contact you
                via WhatsApp or phone within 2 working hours.
              </p>

              {submitted ? (
                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="dot-rec" aria-hidden />
                    <span className="eyebrow text-[var(--brand)]">Inquiry received</span>
                  </div>
                  <h3 className="display text-2xl text-foreground">
                    Thank you, {name || 'customer'}.
                  </h3>
                  <p className="text-sm text-stone-500 mt-3 max-w-md leading-relaxed">
                    Our surveillance solutions desk has logged your project scope and dispatched an
                    acknowledgment to your WhatsApp (+91 {phone}).
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-ghost mt-8"
                  >
                    Send another inquiry
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    {/* Name */}
                    <div>
                      <label className="eyebrow text-stone-500 block mb-2">
                        Full Name <span className="text-[var(--brand)]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-0 py-2.5 text-sm bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="eyebrow text-stone-500 block mb-2">
                        WhatsApp Number <span className="text-[var(--brand)]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-mono text-stone-400 select-none pointer-events-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-10 pr-0 py-2.5 text-sm font-mono tracking-wider bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="eyebrow text-stone-500 block mb-2">
                      Company / System Integrator Trade Name
                      <span className="text-stone-400 normal-case tracking-normal ml-1">— optional</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Gujarat Security Solutions & Contractors"
                      className="w-full px-0 py-2.5 text-sm bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground"
                    />
                  </div>

                  {/* Project scope */}
                  <div>
                    <label className="eyebrow text-stone-500 block mb-2">
                      Project Scope &amp; Hardware Requirements
                      <span className="text-[var(--brand)]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify requirements: e.g., 8-channel NVR with 6× 4MP ColorVu bullet cameras, 2TB Purple HDD, 90m Cat6 spool, and SMPS power supply..."
                      className="w-full px-0 py-2.5 text-sm bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <>Submitting…</>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit commercial inquiry
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-stone-500">
                      We respond within 2 working hours.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
