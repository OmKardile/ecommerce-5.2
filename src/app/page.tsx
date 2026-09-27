import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Wrench,
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
        {/* HERO — clean, product-forward, split layout */}
        {/* ============================================================ */}
        <section className="bg-background border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh] py-12 lg:py-20">
              {/* Text — left */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <Reveal>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="dot-rec" />
                    <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-stone-500">
                      Authorized Indian distributor
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={60}>
                  <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.05] text-foreground tracking-tight max-w-xl">
                    Surveillance hardware,{' '}
                    <span className="text-[var(--brand)]">precisely</span> specified.
                  </h1>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-6 text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg">
                    Certified HD analog cameras, AI AcuSense recorders, 24/7
                    surveillance drives and Cat6 cabling — with verified 18%
                    GST invoicing and immediate pan-India dispatch.
                  </p>
                </Reveal>
                <Reveal delay={180}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link href="/products" className="btn-ink">
                      Browse the catalog
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/kit-builder" className="btn-ghost">
                      <Wrench className="w-4 h-4" />
                      Build a kit
                    </Link>
                  </div>
                </Reveal>
                {/* Trust stats */}
                <Reveal delay={240}>
                  <div className="mt-10 pt-6 border-t border-border grid grid-cols-3 gap-6 max-w-md">
                    <div>
                      <div className="text-2xl font-mono text-foreground">{brands.length}</div>
                      <div className="text-[11px] text-stone-500 mt-1">brands</div>
                    </div>
                    <div>
                      <div className="text-2xl font-mono text-foreground">{categories.length}</div>
                      <div className="text-[11px] text-stone-500 mt-1">categories</div>
                    </div>
                    <div>
                      <div className="text-2xl font-mono text-foreground">{featuredProducts.length}+</div>
                      <div className="text-[11px] text-stone-500 mt-1">models</div>
                    </div>
                  </div>
                </Reveal>
              </div>
              {/* Product image — right */}
              <Reveal delay={100} className="lg:col-span-5 order-1 lg:order-2">
                <div className="relative aspect-square sm:aspect-[4/5] bg-bone overflow-hidden">
                  <Image
                    src="/editorial/product-dome-camera.jpg"
                    alt="Premium dome CCTV security camera"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — clean hairline index */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <Reveal>
              <div>
                <div className="eyebrow text-stone-500 mb-3">01 — Categories</div>
                <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold leading-tight text-foreground tracking-tight max-w-xl">
                  Six disciplines of security hardware.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm text-foreground link-underline"
              >
                View full catalog <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          <div className="border-t border-border">
            {curatedCategories.map((cat, idx) => (
              <Reveal key={cat!.id} delay={idx * 40}>
                <Link
                  href={`/products?category=${cat!.slug}`}
                  className="group grid grid-cols-12 items-center gap-4 py-5 border-b border-border hover:bg-accent/40 transition-colors duration-200 px-2 -mx-2"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-stone-400 group-hover:text-foreground transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="col-span-7 sm:col-span-5 text-base sm:text-lg font-semibold text-foreground group-hover:text-[var(--brand)] transition-colors duration-200 tracking-tight">
                    {cat!.name}
                  </span>
                  <span className="hidden sm:block col-span-5 text-sm text-stone-500">
                    {categoryBlurb(cat!.slug)}
                  </span>
                  <span className="col-span-3 sm:col-span-1 flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — clean grid */}
        {/* ============================================================ */}
        <section className="border-y border-border bg-bone/50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">02 — Featured</div>
                  <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold leading-tight text-foreground tracking-tight max-w-xl">
                    High-demand surveillance models.
                  </h2>
                  <p className="text-sm text-stone-500 mt-2 max-w-md">
                    Genuine stock, SKU-level dispatch from our central warehouse.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <Link href="/products" className="btn-ghost shrink-0">
                  All {featuredProducts.length}+ models <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {featuredProducts.slice(0, 4).map((product, idx) => (
                <Reveal key={product.id} delay={idx * 50} className="bg-background">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DISCIPLINE — image + text */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Reveal>
                <div className="eyebrow text-stone-500 mb-4">The discipline</div>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold leading-tight text-foreground tracking-tight">
                  Hardware chosen by people who install it.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-[1.75] mt-5 max-w-md">
                  Every camera, recorder and drive in our catalog is vetted by
                  engineers who specify and deploy these systems in the field.
                  No rebranded grey market, no mystery SKUs — only serial-tracked,
                  manufacturer-warranted hardware from the brands Indian
                  installers already trust.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <Link href="/about" className="inline-flex items-center gap-1.5 mt-6 text-sm text-foreground link-underline">
                  Read the sourcing standard <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={80} className="lg:col-span-7 order-1 lg:order-2">
              <div className="media-frame relative aspect-[4/3] bg-bone">
                <Image
                  src="/editorial/product-bullet-camera.jpg"
                  alt="Premium bullet CCTV security camera"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-bone/50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <Reveal className="lg:col-span-6 order-1">
                <div className="media-frame relative aspect-[4/3] bg-background border border-border">
                  <Image
                    src="/editorial/product-nvr-recorder.jpg"
                    alt="16-channel NVR network video recorder"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="lg:col-span-6 space-y-5 order-2">
                <Reveal>
                  <div className="eyebrow text-stone-500">03 — Configuration tool</div>
                </Reveal>
                <Reveal delay={60}>
                  <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.05] text-foreground tracking-tight">
                    Don&apos;t know which parts fit together?
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg">
                    Assemble your surveillance package step by step — pick DVR channel
                    capacity, mix dome & bullet cameras, calculate required recording days,
                    and receive an automatic bundle discount.
                  </p>
                </Reveal>

                <Reveal delay={160}>
                  <ol className="grid grid-cols-2 gap-x-6 gap-y-4 pt-5 border-t border-border">
                    {[
                      ['Recorder', '4, 8 or 16 channel DVR/NVR'],
                      ['Cameras', 'Dome & bullet, 2MP to 8MP'],
                      ['Storage', 'Recording-day calculator'],
                      ['Accessories', 'Cable, SMPS, connectors'],
                    ].map(([step, desc], i) => (
                      <li key={step} className="pt-3">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-mono text-[10px] text-stone-400">0{i + 1}</span>
                          <span className="text-sm font-medium text-foreground">{step}</span>
                        </div>
                        <div className="text-[13px] text-stone-500">{desc}</div>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={200}>
                  <Link href="/kit-builder" className="btn-ink">
                    <Wrench className="w-4 h-4" />
                    Start the kit builder
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRANDS — static grid */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <div className="eyebrow text-stone-500 mb-8 text-center">
              Authorized supply — premier security & networking brands
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border border border-border">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className="group flex items-center justify-center py-8 px-4 bg-background hover:bg-accent/40 transition-colors"
                >
                  <span className="text-base font-semibold text-foreground group-hover:text-[var(--brand)] transition-colors tracking-tight">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function categoryBlurb(slug: string): string {
  const map: Record<string, string> = {
    'hd-analog-cameras': '2MP to 16MP bullet & dome',
    'network-ip-cameras': 'PoE AI smart surveillance',
    'recorders-dvr-nvr': '4, 8 & 16 channel with AI',
    'surveillance-storage': '1TB to 8TB Seagate & WD',
    'cables-wiring': 'Cat6 305m drums & 3+1 HD',
    'power-accessories': 'SMPS & BNC connectors',
  };
  return map[slug] ?? 'Curated surveillance hardware';
}
