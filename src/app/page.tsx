import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  FileText,
  Truck,
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
        {/* HERO — editorial, spacious, asymmetric */}
        {/* ============================================================ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
              {/* Left — large editorial headline */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />
                  <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone">
                    Authorized Indian Distributor
                  </span>
                </div>
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-serif font-medium leading-[1.02] tracking-tight text-foreground mb-6">
                  Surveillance hardware,<br />
                  <em className="not-italic text-[var(--brand)]">precisely</em> specified.
                </h1>
                <p className="text-base text-stone leading-relaxed max-w-md mb-8">
                  Certified HD analog cameras, AI AcuSense recorders, 24/7
                  surveillance drives and Cat6 cabling — with verified 18%
                  GST invoicing and immediate pan-India dispatch.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/products" className="btn-ink">
                    Browse Catalogue <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/kit-builder" className="text-sm font-medium text-foreground hover:text-[var(--brand)] transition-colors">
                    Build a CCTV kit →
                  </Link>
                </div>
              </div>
              {/* Right — product image, asymmetric */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[3/4] bg-surface-2 overflow-hidden">
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
        {/* TRUST STRIP — minimal, architectural */}
        {/* ============================================================ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: ShieldCheck, label: '100% Genuine', sub: 'Serial-tracked warranty' },
                { icon: FileText, label: '18% GST ITC', sub: 'B2B tax invoicing' },
                { icon: Truck, label: 'Pan-India', sub: 'Express dispatch' },
                { icon: ShieldCheck, label: 'On-site', sub: 'Manufacturer RMA' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[var(--brand)] shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-[11px] text-stone">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — editorial index */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">Categories</h2>
            <Link href="/products" className="text-sm text-stone hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border-subtle">
            {curatedCategories.map((cat) => (
              <Link
                key={cat!.id}
                href={`/products?category=${cat!.slug}`}
                className="group bg-card p-5 hover:bg-surface-2 transition-colors text-center"
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
        {/* FEATURED PRODUCTS — spacious catalogue */}
        {/* ============================================================ */}
        <section className="border-t border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">Featured Products</h2>
                <p className="text-sm text-stone mt-1">{featuredProducts.length} models in stock</p>
              </div>
              <Link href="/products" className="text-sm text-stone hover:text-foreground transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER — editorial CTA */}
        {/* ============================================================ */}
        <section className="bg-surface-2 border-y border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone mb-4 block">
                  Configuration Tool
                </span>
                <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight mb-4">
                  Don't know which parts fit together?
                </h2>
                <p className="text-sm text-stone leading-relaxed max-w-md mb-6">
                  Build a complete surveillance package step by step — pick DVR channel
                  capacity, mix dome and bullet cameras, calculate required recording days,
                  and receive an automatic bundle discount.
                </p>
                <Link href="/kit-builder" className="btn-ink">
                  <Wrench className="w-4 h-4" />
                  Start the kit builder
                </Link>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] bg-card border border-border-subtle overflow-hidden">
                  <Image
                    src="/editorial/product-nvr-recorder.jpg"
                    alt="NVR recorder"
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
        {/* BRANDS — editorial wordmark index */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <h2 className="text-sm font-medium text-stone uppercase tracking-[0.15em] mb-8 text-center">
            Authorized Supply
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
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
