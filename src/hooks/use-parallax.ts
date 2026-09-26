'use client';

import { useEffect, useState } from 'react';

/**
 * useScrollProgress — returns the scroll position as a 0-1 value
 * of how far through the document the user has scrolled.
 * Used for parallax + scroll-driven VFX.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}

/**
 * useParallax — returns a translateY value based on element's position
 * in the viewport. Pass a speed multiplier (negative = moves up
 * slower than scroll, positive = moves down).
 */
export function useParallax<T extends HTMLElement>(speed = 0.3) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Element center relative to viewport center, normalized
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

  return { ref, offset };
}

import { useRef } from 'react';
