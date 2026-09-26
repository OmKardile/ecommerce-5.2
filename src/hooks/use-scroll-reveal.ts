'use client';

import { useEffect } from 'react';

/**
 * useScrollReveal — adds `.is-visible` to any `.reveal` element when it
 * enters the viewport. Subtle, fast, and respects prefers-reduced-motion
 * (handled in CSS). Mount once near the root.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    if (els.length === 0) return;

    // If IntersectionObserver is unavailable, just reveal everything.
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
