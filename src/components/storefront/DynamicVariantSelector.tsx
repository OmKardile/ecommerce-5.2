'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  FileText,
  ShoppingCart,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
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
    return <div className="p-4 text-slate-500">No variants configured for this product.</div>;
  }

  const sku = selectedVariant.sku;
  const sellingPrice = Number(sku.sellingPrice);
  const mrp = Number(sku.mrp);
  const discountPct = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const currentStock = sku.inventory?.currentStock ?? 0;
  const reservedStock = sku.inventory?.reservedStock ?? 0;
  const availableStock = Math.max(0, currentStock - reservedStock);

  const isLowStock = availableStock > 0 && availableStock <= 5;
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
    <div className="space-y-6">
      {/* Price Block */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatPrice(sellingPrice)}
          </span>
          {mrp > sellingPrice && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(mrp)}
            </span>
          )}
          {discountPct > 0 && (
            <Badge variant="danger" className="text-xs font-bold">
              {discountPct}% OFF
            </Badge>
          )}
        </div>

        {/* GST Breakdown Notice */}
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <span>
            Taxable Base Price: <strong>{formatPrice(gstBreakdown.taxableValue)}</strong> + 18% GST ({formatPrice(gstBreakdown.totalGst)})
          </span>
          <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Input Tax Credit Eligible
          </span>
        </div>
      </div>

      {/* Dynamic Variant Selector Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Select Model Variant
          </label>
          <span className="text-xs text-slate-500 font-mono">
            SKU: <strong className="text-slate-800 dark:text-slate-200">{sku.code}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            const vStock = Math.max(0, (v.sku.inventory?.currentStock ?? 0) - (v.sku.inventory?.reservedStock ?? 0));
            const vPrice = Number(v.sku.sellingPrice);

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {v.name.split(' ')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {formatPrice(vPrice)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {vStock > 0 ? `${vStock} in stock` : 'Out of stock'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & COD Status Row */}
      <div className="flex items-center gap-3 text-xs">
        {availableStock > 5 ? (
          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            In Stock ({availableStock} units ready to dispatch)
          </span>
        ) : availableStock > 0 ? (
          <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Low Stock: Only {availableStock} units remaining
          </span>
        ) : (
          <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full font-semibold">
            Out of Stock
          </span>
        )}

        {product.isCodAllowed ? (
          <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
            Cash on Delivery Available
          </span>
        ) : (
          <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
            Prepaid Only (Razorpay)
          </span>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              -
            </button>
            <span className="w-10 text-center text-xs font-bold text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              disabled={quantity >= availableStock || isOutOfStock}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || isBuyingNow}
            className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400 dark:text-sky-600" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-sky-400 dark:text-sky-600" />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding || isBuyingNow}
          className={`w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all ${
            isOutOfStock || isAdding || isBuyingNow ? 'pointer-events-none opacity-50' : 'hover:scale-[1.01]'
          }`}
        >
          {isBuyingNow ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Preparing Checkout...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              Buy Now with 1-Click
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Added {quantity}x {selectedVariant.name} to cart!
          </span>
          <Link href="/cart" className="underline font-bold text-sky-600 dark:text-sky-400">
            View Cart
          </Link>
        </div>
      )}

      {/* Indian Pincode Delivery & COD Estimator */}
      <PincodeChecker orderTotal={sellingPrice} className="my-2" />

      {/* Assurance Perks */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>3-Year Direct Warranty</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-sky-500 shrink-0" />
          <span>Same-Day AWB Booking</span>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 px-4 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] text-slate-500 font-medium">
            {selectedVariant.name}
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatPrice(sellingPrice)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`py-2 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
