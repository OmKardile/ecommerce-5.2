'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
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
    <div className="group relative flex flex-col bg-card border border-border-strong hover:border-foreground transition-colors duration-200">
      {/* Product image — links to detail */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-[4/3] bg-surface-2 overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
        />
        {/* Discount badge — prominent */}
        {discountPct > 0 && !isOutOfStock && (
          <div className="absolute top-0 left-0 bg-[var(--brand)] text-white px-2.5 py-1 text-xs font-bold">
            −{discountPct}%
          </div>
        )}
        {/* Sold out badge */}
        {isOutOfStock && (
          <div className="absolute top-0 left-0 bg-stone-500 text-white px-2.5 py-1 text-xs font-bold uppercase">
            Sold Out
          </div>
        )}
        {/* Prepaid-only flag */}
        {!product.isCodAllowed && !isOutOfStock && (
          <div className="absolute top-0 right-0 bg-amber-500/90 text-white px-2 py-1 text-[10px] font-semibold uppercase">
            Prepaid Only
          </div>
        )}
      </Link>

      {/* Content — product info + price + add to cart */}
      <div className="flex flex-col flex-1 p-4 border-t border-border-subtle">
        {/* Brand */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wide">{product.brand.name}</span>
          {product.modelNumber && (
            <span className="font-mono text-[10px] text-stone-400">{product.modelNumber}</span>
          )}
        </div>

        {/* Title — links to detail */}
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-bold text-foreground leading-snug line-clamp-2 hover:text-[var(--brand)] transition-colors mb-2"
        >
          {product.name}
        </Link>

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="text-[11px] text-stone-500 font-mono mb-3">
            {product.variants.map((v) => v.name.split(' ')[0]).slice(0, 3).join(' · ')}
            {product.variants.length > 3 && ` +${product.variants.length - 3}`}
          </div>
        )}

        {/* Stock status — prominent badge */}
        <div className="mb-2">
          {totalAvailableStock > 5 ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock
            </span>
          ) : totalAvailableStock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Only {totalAvailableStock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
              <span className="w-2 h-2 rounded-full bg-stone-400" /> Out of Stock
            </span>
          )}
        </div>

        {/* Price — prominent */}
        <div className="flex items-baseline gap-2 mb-3">
          {minPrice > 0 ? (
            <>
              {fromPrice && (
                <span className="text-[11px] text-stone-400">from</span>
              )}
              <span className="text-xl font-bold text-foreground">{formatPrice(minPrice)}</span>
              {correspondingMrp > minPrice && (
                <span className="text-xs text-stone-400 line-through">{formatPrice(correspondingMrp)}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-stone-500 italic">Price on request</span>
          )}
        </div>

        {/* GST info */}
        {minPrice > 0 && (
          <div className="text-[10px] text-stone-500 mb-3">incl. 18% GST · ITC eligible</div>
        )}

        {/* Add to Cart button — prominent, always visible */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-sm transition-all active:scale-[0.98] ${
            added
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-border'
              : 'bg-foreground text-white hover:opacity-90'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added!
            </>
          ) : adding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Adding...
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
