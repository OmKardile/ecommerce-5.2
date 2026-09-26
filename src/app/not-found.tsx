import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: '404 — Page Not Found | Patel Networks',
  description: 'The requested page or surveillance feed could not be located on Patel Networks servers.',
};

// Self-contained 404 page — does NOT import the Header/Footer client
// components. The Header calls server actions (getCartAction,
// getCurrentUserAction) which need a request context; during the
// /_global-error static prerender there's no request, so those calls
// crash with "Cannot read properties of null (reading 'useContext')".
// Keeping this page static-only resolves that.
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Minimal top bar (no client-side cart/user fetches) */}
      <header className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[68px] flex items-center">
          <Link href="/" className="display text-[22px] leading-none text-foreground">
            Patel<span className="text-[var(--brand)]">.</span>Networks
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-10 py-20 sm:py-32">
        <div className="max-w-xl w-full text-center">
          {/* dot-rec flourish */}
          <div className="flex items-center justify-center mb-8">
            <span className="dot-rec" />
          </div>

          {/* Large editorial 404 */}
          <div className="display text-[clamp(5rem,18vw,9rem)] leading-none text-foreground mb-6">
            404
          </div>

          <div className="eyebrow text-stone-500 mb-4">Signal not found</div>

          <h1 className="display text-2xl sm:text-3xl text-foreground mb-4">
            The page you&apos;re looking for has moved or never existed.
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            The hardware model, category, or order document may have been moved,
            decommissioned, or the URL may be incorrect.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/" className="btn-ink">
              <ArrowLeft className="w-4 h-4" /> Return home
            </Link>
            <Link href="/products" className="btn-ghost">
              Browse catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Digest + support */}
          <div className="mt-12 pt-8 border-t border-border text-xs text-stone-500 space-y-2">
            <p>Need help locating a model or dispatch?</p>
            <a
              href="https://wa.me/919876543210?text=Hello%20Patel%20Networks,%20I%20hit%20a%20404%20error%20and%20need%20help."
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground link-underline"
            >
              Contact commercial support on WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* Minimal footer (no client-side logic) */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 text-xs text-stone-500 flex justify-between">
          <span>© {new Date().getFullYear()} Patel Networks</span>
          <Link href="/products" className="link-underline">Browse catalog</Link>
        </div>
      </footer>
    </div>
  );
}
