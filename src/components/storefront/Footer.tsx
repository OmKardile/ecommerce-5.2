import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-strong bg-background">
      {/* Trust strip — solid surface panel for visible weight */}
      <div className="border-b border-border-strong bg-surface-2">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {[
            { k: 'Genuine brands', v: 'Serial-tracked, manufacturer warranty on CP Plus, Hikvision & Dahua.' },
            { k: 'Pan-India dispatch', v: 'AWB via Shiprocket & Delhivery, SMS + WhatsApp tracking.' },
            { k: 'GST invoicing', v: 'Enter your GSTIN at checkout for 18% input tax credit.' },
            { k: 'Technical desk', v: 'Advice on DVR channels, lens FOV and PoE topologies.' },
          ].map((item) => (
            <div key={item.k}>
              <div className="eyebrow text-stone-500 mb-2">{item.k}</div>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-[28ch]">
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main links */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="display text-[28px] leading-none text-foreground">
                Patel<span className="text-[var(--brand)]">.</span>Networks
              </span>
              <span className="eyebrow text-stone-500">Mega-Tech</span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm">
              India&apos;s specialized procurement platform for commercial security,
              CCTV cameras, fiber converters, surveillance hard drives and enterprise
              networking hardware.
            </p>
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex items-baseline gap-3">
                <span className="eyebrow text-stone-400 w-16">Address</span>
                <span className="text-foreground">Security Hub, Commercial Arcade, Gujarat, India</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="eyebrow text-stone-400 w-16">Phone</span>
                <a href="tel:+919876543210" className="text-foreground link-underline">+91 98765 43210</a>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="eyebrow text-stone-400 w-16">Email</span>
                <a href="mailto:sales@patelnetworks.com" className="text-foreground link-underline">sales@patelnetworks.com</a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-2">
            <div className="eyebrow text-stone-500 mb-4 font-bold">Categories</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products?category=hd-analog-cameras" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">HD Analog Cameras</Link></li>
              <li><Link href="/products?category=network-ip-cameras" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Network IP Cameras</Link></li>
              <li><Link href="/products?category=recorders-dvr-nvr" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">DVR & NVR Recorders</Link></li>
              <li><Link href="/products?category=cables-wiring" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">CCTV & Cat6 Cables</Link></li>
              <li><Link href="/products?category=surveillance-storage" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Surveillance Hard Drives</Link></li>
              <li><Link href="/products?category=power-accessories" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">SMPS Power Supplies</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="eyebrow text-stone-500 mb-4 font-bold">Brands</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products?brand=cp-plus" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">CP Plus</Link></li>
              <li><Link href="/products?brand=hikvision" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Hikvision</Link></li>
              <li><Link href="/products?brand=dahua" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Dahua</Link></li>
              <li><Link href="/products?brand=d-link" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">D-Link</Link></li>
              <li><Link href="/products?brand=optilink" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Optilink</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow text-stone-500 mb-4 font-bold">Customer & Tools</div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/kit-builder" className="text-foreground hover:text-[var(--brand)] transition-colors flex items-center gap-1.5">
                  CCTV Kit Builder <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li><Link href="/account" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Track Your Order</Link></li>
              <li><Link href="/about" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">About Patel Networks</Link></li>
              <li><Link href="/contact" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Contact & Wholesale Desk</Link></li>
              <li><Link href="/faq" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">CCTV & GST FAQs</Link></li>
              <li><Link href="/shipping-policy" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Warranty & Returns</Link></li>
              <li><Link href="/privacy-policy" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-stone-600 dark:text-stone-400 hover:text-foreground link-underline transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-14 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Patel Networks. Registered Indian enterprise.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span>Razorpay SSL · 256-bit</span>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span>Shiprocket & Delhivery Express</span>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <Link href="/admin" className="hover:text-foreground link-underline transition-colors">
              Operations Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
