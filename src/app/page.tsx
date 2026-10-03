import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  Truck,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
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

  const firstRow = featuredProducts.slice(0, 4);
  const secondRow = featuredProducts.slice(4, 8);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO — FROZEN (do not change) */}
        {/* ============================================================ */}
        <section className="relative h-[90vh] min-h-[600px] flex items-end justify-center overflow-hidden bg-[#1A1A1A]">
          <Image
            src="/editorial/hero-camera-dark.jpg"
            alt="Premium CCTV security camera"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="relative z-10 text-center text-white px-6 pb-16 lg:pb-24 max-w-3xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BAAC4]" />
              <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-white/70">
                Authorized Indian Distributor
              </span>
            </div>
            <h1
              className="text-[clamp(2rem,6vw,4rem)] font-medium leading-[1.05] tracking-tight mb-4"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              See everything.<br />Miss nothing.
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto mb-8">
              Genuine Hikvision, CP Plus, and Dahua surveillance hardware.
              GST invoicing, pan-India dispatch, manufacturer warranty.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TRUST BAR — Zara-style: thin, elegant, minimal */}
        {/* ============================================================ */}
        <section className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {[
                { icon: ShieldCheck, label: '100% Genuine' },
                { icon: FileText, label: '18% GST ITC' },
                { icon: Truck, label: 'Pan-India Dispatch' },
                { icon: ShieldCheck, label: 'Manufacturer Warranty' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-stone-soft" strokeWidth={1.5} />
                  <span className="text-[11px] tracking-[0.05em] text-stone">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — Zara-style editorial index (not tiles) */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
          <div className="mb-10">
            <h2
              className="text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-tight text-foreground"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Categories
            </h2>
          </div>
          <div className="border-t border-border">
            {curatedCategories.map((cat, idx) => (
              <Link
                key={cat!.id}
                href={`/products?category=${cat!.slug}`}
                className="group flex items-center justify-between py-5 border-b border-border hover:bg-surface-2 transition-colors px-2 -mx-2"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-stone-soft">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-lg lg:text-xl font-medium text-foreground group-hover:text-[var(--brand)] transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {cat!.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-stone hidden sm:block">{cat!._count.products} products</span>
                  <ArrowUpRight className="w-4 h-4 text-stone-soft group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — Zara-style clean grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-8 lg:pb-12">
          <div className="flex items-baseline justify-between mb-8">
            <h2
              className="text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-tight text-foreground"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Featured
            </h2>
            <Link
              href="/products"
              className="text-xs text-stone hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {firstRow.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER — Zara-style split editorial */}
        {/* ============================================================ */}
        <section className="border-y border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image side */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px] bg-surface-2 overflow-hidden">
              <Image
                src="/editorial/hero-camera-light.jpg"
                alt="Build a CCTV kit"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Text side */}
            <div className="flex items-center px-8 lg:px-16 py-12 lg:py-0">
              <div className="max-w-md">
                <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone mb-4 block">
                  Configuration Tool
                </span>
                <h2
                  className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-medium tracking-tight text-foreground mb-4"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Build a Custom CCTV Kit
                </h2>
                <p className="text-sm text-stone leading-relaxed mb-8">
                  Select your DVR, cameras, storage and accessories in 5 steps.
                  Automatic bundle discount applied at checkout.
                </p>
                <Link
                  href="/kit-builder"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground border-b border-foreground pb-1 hover:text-[var(--brand)] hover:border-[var(--brand)] transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  Start Builder
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MORE PRODUCTS */}
        {/* ============================================================ */}
        {secondRow.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {secondRow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* BRANDS — Zara-style: minimal text, no boxes */}
        {/* ============================================================ */}
        <section className="border-t border-border py-16 lg:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone">
                Authorized Supply
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:gap-x-12">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className="text-base lg:text-lg font-medium text-stone hover:text-foreground transition-colors"
                  style={{ fontFamily: 'Georgia, serif' }}
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
