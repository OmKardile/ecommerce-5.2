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
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
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
      // @ts-expect-error ref typing across polymorphic tag
      ref={ref}
      className={cn('reveal', visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
