import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

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
  // Compute minimum selling price and highest MRP among variants
  const prices = product.variants.map((v) => Number(v.sku.sellingPrice));
  const mrps = product.variants.map((v) => Number(v.sku.mrp));

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const correspondingMrp = mrps.length > 0 ? Math.max(...mrps) : 0;
  const discountPct =
    correspondingMrp > minPrice
      ? Math.round(((correspondingMrp - minPrice) / correspondingMrp) * 100)
      : 0;

  // Calculate total available stock across variants
  const totalAvailableStock = product.variants.reduce((acc, v) => {
    const inv = v.sku.inventory;
    if (!inv) return acc;
    return acc + Math.max(0, inv.currentStock - inv.reservedStock);
  }, 0);

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-sky-500/40 dark:hover:border-sky-500/40 transition-all duration-300 overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {discountPct > 0 && (
          <Badge variant="danger" className="font-bold text-[10px] tracking-wide">
            {discountPct}% OFF
          </Badge>
        )}
        {!product.isCodAllowed && (
          <Badge variant="outline" className="text-[10px] bg-white/90 dark:bg-slate-950/90 font-medium">
            Prepaid Only
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-4/3 bg-slate-50 dark:bg-slate-950/60 overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Brand & Model */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {product.brand.name}
          </span>
          {product.modelNumber && (
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {product.modelNumber}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Available Variant Pills */}
        {product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 mb-4">
            {product.variants.map((variant) => (
              <span
                key={variant.id}
                className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                {variant.name.split(' ')[0]}
              </span>
            ))}
          </div>
        )}

        {/* Price & Stock Section */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {prices.length > 1 ? `From ${formatPrice(minPrice)}` : formatPrice(minPrice)}
            </span>
            {correspondingMrp > minPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(correspondingMrp)}
              </span>
            )}
          </div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
            (Incl. 18% GST • ITC Eligible)
          </span>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-3 pt-2">
            <div>
              {totalAvailableStock > 5 ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
                </span>
              ) : totalAvailableStock > 0 ? (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Only {totalAvailableStock} left
                </span>
              ) : (
                <span className="text-[11px] font-medium text-rose-500">Out of Stock</span>
              )}
            </div>

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform"
            >
              Select Options <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
