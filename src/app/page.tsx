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
import { ParallaxSection } from '@/components/storefront/ParallaxSection';
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
        {/* CATEGORIES — dark cinematic index over parallax DVR rack */}
        {/* ============================================================ */}
        <ParallaxSection
          imageSrc="/cinematic/dvr-rack.jpg"
          imageAlt="Server rack with NVR DVR units, glowing blue LED status lights"
          speed={0.15}
          overlay="darker"
          className="text-white"
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-28 lg:py-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <Reveal>
                <div>
                  <div className="eyebrow text-white/40 mb-3">01 — Categories</div>
                  <h2 className="text-[clamp(1.9rem,5vw,3.5rem)] font-semibold leading-[1.05] text-white tracking-tight max-w-xl">
                    Six disciplines of security hardware.
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white link-underline"
                >
                  View full catalog <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>

            <div className="border-t border-white/10">
              {curatedCategories.map((cat, idx) => (
                <Reveal key={cat!.id} delay={idx * 50}>
                  <Link
                    href={`/products?category=${cat!.slug}`}
                    className="group grid grid-cols-12 items-center gap-4 py-8 border-b border-white/10 hover:bg-white/5 transition-colors duration-200 px-2 -mx-2"
                  >
                    <span className="col-span-2 sm:col-span-1 font-mono text-xs text-white/30 group-hover:text-[var(--brand-soft)] transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="col-span-7 sm:col-span-5 text-xl sm:text-2xl font-semibold text-white group-hover:text-[var(--brand-soft)] transition-colors duration-200 tracking-tight">
                      {cat!.name}
                    </span>
                    <span className="hidden sm:block col-span-5 text-sm text-white/50">
                      {categoryBlurb(cat!.slug)}
                    </span>
                    <span className="col-span-3 sm:col-span-1 flex justify-end">
                      <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </ParallaxSection>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — dark cinematic grid */}
        {/* ============================================================ */}
        <section className="relative bg-black text-white overflow-hidden">
          {/* Subtle particle grid bg */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(96,165,250,0.6) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <Reveal>
                <div>
                  <div className="eyebrow text-white/40 mb-3">02 — Featured</div>
                  <h2 className="text-[clamp(1.9rem,5vw,3.5rem)] font-semibold leading-[1.05] text-white tracking-tight max-w-xl">
                    High-demand surveillance models.
                  </h2>
                  <p className="text-sm text-white/50 mt-3 max-w-md">
                    Genuine stock, SKU-level dispatch from our central warehouse.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-3 text-sm font-medium text-white hover:border-white/60 hover:bg-white/5 transition-colors active:scale-[0.98]"
                >
                  All {featuredProducts.length}+ models <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
              {featuredProducts.slice(0, 4).map((product, idx) => (
                <Reveal key={product.id} delay={idx * 60} className="bg-black">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DISCIPLINE — parallax camera lens with text overlay */}
        {/* ============================================================ */}
        <ParallaxSection
          imageSrc="/cinematic/camera-lens.jpg"
          imageAlt="Extreme close-up of a CCTV security camera lens in dramatic lighting"
          speed={0.25}
          overlay="darker"
          className="text-white"
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-32 lg:py-48">
            <div className="max-w-xl">
              <Reveal>
                <div className="eyebrow text-white/40 mb-5">The discipline</div>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="text-[clamp(1.9rem,5vw,3.5rem)] font-semibold leading-[1.05] text-white tracking-tight">
                  Hardware chosen by people who install it.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-base text-white/70 leading-[1.75] mt-7 max-w-md">
                  Every camera, recorder and drive in our catalog is vetted by
                  engineers who specify and deploy these systems in the field.
                  No rebranded grey market, no mystery SKUs — only serial-tracked,
                  manufacturer-warranted hardware from the brands Indian
                  installers already trust.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 mt-8 text-sm text-white link-underline"
                >
                  Read the sourcing standard <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </ParallaxSection>

        {/* ============================================================ */}
        {/* KIT BUILDER — dark cinematic with parallax DVR rack */}
        {/* ============================================================ */}
        <section className="relative bg-black text-white overflow-hidden">
          {/* Atmospheric gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 80% 50%, rgba(30,64,175,0.15) 0%, transparent 60%)',
            }}
          />
          <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <Reveal variant="scale" className="lg:col-span-6 order-1">
                <div className="media-frame relative aspect-[4/3] border border-white/10">
                  <Image
                    src="/cinematic/dvr-rack.jpg"
                    alt="Server rack with NVR DVR units, glowing blue LED status lights"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-[2px] px-2.5 py-1">
                    <span className="dot-rec" />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/70">Fig. 03</span>
                  </div>
                </div>
              </Reveal>

              <div className="lg:col-span-6 space-y-7 order-2">
                <Reveal>
                  <div className="eyebrow text-white/40">03 — Configuration tool</div>
                </Reveal>
                <Reveal delay={60}>
                  <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] text-white tracking-tight">
                    Don&apos;t know which parts fit together?
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="text-base text-white/70 leading-relaxed max-w-lg">
                    Assemble your surveillance package step by step — pick DVR channel
                    capacity, mix dome & bullet cameras, calculate required recording days,
                    and receive an automatic bundle discount.
                  </p>
                </Reveal>

                <Reveal delay={160}>
                  <ol className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-white/10">
                    {[
                      ['Recorder', '4, 8 or 16 channel DVR/NVR'],
                      ['Cameras', 'Dome & bullet, 2MP to 8MP'],
                      ['Storage', 'Recording-day calculator'],
                      ['Accessories', 'Cable, SMPS, connectors'],
                    ].map(([step, desc], i) => (
                      <li key={step} className="pt-4">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-mono text-[10px] text-white/40">0{i + 1}</span>
                          <span className="text-sm font-medium text-white">{step}</span>
                        </div>
                        <div className="text-[13px] text-white/55">{desc}</div>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={200}>
                  <Link
                    href="/kit-builder"
                    className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-sm bg-white px-8 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4" />
                    Start the kit builder
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BRANDS — dark cinematic wordmark grid */}
        {/* ============================================================ */}
        <section className="bg-black text-white border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
            <Reveal>
              <div className="eyebrow text-white/40 mb-10 text-center">
                Authorized supply — premier security & networking brands
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/10 border border-white/10">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?brand=${b.slug}`}
                    className="group flex items-center justify-center py-10 px-4 bg-black hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white/70 group-hover:text-[var(--brand-soft)] transition-colors tracking-tight">
                      {b.name}
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
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
