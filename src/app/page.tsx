import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  Truck,
  FileText,
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

  // Split products for the two rows
  const firstRow = featuredProducts.slice(0, 4);
  const secondRow = featuredProducts.slice(4, 8);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO — Apple-style: full-bleed image, centered text overlay */}
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
          {/* Gradient overlay for text legibility */}
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
        {/* TRUST BAR — Nike-style minimal strip */}
        {/* ============================================================ */}
        <section className="bg-[#1A1A1A] text-white py-6 border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: '100% Genuine', sub: 'Serial-tracked' },
              { icon: FileText, label: '18% GST ITC', sub: 'B2B invoicing' },
              { icon: Truck, label: 'Pan-India', sub: 'Express dispatch' },
              { icon: ShieldCheck, label: 'Warranty', sub: 'Manufacturer-backed' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-[#8BAAC4] shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-white/40">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — Apple Store tile grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <h2
            className="text-xl lg:text-2xl font-medium tracking-tight mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {curatedCategories.map((cat) => (
              <Link
                key={cat!.id}
                href={`/products?category=${cat!.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-sm font-bold text-foreground group-hover:text-[var(--brand)] transition-colors">
                  {cat!.name}
                </div>
                <div className="text-[10px] text-stone mt-1">{cat!._count.products} products</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — Allbirds/Nike product-first grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-8 lg:pb-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2
              className="text-xl lg:text-2xl font-medium tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Featured Products
            </h2>
            <Link href="/products" className="text-xs text-stone hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {firstRow.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER — Apple-style full-bleed banner */}
        {/* ============================================================ */}
        <section className="relative h-[400px] lg:h-[500px] overflow-hidden bg-[#1A1A1A] my-8 lg:my-12">
          <Image
            src="/editorial/hero-camera-light.jpg"
            alt="Build a CCTV kit"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="relative z-10 h-full flex items-center px-6 lg:px-16">
            <div className="max-w-lg text-white">
              <h2
                className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium tracking-tight mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Build a Custom CCTV Kit
              </h2>
              <p className="text-sm text-white/60 mb-6 max-w-md">
                Pick your DVR, cameras, storage & accessories in 5 steps.
                Automatic bundle discount applied.
              </p>
              <Link
                href="/kit-builder"
                className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Start Builder
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MORE PRODUCTS — second row */}
        {/* ============================================================ */}
        {secondRow.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:pb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {secondRow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* BRANDS — Nike-style horizontal wordmark strip */}
        {/* ============================================================ */}
        <section className="bg-card border-y border-border py-12 lg:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2
              className="text-sm font-medium text-stone uppercase tracking-[0.15em] mb-8 text-center"
            >
              Shop by Brand
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className="text-lg lg:text-xl font-medium text-stone hover:text-foreground transition-colors"
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
