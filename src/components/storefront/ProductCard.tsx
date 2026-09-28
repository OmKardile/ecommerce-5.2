'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    modelNumber?: string | null;
    isCodAllowed: boolean;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    images: { url: string; altText?: string | null }[];
    variants: Array<{
      id: string;
      name: string;
      sku: {
        code: string;
        sellingPrice: number | string | { toString(): string };
        mrp: number | string | { toString(): string };
        inventory?: { currentStock: number; reservedStock: number } | null;
      };
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const prices = product.variants.map((v) => Number(v.sku.sellingPrice));
  const mrps = product.variants.map((v) => Number(v.sku.mrp));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const correspondingMrp = mrps.length > 0 ? Math.max(...mrps) : 0;
  const discountPct =
    correspondingMrp > minPrice
      ? Math.round(((correspondingMrp - minPrice) / correspondingMrp) * 100)
      : 0;

  const totalAvailableStock = product.variants.reduce((acc, v) => {
    const inv = v.sku.inventory;
    if (!inv) return acc;
    return acc + Math.max(0, inv.currentStock - inv.reservedStock);
  }, 0);

  const firstSkuCode = product.variants[0]?.sku.code || '';
  const isOutOfStock = totalAvailableStock === 0;

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';

  const fromPrice = prices.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !firstSkuCode) return;
    try {
      setAdding(true);
      const res = await addToCartAction(firstSkuCode, 1);
      if (res.success) {
        setAdded(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        setTimeout(() => setAdded(false), 2500);
      }
    } catch {
      // graceful
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col bg-card border border-border-subtle hover:border-border-strong transition-colors duration-300">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-[4/3] bg-surface-2 overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-contain p-6 transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
        />
        {discountPct > 0 && !isOutOfStock && (
          <span className="absolute top-3 left-3 text-[11px] font-medium text-[var(--brand)]">
            −{discountPct}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Brand */}
        <span className="text-[10px] tracking-[0.18em] uppercase font-medium text-stone mb-2">
          {product.brand.name}
        </span>

        {/* Title */}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:text-[var(--brand)] transition-colors mb-3"
        >
          {product.name}
        </Link>

        {/* Stock */}
        <div className="mb-3 text-[11px]">
          {totalAvailableStock > 5 ? (
            <span className="text-stone">In stock</span>
          ) : totalAvailableStock > 0 ? (
            <span className="text-[var(--brand)]">{totalAvailableStock} remaining</span>
          ) : (
            <span className="text-stone-soft">Sold out</span>
          )}
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto pt-3 border-t border-border-subtle flex items-end justify-between">
          <div>
            {minPrice > 0 ? (
              <div className="flex items-baseline gap-1.5">
                {fromPrice && <span className="text-[10px] text-stone-soft">from</span>}
                <span className="text-base font-medium text-foreground">{formatPrice(minPrice)}</span>
                {correspondingMrp > minPrice && (
                  <span className="text-[11px] text-stone-soft line-through">{formatPrice(correspondingMrp)}</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-stone italic">Price on request</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            aria-label="Add to cart"
            className={`p-2.5 rounded-sm border transition-all active:scale-95 ${
              added
                ? 'bg-[var(--brand)] border-[var(--brand)] text-white'
                : isOutOfStock
                ? 'border-border-subtle text-stone-soft cursor-not-allowed'
                : 'border-border hover:border-foreground hover:bg-surface-3 text-foreground'
            }`}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
