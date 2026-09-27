import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
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

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';

  const fromPrice = prices.length > 1;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col bg-card border border-border hover:border-foreground transition-colors duration-300"
    >
      {/* Image — sharp, contained, subtle zoom */}
      <div className="media-frame relative block w-full aspect-[4/3]">
        <Image
          src={mainImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`object-contain p-6 ${totalAvailableStock === 0 ? 'opacity-40 grayscale' : ''}`}
        />
        {/* Badge slot — always top-left so the grid stays aligned */}
        <div className="absolute top-0 left-0">
          {totalAvailableStock === 0 ? (
            <div className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 text-[10px] font-mono tracking-tight uppercase">
              Sold out
            </div>
          ) : discountPct > 0 ? (
            <div className="bg-foreground text-background px-2 py-1 text-[10px] font-mono tracking-tight">
              −{discountPct}%
            </div>
          ) : null}
        </div>
        {/* Prepaid-only flag — top-right, hairline */}
        {!product.isCodAllowed && (
          <div className="absolute top-0 right-0 bg-background/90 border-l border-b border-border px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-stone-500">
            Prepaid
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col flex-1 p-5 border-t border-border-subtle">
        {/* Brand + model */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="eyebrow text-stone-500">{product.brand.name}</span>
          {product.modelNumber && (
            <span className="font-mono text-[10px] text-stone-400">{product.modelNumber}</span>
          )}
        </div>

        {/* Title — editorial serif */}
        <h3 className="display text-[17px] leading-snug text-foreground line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
          {product.name}
        </h3>

        {/* Variants — minimal text, no pills */}
        {product.variants.length > 0 && (
          <div className="mt-2 text-[11px] text-stone-500 font-mono">
            {product.variants.map((v) => v.name.split(' ')[0]).slice(0, 3).join(' · ')}
            {product.variants.length > 3 && ` +${product.variants.length - 3}`}
          </div>
        )}

        {/* Price + stock */}
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              {minPrice > 0 ? (
                <>
                  {fromPrice && (
                    <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400 mr-1">from</span>
                  )}
                  <span className="text-lg font-mono text-foreground">{formatPrice(minPrice)}</span>
                  {correspondingMrp > minPrice && (
                    <span className="text-[11px] text-stone-400 line-through font-mono">
                      {formatPrice(correspondingMrp)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-stone-500 italic">Price on request</span>
              )}
            </div>
            {minPrice > 0 && (
              <div className="text-[10px] text-stone-500 mt-0.5">incl. 18% GST · ITC eligible</div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Stock — tiny status, brand only when low */}
            {totalAvailableStock > 5 ? (
              <span className="text-[10px] text-stone-500">In stock</span>
            ) : totalAvailableStock > 0 ? (
              <span className="text-[10px] text-[var(--brand)] flex items-center gap-1.5">
                <span className="dot-rec" /> {totalAvailableStock} left
              </span>
            ) : (
              <span className="text-[10px] text-stone-400">Unavailable</span>
            )}
            <span className="text-foreground opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
