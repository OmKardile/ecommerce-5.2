import type { Metadata, Viewport } from 'next';
import { Geist, Fraunces } from 'next/font/google';
import './globals.css';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Patel Networks — Commercial CCTV, Surveillance & Networking Hardware',
  description:
    'Authorized Indian supplier for CP Plus, Hikvision, Dahua and D-Link surveillance cameras, AI DVRs, 24/7 hard drives and networking hardware with B2B GST tax invoicing.',
};

// Next.js 16: viewport MUST be a separate export (not inside metadata).
// Without this, Next.js generates a default __next_viewport_boundary__
// that crashes with useContext:null during /_global-error prerender
// on Turbopack production builds (e.g., Render).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground">
        {children}
        <WhatsAppSupportWidget />
      </body>
    </html>
  );
}
