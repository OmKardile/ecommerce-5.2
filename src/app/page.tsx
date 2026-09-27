import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wrench,
  Truck,
  ShieldCheck,
  FileText,
  Search,
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
        {/* HERO BANNER — product image + strong headline + search CTA */}
        {/* ============================================================ */}
        <section className="bg-gradient-to-r from-[var(--brand)] to-indigo-700 text-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Distributor — CP Plus · Hikvision · Dahua
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                  Commercial CCTV & Surveillance Hardware
                </h1>
                <p className="text-base text-white/80 max-w-xl mb-6">
                  Genuine cameras, DVRs, NVRs, hard drives and Cat6 cabling.
                  GST invoicing, pan-India dispatch, manufacturer warranty.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white text-[var(--brand)] px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    Browse Products
                  </Link>
                  <Link
                    href="/kit-builder"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors active:scale-95"
                  >
                    <Wrench className="w-4 h-4" />
                    Build a Kit
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-4 hidden lg:block">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/10">
                  <Image
                    src="/editorial/product-dome-camera.jpg"
                    alt="CCTV security camera"
                    fill
                    priority
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TRUST BAR */}
        {/* ============================================================ */}
        <section className="bg-surface-2 border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: ShieldCheck, label: '100% Genuine', sub: 'Serial-tracked' },
                { icon: FileText, label: '18% GST ITC', sub: 'B2B invoicing' },
                { icon: Truck, label: 'Pan-India', sub: 'Express dispatch' },
                { icon: ShieldCheck, label: 'Warranty', sub: 'Manufacturer-backed' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <item.icon className="w-5 h-5 text-[var(--brand)] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-foreground">{item.label}</div>
                    <div className="text-[10px] text-stone-500">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — quick access grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {curatedCategories.map((cat) => (
              <Link
                key={cat!.id}
                href={`/products?category=${cat!.slug}`}
                className="group flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:border-[var(--brand)] hover:shadow-md transition-all text-center"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-[var(--brand)] transition-colors">
                  {cat!.name}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">{cat!._count.products} items</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — main shopping grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Featured Products</h2>
              <p className="text-xs text-stone-500 mt-0.5">{featuredProducts.length} models in stock</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand)] hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER CTA */}
        {/* ============================================================ */}
        <section className="bg-surface-2 border-y border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand)] flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Build a Custom CCTV Kit</h3>
                  <p className="text-xs text-stone-500">Pick your DVR, cameras, storage & accessories — automatic bundle discount</p>
                </div>
              </div>
              <Link
                href="/kit-builder"
                className="inline-flex items-center gap-2 bg-[var(--brand)] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[var(--brand-soft)] transition-colors active:scale-95 shrink-0"
              >
                Start Builder <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRANDS */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-4 text-center">Shop by Brand</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="group flex items-center justify-center py-5 px-4 bg-card border border-border rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all"
              >
                <span className="text-sm font-bold text-foreground group-hover:text-[var(--brand)] transition-colors">
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
