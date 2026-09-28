import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  FileText,
  Truck,
  Search,
  ChevronRight,
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO — split: large headline left, product image right */}
        {/* ============================================================ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left — editorial headline */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                  <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone">
                    Authorized Indian Distributor
                  </span>
                </div>
                <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-serif font-medium leading-[1.02] tracking-tight text-foreground mb-5">
                  Surveillance hardware,<br />
                  <em className="not-italic text-[var(--brand)]">precisely</em> specified.
                </h1>
                <p className="text-base text-stone leading-relaxed max-w-md mb-8">
                  Genuine Hikvision, CP Plus, and Dahua cameras, DVRs, NVRs, hard drives
                  and Cat6 cabling. GST invoicing, pan-India dispatch, manufacturer warranty.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <Link href="/products" className="btn-ink">
                    Browse Catalogue <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/kit-builder" className="text-sm font-medium text-foreground hover:text-[var(--brand)] transition-colors flex items-center gap-1">
                    Build a CCTV kit <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Stats row */}
                <div className="flex gap-8 pt-6 border-t border-border-subtle">
                  <div>
                    <div className="text-2xl font-serif font-medium text-foreground">{brands.length}</div>
                    <div className="text-[11px] text-stone mt-0.5">brands</div>
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-medium text-foreground">{categories.length}</div>
                    <div className="text-[11px] text-stone mt-0.5">categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-medium text-foreground">{featuredProducts.length}+</div>
                    <div className="text-[11px] text-stone mt-0.5">models</div>
                  </div>
                </div>
              </div>
              {/* Right — product image */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] bg-surface-2 overflow-hidden">
                  <Image
                    src="/editorial/product-dome-camera.jpg"
                    alt="CCTV security camera"
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
        {/* CATEGORIES — horizontal scroll cards */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-lg font-serif font-medium text-foreground tracking-tight">Shop by Category</h2>
            <Link href="/products" className="text-xs text-stone hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {curatedCategories.map((cat) => (
              <Link
                key={cat!.id}
                href={`/products?category=${cat!.slug}`}
                className="group flex flex-col items-start p-4 bg-card border border-border-subtle hover:border-border-strong transition-colors"
              >
                <div className="text-sm font-medium text-foreground group-hover:text-[var(--brand)] transition-colors">
                  {cat!.name}
                </div>
                <div className="text-[10px] text-stone mt-1">{cat!._count.products} products</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — spacious grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:pb-16">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-lg font-serif font-medium text-foreground tracking-tight">Featured Products</h2>
              <p className="text-xs text-stone mt-0.5">{featuredProducts.length} models in stock</p>
            </div>
            <Link href="/products" className="text-xs text-stone hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER CTA */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:pb-16">
          <div className="bg-surface-2 border border-border-subtle p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-[var(--brand)] flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-foreground">Build a Custom CCTV Kit</h3>
                <p className="text-xs text-stone mt-1">Pick your DVR, cameras, storage & accessories — bundle discount applied</p>
              </div>
            </div>
            <Link
              href="/kit-builder"
              className="inline-flex items-center gap-2 bg-foreground text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              Start Builder <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRANDS */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-12">
          <h2 className="text-sm font-medium text-stone uppercase tracking-[0.15em] mb-6 text-center">
            Authorized Supply
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="text-lg font-serif font-medium text-stone hover:text-foreground transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
