'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { formatPrice, calculateGstBreakdown } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';
import { PincodeChecker } from '@/components/storefront/PincodeChecker';

import { Prisma } from '@prisma/client';

export interface DynamicVariantSelectorProps {
  product: {
    id: string;
    name: string;
    isCodAllowed: boolean;
    brand: { name: string };
    category: { name: string; hsnCode?: string | null };
    variants: Array<{
      id: string;
      name: string;
      attributes: Prisma.JsonValue;
      sku: {
        id: string;
        code: string;
        barcode?: string | null;
        mrp: number | string | { toString(): string };
        sellingPrice: number | string | { toString(): string };
        weightGrams: number;
        dimensionsCm?: Prisma.JsonValue;
        inventory?: {
          currentStock: number;
          reservedStock: number;
          lowStockThreshold: number;
        } | null;
      };
    }>;
  };
}

export function DynamicVariantSelector({ product }: DynamicVariantSelectorProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  if (!selectedVariant) {
    return <div className="p-4 text-sm text-stone-500">No variants configured for this product.</div>;
  }

  const sku = selectedVariant.sku;
  const sellingPrice = Number(sku.sellingPrice);
  const mrp = Number(sku.mrp);
  const discountPct = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const currentStock = sku.inventory?.currentStock ?? 0;
  const reservedStock = sku.inventory?.reservedStock ?? 0;
  const availableStock = Math.max(0, currentStock - reservedStock);

  const isOutOfStock = availableStock <= 0;

  const gstBreakdown = calculateGstBreakdown(sellingPrice);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      setErrorMsg(null);
      const res = await addToCartAction(sku.code, quantity);
      if (res.success) {
        setAddedToast(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        setTimeout(() => setAddedToast(false), 3500);
      } else {
        setErrorMsg(res.error || 'Failed to add item to cart.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding item to cart.';
      setErrorMsg(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsBuyingNow(true);
      setErrorMsg(null);
      const res = await addToCartAction(sku.code, quantity);
      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push('/checkout');
      } else {
        setErrorMsg(res.error || 'Failed to initialize checkout.');
        setIsBuyingNow(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error proceeding to checkout.';
      setErrorMsg(msg);
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Price block — editorial, hairline */}
      <div className="border border-border bg-card p-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-mono text-foreground tracking-tight">
            {formatPrice(sellingPrice)}
          </span>
          {mrp > sellingPrice && (
            <span className="text-sm text-stone-400 line-through font-mono">
              {formatPrice(mrp)}
            </span>
          )}
          {discountPct > 0 && (
            <span className="text-[var(--ember)] text-xs font-mono tracking-tight">
              −{discountPct}%
            </span>
          )}
        </div>

        {/* GST breakdown — refined */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="font-mono">
            {formatPrice(gstBreakdown.taxableValue)} + 18% GST ({formatPrice(gstBreakdown.totalGst)})
          </span>
          <span className="text-[var(--ember)] flex items-center gap-1.5">
            <span className="dot-rec" /> ITC eligible
          </span>
        </div>
      </div>

      {/* Variant chips — sharp, hairline, ink-selected */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="eyebrow text-stone-500">Select model variant</label>
          <span className="text-[11px] text-stone-500 font-mono">
            SKU <span className="text-foreground">{sku.code}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            const vStock = Math.max(0, (v.sku.inventory?.currentStock ?? 0) - (v.sku.inventory?.reservedStock ?? 0));
            const vPrice = Number(v.sku.sellingPrice);
            const vOut = vStock <= 0;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`flex flex-col p-3 text-left transition-colors border-0 ${
                  isSelected
                    ? 'bg-foreground text-background'
                    : vOut
                    ? 'bg-background text-stone-400 cursor-not-allowed'
                    : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium">{v.name.split(' ')[0]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-mono mt-1.5 opacity-90">
                  {vPrice > 0 ? formatPrice(vPrice) : '—'}
                </span>
                <span className="text-[10px] mt-0.5 opacity-60">
                  {vOut ? 'Sold out' : `${vStock} in stock`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock + COD status — text, no pills */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        {availableStock > 5 ? (
          <span className="text-stone-500 flex items-center gap-1.5">
            <span className="dot-rec" /> {availableStock} units ready to dispatch
          </span>
        ) : availableStock > 0 ? (
          <span className="text-[var(--ember)] flex items-center gap-1.5">
            <span className="dot-rec" /> Low stock — {availableStock} remaining
          </span>
        ) : (
          <span className="text-stone-400">Out of stock</span>
        )}

        <span className="text-stone-300 dark:text-stone-600">/</span>
        <span className="text-stone-500">
          {product.isCodAllowed ? 'Cash on delivery available' : 'Prepaid only (Razorpay)'}
        </span>
      </div>

      {/* Quantity + CTAs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Quantity — sharp */}
          <div className="flex items-center border border-border bg-background">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-lg leading-none"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-mono text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              disabled={quantity >= availableStock || isOutOfStock}
              className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-lg leading-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to cart — solid ink */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || isBuyingNow}
            className="flex-1 btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to cart
              </>
            )}
          </button>
        </div>

        {/* Buy now — ghost with ember arrow */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding || isBuyingNow}
          className="w-full btn-ghost justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none group"
        >
          {isBuyingNow ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Preparing checkout…
            </>
          ) : (
            <>
              Buy now <ArrowRight className="w-4 h-4 text-[var(--ember)] group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="p-3 border border-rose-300/70 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Added toast */}
      {addedToast && (
        <div className="p-3 border border-border bg-card text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 text-foreground">
            <Check className="w-4 h-4 text-[var(--ember)]" />
            Added {quantity}× {selectedVariant.name} to cart
          </span>
          <Link href="/cart" className="text-foreground link-underline flex items-center gap-1">
            View cart <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Pincode checker */}
      <PincodeChecker orderTotal={sellingPrice} className="my-2" />

      {/* Assurance perks — hairline, monochrome */}
      <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border text-xs text-stone-500">
        <div>3-year direct manufacturer warranty</div>
        <div className="text-right">Same-day AWB booking</div>
      </div>

      {/* Mobile sticky bar — solid, no glass */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3 px-5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] text-stone-500 truncate">{selectedVariant.name}</div>
          <div className="text-base font-mono text-foreground">
            {formatPrice(sellingPrice)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Adding…' : isOutOfStock ? 'Sold out' : 'Add to cart'}</span>
        </button>
      </div>
    </div>
  );
}
