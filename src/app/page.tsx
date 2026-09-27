import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Wrench,
  Truck,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Reveal } from '@/components/storefront/Reveal';
import {
  getFeaturedProducts,
  getCategories,
  getPopularBrands,
} from '@/server/services/catalog.service';

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, categories, brands] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getPopularBrands(),
  ]);

  const categoryOrder = [
    'hd-analog-cameras',
    'network-ip-cameras',
    'recorders-dvr-nvr',
    'surveillance-storage',
    'cables-wiring',
    'power-accessories',
  ];
  const curatedCategories = categoryOrder
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO — product-forward with search CTA */}
        {/* ============================================================ */}
        <section className="bg-surface-2 border-b border-border-strong">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left — headline + CTAs */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="dot-rec" />
                  <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-[var(--brand)]">
                    Authorized Indian Distributor
                  </span>
                </div>
                <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.1] text-foreground tracking-tight mb-4">
                  Commercial CCTV & Surveillance Hardware
                </h1>
                <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl mb-6">
                  Genuine Hikvision, CP Plus, Dahua cameras, DVRs, NVRs, hard drives
                  and Cat6 cabling. GST invoicing, pan-India dispatch, manufacturer warranty.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Link href="/products" className="btn-ink">
                    Browse Products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/kit-builder" className="btn-ghost">
                    <Wrench className="w-4 h-4" />
                    Build a Kit
                  </Link>
                </div>
                {/* Trust badges */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--brand)]" /> 100% Genuine
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[var(--brand)]" /> 18% GST ITC
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[var(--brand)]" /> Pan-India Dispatch
                  </span>
                </div>
              </div>
              {/* Right — hero product image */}
              <div className="lg:col-span-5">
                <div className="relative aspect-square bg-card border border-border-strong overflow-hidden">
                  <Image
                    src="/editorial/product-dome-camera.jpg"
                    alt="Premium dome CCTV security camera"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — quick-access tiles */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {curatedCategories.map((cat, idx) => (
              <Reveal key={cat!.id} delay={idx * 30}>
                <Link
                  href={`/products?category=${cat!.slug}`}
                  className="group flex flex-col items-center justify-center p-4 bg-card border border-border hover:border-[var(--brand)] transition-colors text-center"
                >
                  <span className="text-sm font-bold text-foreground group-hover:text-[var(--brand)] transition-colors">
                    {cat!.name}
                  </span>
                  <span className="text-[10px] text-stone-500 mt-1">{cat!._count.products} products</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — the main shopping section */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Featured Products
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {featuredProducts.length} genuine models in stock · SKU-level dispatch
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] hover:underline"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER CTA */}
        {/* ============================================================ */}
        <section className="bg-surface-2 border-y border-border-strong">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="text-[11px] tracking-[0.2em] uppercase font-bold text-[var(--brand)] mb-3">
                  Configuration Tool
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight mb-4">
                  Don&apos;t know which parts fit together?
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg mb-5">
                  Build a complete CCTV surveillance kit step-by-step: choose your DVR/NVR,
                  select cameras, calculate storage, add cables and power supplies.
                  Automatic bundle discount applied.
                </p>
                <Link href="/kit-builder" className="btn-ink">
                  <Wrench className="w-4 h-4" />
                  Start Kit Builder
                </Link>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] bg-card border border-border-strong overflow-hidden">
                  <Image
                    src="/editorial/product-nvr-recorder.jpg"
                    alt="NVR recorder for CCTV kit builder"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRANDS */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight mb-6 text-center">
            Authorized Brands
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="group flex items-center justify-center py-6 px-4 bg-card border border-border hover:border-[var(--brand)] transition-colors"
              >
                <span className="text-base font-bold text-foreground group-hover:text-[var(--brand)] transition-colors">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
