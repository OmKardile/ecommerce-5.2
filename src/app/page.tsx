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
import { CinematicHero } from '@/components/storefront/CinematicHero';
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
        {/* CINEMATIC HERO — VFX, parallax, immersive */}
        {/* ============================================================ */}
        <CinematicHero />

        {/* ============================================================ */}
        {/* CATEGORIES — clean hairline index, sans-serif */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <Reveal>
              <div>
                <div className="eyebrow text-stone-500 mb-3">01 — Categories</div>
                <h2 className="text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-foreground tracking-tight max-w-xl">
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
                  className="group grid grid-cols-12 items-center gap-4 py-6 border-b border-border hover:bg-accent/40 transition-colors duration-200 px-2 -mx-2"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-stone-400 group-hover:text-foreground transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="col-span-7 sm:col-span-5 text-lg sm:text-xl font-semibold text-foreground group-hover:text-[var(--brand)] transition-colors duration-200 tracking-tight">
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
        {/* FEATURED PRODUCTS — product-forward grid on white */}
        {/* ============================================================ */}
        <section className="border-y border-border bg-bone/40">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">02 — Featured</div>
                  <h2 className="text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-foreground tracking-tight max-w-xl">
                    High-demand surveillance models.
                  </h2>
                  <p className="text-sm text-stone-500 mt-3 max-w-md">
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
        {/* DISCIPLINE — image + text, bright, product photo */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Reveal>
                <div className="eyebrow text-stone-500 mb-5">The discipline</div>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-foreground tracking-tight">
                  Hardware chosen by people who install it.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-[1.75] mt-6 max-w-md">
                  Every camera, recorder and drive in our catalog is vetted by
                  engineers who specify and deploy these systems in the field.
                  No rebranded grey market, no mystery SKUs — only serial-tracked,
                  manufacturer-warranted hardware from the brands Indian
                  installers already trust.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <Link href="/about" className="inline-flex items-center gap-1.5 mt-8 text-sm text-foreground link-underline">
                  Read the sourcing standard <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={80} className="lg:col-span-7 order-1 lg:order-2">
              <div className="media-frame relative aspect-[4/3] bg-bone">
                <Image
                  src="/editorial/product-bullet-camera.jpg"
                  alt="Premium bullet CCTV security camera — studio product photography"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER — bright, product image, clean */}
        {/* ============================================================ */}
        <section className="border-t border-border bg-bone/40">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <Reveal className="lg:col-span-6 order-1">
                <div className="media-frame relative aspect-[4/3] bg-background">
                  <Image
                    src="/editorial/product-nvr-recorder.jpg"
                    alt="16-channel NVR network video recorder — studio product photography"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="lg:col-span-6 space-y-7 order-2">
                <Reveal>
                  <div className="eyebrow text-stone-500">03 — Configuration tool</div>
                </Reveal>
                <Reveal delay={60}>
                  <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.05] text-foreground tracking-tight">
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
                  <ol className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-border">
                    {[
                      ['Recorder', '4, 8 or 16 channel DVR/NVR'],
                      ['Cameras', 'Dome & bullet, 2MP to 8MP'],
                      ['Storage', 'Recording-day calculator'],
                      ['Accessories', 'Cable, SMPS, connectors'],
                    ].map(([step, desc], i) => (
                      <li key={step} className="pt-4">
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
        {/* BRANDS — static, well-spaced, not scrolling */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
          <Reveal>
            <div className="eyebrow text-stone-500 mb-10 text-center">
              Authorized supply — premier security & networking brands
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border border border-border">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  className="group flex items-center justify-center py-10 px-4 bg-background hover:bg-accent/40 transition-colors"
                >
                  <span className="text-lg font-semibold text-foreground group-hover:text-[var(--brand)] transition-colors tracking-tight">
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
