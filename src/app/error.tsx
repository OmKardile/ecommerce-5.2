'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled platform error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 lg:px-10 py-20">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-8">
          <span className="dot-rec" />
        </div>

        <div className="eyebrow text-stone-500 mb-4">System alert</div>

        <h1 className="display text-2xl sm:text-3xl text-foreground mb-4">
          Temporary system interruption.
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
          An unexpected error occurred while communicating with our servers.
          Your session and cart data remain safe.
        </p>

        {error.digest && (
          <p className="mt-6 text-[11px] font-mono text-stone-400 border border-border inline-block px-3 py-1.5">
            Error digest: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-2 justify-center">
          <button onClick={() => reset()} className="btn-ink">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <Link href="/" className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Return home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-xs text-stone-500">
          <a
            href="https://wa.me/919876543210?text=Hello%20Patel%20Networks,%20I%20encountered%20an%20error%20on%20the%20platform."
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground link-underline"
          >
            Contact emergency support via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
