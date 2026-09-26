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
        {/* HERO — asymmetric, cinematic, strong typographic tension */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-foreground text-background">
          {/* Hairline grid — extremely subtle, anchors the composition */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 pb-28 lg:pt-32 lg:pb-40">
            {/* Asymmetric 12-col grid — text left, spec column right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
              <div className="lg:col-span-8">
                {/* Staggered hero text — children animate in sequence */}
                <Reveal variant="stagger">
                  <div style={{ ['--stagger' as string]: 0 }}>
                    <div className="flex items-center gap-4 mb-14">
                      <span className="dot-rec" />
                      <span className="text-[12px] tracking-[0.24em] uppercase font-medium text-background/55">
                        Authorized Indian distributor
                      </span>
                    </div>
                  </div>

                  <h1
                    className="display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] max-w-4xl text-background"
                    style={{ ['--stagger' as string]: 1 }}
                  >
                    Surveillance hardware,
                    <br />
                    <span className="ital">precisely</span> specified.
                  </h1>

                  <p
                    className="mt-10 text-base sm:text-lg text-background/70 leading-relaxed max-w-lg font-sans"
                    style={{ ['--stagger' as string]: 2 }}
                  >
                    Certified HD analog cameras, AI AcuSense recorders, 24/7
                    surveillance drives and Cat6 cabling — with verified 18%
                    GST invoicing and immediate pan-India dispatch.
                  </p>

                  <div
                    className="mt-10 flex flex-wrap items-center gap-3"
                    style={{ ['--stagger' as string]: 3 }}
                  >
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2.5 bg-background text-foreground px-7 py-4 text-sm font-medium rounded-sm transition-transform hover:-translate-y-0.5 active:scale-[0.985]"
                    >
                      Browse the catalog
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/kit-builder"
                      className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-medium rounded-sm border border-background/30 text-background hover:border-background hover:bg-background/5 transition-colors active:scale-[0.985]"
                    >
                      <Wrench className="w-4 h-4" />
                      Build a kit
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Spec column — mono, asymmetric counterweight to the headline */}
              <div className="lg:col-span-4 lg:border-l lg:border-background/15 lg:pl-8 flex flex-col justify-end">
                <Reveal variant="stagger" delay={200}>
                  <div style={{ ['--stagger' as string]: 0 }}>
                    <div className="eyebrow text-background/40 mb-4">Catalog index</div>
                  </div>
                  <div style={{ ['--stagger' as string]: 1 }}>
                    <dl className="space-y-3 text-xs font-mono text-background/60">
                      <div className="flex justify-between border-b border-background/10 pb-2">
                        <dt>brands</dt>
                        <dd className="text-background">{brands.length}</dd>
                      </div>
                      <div className="flex justify-between border-b border-background/10 pb-2">
                        <dt>categories</dt>
                        <dd className="text-background">{categories.length}</dd>
                      </div>
                      <div className="flex justify-between border-b border-background/10 pb-2">
                        <dt>models</dt>
                        <dd className="text-background">{featuredProducts.length}+</dd>
                      </div>
                      <div className="flex justify-between border-b border-background/10 pb-2">
                        <dt>gst rate</dt>
                        <dd className="text-[var(--brand-soft)]">18%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>dispatch</dt>
                        <dd className="text-background">pan-india</dd>
                      </div>
                    </dl>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* Brand marquee — distinctive editorial moment at hero's edge */}
          <div className="relative border-t border-background/10 py-6">
            <div className="marquee">
              <div className="marquee-track">
                {[...brands, ...brands].map((b, i) => (
                  <Link
                    key={`${b.id}-${i}`}
                    href={`/products?brand=${b.slug}`}
                    className="display text-2xl text-background/40 hover:text-background transition-colors whitespace-nowrap"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* EDITORIAL STILL-LIFE — mask-reveal image + asymmetric copy */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center py-24 lg:py-32">
            {/* Text — left, narrow */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Reveal>
                <div className="eyebrow text-stone-500 mb-5">The discipline</div>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="display text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] text-foreground">
                  Hardware chosen by people who <span className="ital">install</span> it.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-[1.75] mt-7 max-w-md">
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
            {/* Image — right, wide, mask-reveal */}
            <Reveal variant="mask" className="lg:col-span-7 order-1 lg:order-2">
              <div className="media-frame relative aspect-[4/5] sm:aspect-[5/4] border border-border">
                <Image
                  src="/editorial/hardware-still-life.jpg"
                  alt="Disassembled CCTV surveillance hardware components — lens, board, connector, bracket"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CATEGORIES — editorial index with full-bleed hover */}
        {/* ============================================================ */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <Reveal>
              <div>
                <div className="eyebrow text-stone-500 mb-3">01 — Categories</div>
                <h2 className="display text-[clamp(1.9rem,4vw,2.8rem)] leading-tight text-foreground max-w-xl">
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
              <Reveal key={cat!.id} delay={idx * 50}>
                <Link
                  href={`/products?category=${cat!.slug}`}
                  className="group grid grid-cols-12 items-center gap-4 py-8 border-b border-border hover:bg-accent/40 transition-colors duration-300 px-2 -mx-2"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-stone-400 group-hover:text-foreground transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="col-span-7 sm:col-span-5 display text-xl sm:text-3xl text-foreground group-hover:text-[var(--brand)] transition-colors duration-300">
                    {cat!.name}
                  </span>
                  <span className="hidden sm:block col-span-5 text-sm text-stone-500">
                    {categoryBlurb(cat!.slug)}
                  </span>
                  <span className="col-span-3 sm:col-span-1 flex justify-end">
                    <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURED PRODUCTS — asymmetric grid with mask reveal */}
        {/* ============================================================ */}
        <section className="border-y border-border bg-card/30">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <Reveal>
                <div>
                  <div className="eyebrow text-stone-500 mb-3">02 — Featured</div>
                  <h2 className="display text-[clamp(1.9rem,4vw,2.8rem)] leading-tight text-foreground max-w-xl">
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
                <Reveal key={product.id} delay={idx * 60} className="bg-background">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KIT BUILDER — cinematic image + editorial copy */}
        {/* ============================================================ */}
        <section className="bg-foreground text-background">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <Reveal variant="scale" className="lg:col-span-6 order-1">
                <div className="media-frame relative aspect-[16/11] border border-background/15">
                  <Image
                    src="/editorial/kit-builder-camera.jpg"
                    alt="Cinematic close-up of a premium CCTV camera lens assembly in low-key light"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-foreground/80 backdrop-blur-[2px] px-2.5 py-1">
                    <span className="dot-rec" />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-background/70">Fig. 03</span>
                  </div>
                </div>
              </Reveal>

              <div className="lg:col-span-6 space-y-8 order-2">
                <Reveal>
                  <div className="eyebrow text-background/50">03 — Configuration tool</div>
                </Reveal>
                <Reveal delay={60}>
                  <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02]">
                    Don&apos;t know which parts fit together? <span className="ital">Build a kit.</span>
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="text-base text-background/70 leading-relaxed max-w-lg">
                    Assemble your surveillance package step by step — pick DVR channel
                    capacity, mix dome & bullet cameras, calculate required recording days,
                    and receive an automatic bundle discount.
                  </p>
                </Reveal>

                <Reveal delay={160}>
                  <ol className="grid grid-cols-2 gap-x-8 gap-y-5 pt-4 border-t border-background/15">
                    {[
                      ['Recorder', '4, 8 or 16 channel DVR/NVR'],
                      ['Cameras', 'Dome & bullet, 2MP to 8MP'],
                      ['Storage', 'Recording-day calculator'],
                      ['Accessories', 'Cable, SMPS, connectors'],
                    ].map(([step, desc], i) => (
                      <li key={step} className="pt-5">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-mono text-[10px] text-background/40">0{i + 1}</span>
                          <span className="text-sm font-medium text-background">{step}</span>
                        </div>
                        <div className="text-[13px] text-background/55">{desc}</div>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={200}>
                  <Link
                    href="/kit-builder"
                    className="inline-flex items-center gap-2.5 bg-background text-foreground px-7 py-4 text-sm font-medium rounded-sm transition-transform hover:-translate-y-0.5 active:scale-[0.985]"
                  >
                    <Wrench className="w-4 h-4" />
                    Start the kit builder
                  </Link>
                </Reveal>
              </div>
            </div>
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
