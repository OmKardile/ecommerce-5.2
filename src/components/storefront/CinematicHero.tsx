'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Wrench } from 'lucide-react';

/**
 * CinematicHero — VFX-heavy immersive hero:
 * - Layered parallax (city bg drifts slow, camera lens drifts fast)
 * - Animated particle/grid overlay
 * - Scroll-driven text scale + opacity
 * - Mask-reveal headline
 */
export function CinematicHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Parallax factors — bg slow, mid normal, foreground fast
  const bgOffset = scrollY * 0.3;
  const midOffset = scrollY * 0.5;
  const fgOffset = scrollY * 0.7;
  // Hero content fades + scales as you scroll past
  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroScale = 1 + scrollY * 0.0004;
  const textY = scrollY * 0.15;

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[700px] w-full overflow-hidden bg-black"
    >
      {/* Layer 1 — city skyline (deep parallax, slowest) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${bgOffset}px) scale(1.15)` }}
      >
        <Image
          src="/cinematic/hero-city.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      </div>

      {/* Layer 2 — atmospheric gradient + vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%), linear-gradient(to bottom, rgba(8,12,24,0.6) 0%, transparent 30%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Layer 3 — animated particle grid (CSS-only, performant) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 animate-pulse-slow"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(96,165,250,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Layer 4 — camera lens (foreground, fastest parallax, right side) */}
      <div
        className="absolute right-0 top-0 h-full w-full lg:w-1/2 will-change-transform pointer-events-none"
        style={{ transform: `translateY(${fgOffset * -0.3}px)` }}
      >
        <div className="relative h-full w-full opacity-50 lg:opacity-70">
          <Image
            src="/cinematic/camera-lens.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to left, black 0%, black 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 0%, black 50%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* Layer 5 — content (text + CTAs), scroll-driven fade/scale */}
      <div
        className="relative z-10 h-full flex items-center"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${textY}px) scale(${heroScale})`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow — cinematic glow */}
            <div
              className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--brand-soft)] opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-soft)]" />
              </span>
              <span className="text-[11px] tracking-[0.3em] uppercase font-medium text-white/60">
                Authorized Indian distributor
              </span>
            </div>

            {/* Headline — mask reveal + dramatic scale */}
            <h1
              className="opacity-0 animate-fade-in-up font-serif text-white"
              style={{
                animationDelay: '0.4s',
                animationFillMode: 'forwards',
                fontSize: 'clamp(2.8rem, 8vw, 6rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                fontWeight: 500,
              }}
            >
              Surveillance hardware,
              <br />
              <span className="italic text-[var(--brand-soft)]">precisely</span> specified.
            </h1>

            {/* Subtitle */}
            <p
              className="mt-8 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
            >
              Certified HD analog cameras, AI AcuSense recorders, 24/7
              surveillance drives and Cat6 cabling — with verified 18%
              GST invoicing and immediate pan-India dispatch.
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-wrap items-center gap-3 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-sm bg-white px-8 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="relative z-10">Browse the catalog</span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--brand-soft)]/0 via-[var(--brand-soft)]/30 to-[var(--brand-soft)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <Link
                href="/kit-builder"
                className="inline-flex items-center gap-2.5 rounded-sm border border-white/20 px-8 py-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/5 active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4" />
                Build a kit
              </Link>
            </div>

            {/* Scroll indicator */}
            <div
              className="mt-16 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                <div className="h-px w-12 bg-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--brand-soft)] animate-scroll-line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 6 — bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--paper)] pointer-events-none" />
    </section>
  );
}
