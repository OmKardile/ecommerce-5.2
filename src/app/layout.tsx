import type { Metadata, Viewport } from 'next';
import { Geist, Fraunces } from 'next/font/google';
import './globals.css';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';
import { ThemeProvider } from '@/components/storefront/ThemeProvider';

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground">
        <ThemeProvider>
          {children}
          <WhatsAppSupportWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
