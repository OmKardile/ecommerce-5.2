'use client';

import React, { useEffect } from 'react';

// global-error.tsx — the last-resort error boundary in Next.js 16.
// It renders OUTSIDE the root layout, so it MUST provide its own
// <html> and <body> tags. Keep this minimal — no fonts, no context,
// no imported components that use React context (prevents the
// "Cannot read properties of null (reading 'useContext')" error
// during static prerendering on some build environments).

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: '#F6F3ED',
          color: '#131210',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: '#1E40AF',
              margin: '0 auto 2rem',
            }}
          />
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6B665B',
              marginBottom: '1rem',
            }}
          >
            System alert
          </p>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              margin: '0 0 1rem',
            }}
          >
            Something went wrong.
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B665B', lineHeight: 1.6 }}>
            An unexpected error occurred. Your session and cart data remain safe.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: '1.5rem',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#948F83',
                border: '1px solid #DCD6C8',
                display: 'inline-block',
                padding: '0.375rem 0.75rem',
              }}
            >
              {error.digest}
            </p>
          )}
          <div style={{ marginTop: '2.5rem' }}>
            <button
              onClick={() => reset()}
              style={{
                background: '#131210',
                color: '#F6F3ED',
                border: 'none',
                padding: '0.875rem 1.5rem',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
