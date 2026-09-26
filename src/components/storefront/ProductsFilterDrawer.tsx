'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, Check } from 'lucide-react';

interface FilterItem {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ProductsFilterDrawerProps {
  categories: FilterItem[];
  brands: FilterItem[];
  activeCategory: string | null;
  activeBrand: string | null;
  inStockOnly: boolean;
}

/**
 * ProductsFilterDrawer — mobile-only filter drawer.
 * On desktop, the sidebar is shown inline (hidden lg:block in products page).
 * On mobile, this drawer toggle opens a full-screen filter panel.
 */
export function ProductsFilterDrawer({
  categories,
  brands,
  activeCategory,
  activeBrand,
  inStockOnly,
}: ProductsFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const buildUrl = (category?: string, brand?: string, inStock?: boolean) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (inStock) params.set('inStock', 'true');
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 border border-border bg-card text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </span>
        {(activeCategory || activeBrand || inStockOnly) && (
          <span className="text-[var(--brand)] text-xs font-mono">
            {[activeCategory, activeBrand, inStockOnly ? 'in-stock' : null].filter(Boolean).length} active
          </span>
        )}
      </button>

      {/* Active filter chips (quick visual feedback on mobile) */}
      {(activeCategory || activeBrand || inStockOnly) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeCategory && (
            <Link
              href={buildUrl(undefined, activeBrand || undefined, inStockOnly)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-[var(--brand)] text-xs font-medium border border-border"
            >
              {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              <X className="w-3 h-3" />
            </Link>
          )}
          {activeBrand && (
            <Link
              href={buildUrl(activeCategory || undefined, undefined, inStockOnly)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-[var(--brand)] text-xs font-medium border border-border"
            >
              {brands.find((b) => b.slug === activeBrand)?.name || activeBrand}
              <X className="w-3 h-3" />
            </Link>
          )}
          {inStockOnly && (
            <Link
              href={buildUrl(activeCategory || undefined, activeBrand || undefined, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-[var(--brand)] text-xs font-medium border border-border"
            >
              In stock
              <X className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Full-screen drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-background overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-stone-500 hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-8">
              {/* Category */}
              <div>
                <div className="eyebrow text-stone-500 mb-3">Category</div>
                <div className="space-y-1">
                  <Link
                    href={buildUrl(undefined, activeBrand || undefined, inStockOnly)}
                    onClick={() => setOpen(false)}
                    className={`block py-3 px-3 text-sm border-b border-border ${
                      !activeCategory ? 'bg-accent text-foreground font-medium' : 'text-stone-600'
                    }`}
                  >
                    All categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={buildUrl(cat.slug, activeBrand || undefined, inStockOnly)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between py-3 px-3 text-sm border-b border-border ${
                        activeCategory === cat.slug ? 'bg-accent text-foreground font-medium' : 'text-stone-600'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] font-mono text-stone-400">{cat._count?.products}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <div className="eyebrow text-stone-500 mb-3">Brand</div>
                <div className="space-y-1">
                  <Link
                    href={buildUrl(activeCategory || undefined, undefined, inStockOnly)}
                    onClick={() => setOpen(false)}
                    className={`block py-3 px-3 text-sm border-b border-border ${
                      !activeBrand ? 'bg-accent text-foreground font-medium' : 'text-stone-600'
                    }`}
                  >
                    All brands
                  </Link>
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={buildUrl(activeCategory || undefined, b.slug, inStockOnly)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between py-3 px-3 text-sm border-b border-border ${
                        activeBrand === b.slug ? 'bg-accent text-foreground font-medium' : 'text-stone-600'
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[11px] font-mono text-stone-400">{b._count?.products}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* In-stock toggle */}
              <div>
                <Link
                  href={buildUrl(activeCategory || undefined, activeBrand || undefined, !inStockOnly)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 text-sm text-stone-600"
                >
                  <span className={`w-5 h-5 border flex items-center justify-center ${
                    inStockOnly ? 'bg-foreground border-foreground text-background' : 'border-stone-400'
                  }`}>
                    {inStockOnly && <Check className="w-3.5 h-3.5" />}
                  </span>
                  In-stock items only
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border px-5 py-4">
              <button
                onClick={() => setOpen(false)}
                className="w-full btn-ink justify-center"
              >
                Show {categories.length + brands.length} options
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
