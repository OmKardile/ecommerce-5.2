'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ParallaxSectionProps {
  imageSrc: string;
  imageAlt: string;
  speed?: number; // parallax speed factor (default 0.2)
  children: React.ReactNode;
  className?: string;
  imageClassName?: string;
  overlay?: 'dark' | 'darker' | 'none';
}

/**
 * ParallaxSection — a section with a sticky background image that
 * drifts at a different speed than the foreground content as the
 * user scrolls. Creates depth + the "cinematic" feel.
 *
 * The image is `position: sticky` so it stays visible while the
 * content scrolls over it, with a translateY transform driven by
 * scroll position for the parallax effect.
 */
export function ParallaxSection({
  imageSrc,
  imageAlt,
  speed = 0.2,
  children,
  className = '',
  imageClassName = '',
  overlay = 'dark',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // How far the section center is from viewport center
      const center = rect.top + rect.height / 2 - windowHeight / 2;
      setOffset(center * speed * -1);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed]);

  const overlayClass = {
    dark: 'bg-black/40',
    darker: 'bg-black/70',
    none: '',
  }[overlay];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Sticky parallax image layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="sticky top-0 h-screen w-full will-change-transform"
          style={{ transform: `translateY(${offset}px) scale(1.15)` }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="100vw"
            className={`object-cover ${imageClassName}`}
          />
          {overlay !== 'none' && (
            <div className={`absolute inset-0 ${overlayClass}`} />
          )}
        </div>
      </div>
      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
