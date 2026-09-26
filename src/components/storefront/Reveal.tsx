'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay in ms for stagger */
  delay?: number;
  /** animation variant */
  variant?: 'up' | 'mask' | 'scale' | 'stagger';
  as?: React.ElementType;
}

/**
 * Reveal — single-element scroll reveal wrapper.
 * Supports multiple animation variants per the design language brief:
 * - 'up' (default): opacity + translateY (standard scroll-in)
 * - 'mask': clip-path wipe (editorial magazine feel for images)
 * - 'scale': subtle scale-down entrance (cinematic moments)
 * - 'stagger': children animate in sequence (use --stagger CSS var on children)
 *
 * All respect prefers-reduced-motion via CSS.
 */
export function Reveal({ children, className, delay = 0, variant = 'up', as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const variantClass = {
    up: 'reveal',
    mask: 'reveal-mask',
    scale: 'reveal-scale',
    stagger: 'reveal-stagger',
  }[variant];

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    if (typeof IntersectionObserver === 'undefined') {
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
    const fallback = setTimeout(() => setVisible(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn(variantClass, visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
