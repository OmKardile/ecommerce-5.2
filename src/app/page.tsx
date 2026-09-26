import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Truck,
  FileText,
  BadgeCheck,
  Video,
  HardDrive,
  Cpu,
  Layers,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Badge } from '@/components/ui/Badge';
import {
  getFeaturedProducts,
  getCategories,
  getPopularBrands,
} from '@/server/services/catalog.service';

export const revalidate = 60; // ISR cache every 60 seconds

export default async function HomePage() {
  const [featuredProducts, categories, brands] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getPopularBrands(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-20 lg:py-28 border-b border-slate-800">
          {/* Subtle Grid texture */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Accent glow orb */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold">Authorized Indian Distributor</span>
                <span>•</span>
                <span>CP Plus • Hikvision • Dahua</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Commercial CCTV & Surveillance Systems for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                  Total Security.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Procure certified HD analog cameras, AI AcuSense network recorders, 24/7 surveillance hard drives, and Cat6 cabling. Every order includes verified 18% GST tax invoices with immediate Indian logistics dispatch.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/products"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  Explore CCTV Catalog <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/kit-builder"
                  className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Wrench className="w-4 h-4 text-sky-400" />
                  Custom CCTV Kit Builder
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Genuine Serials</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>18% GST Input Credit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Express Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>On-Site Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MAIN CATEGORIES TILES */}
        {/* ============================================================ */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="tech" className="mb-2 uppercase text-[10px]">
                Product Categories
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Surveillance & Networking Hardware
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              View Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: 'HD Analog Cameras',
                desc: '2MP to 16MP Bullet & Dome',
                icon: Video,
                slug: 'hd-analog-cameras',
                color: 'from-blue-500/10 to-sky-500/10 text-sky-600 dark:text-sky-400',
              },
              {
                name: 'Network IP Cameras',
                desc: 'PoE AI Smart Surveillance',
                icon: Cpu,
                slug: 'network-ip-cameras',
                color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
              },
              {
                name: 'DVR & NVR Recorders',
                desc: '4, 8 & 16 Channels with AI',
                icon: Layers,
                slug: 'recorders-dvr-nvr',
                color: 'from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400',
              },
              {
                name: 'Surveillance HDDs',
                desc: '1TB to 8TB Seagate & WD',
                icon: HardDrive,
                slug: 'surveillance-storage',
                color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
              },
              {
                name: 'Cables & Wiring',
                desc: 'Cat6 305m Drums & 3+1 HD',
                icon: Layers,
                slug: 'cables-wiring',
                color: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400',
              },
              {
                name: 'Power & Accessories',
                desc: 'SMPS & BNC Connectors',
                icon: Shield,
                slug: 'power-accessories',
                color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400',
              },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-sky-500/50 transition-all text-center items-center"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <cat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS FROM SUPABASE */}
        {/* ============================================================ */}
        <section className="py-14 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <Badge variant="tech" className="mb-2 uppercase text-[10px]">
                  Featured Systems
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  High-Demand Surveillance Models
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Genuine stock available with immediate SKU-level dispatch from our central warehouse.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors shadow-xs"
              >
                View All {featuredProducts.length}+ Models <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INTERACTIVE CCTV KIT BUILDER PROMO BANNER */}
        {/* ============================================================ */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-xs font-semibold text-sky-400">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Configuration Tool
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Don&apos;t know which parts fit together?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                  Build a Custom CCTV Kit.
                </span>
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Assemble your exact surveillance package step-by-step: Pick your DVR channel size, mix and match dome & bullet cameras, calculate required hard drive recording days, and get an automatic bundle discount.
              </p>

              <div className="pt-2">
                <Link
                  href="/kit-builder"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105"
                >
                  <Wrench className="w-4 h-4" /> Start CCTV Kit Builder Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* AUTHORIZED BRANDS */}
        {/* ============================================================ */}
        <section className="py-12 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-6">
              Authorized Supply For Premier Security & Networking Brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-2xs"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
