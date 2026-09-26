'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay in ms for stagger */
  delay?: number;
  as?: React.ElementType;
}

/**
 * Reveal — single-element scroll reveal wrapper.
 * Adds `.reveal` until the element enters the viewport, then `.is-visible`.
 * Keeps a `transitionDelay` for staggered sequences.
 * Respects prefers-reduced-motion via CSS.
 *
 * Note: `visible` is only ever set inside IntersectionObserver callbacks
 * (event-driven) or a timer (async), never synchronously in the effect body,
 * to comply with react-hooks/set-state-in-effect.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // No element or no IntersectionObserver — schedule the reveal on the
    // next tick instead of calling setState synchronously in the effect body.
    if (!el || typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    // Fallback: if the element never enters the viewport within 2.5s (e.g.
    // a full-page screenshot captured without scrolling, or a very tall
    // page), reveal it anyway so content is never permanently hidden.
    const fallback = setTimeout(() => setVisible(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn('reveal', visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
