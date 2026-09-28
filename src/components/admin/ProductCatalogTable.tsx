'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  toggleProductCodAction,
} from '@/app/actions/admin.actions';
import { formatInr } from '@/lib/utils';


interface ProductData {
  id: string;
  name: string;
  slug: string;
  hsnCode: string;
  basePrice: number | string;
  isActive: boolean;
  isCodAllowed: boolean;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  variants: Array<{
    id: string;
    name: string;
    sku: {
      id: string;
      code: string;
      inventory?: {
        currentStock: number;
        reservedStock: number;
      } | null;
    } | null;
  }>;
}

interface Props {
  initialProducts: ProductData[];
}

export function ProductCatalogTable({ initialProducts }: Props) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.name.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q) ||
      p.hsnCode.includes(q)
    );
  });

  const handleToggleCod = (productId: string, currentVal: boolean) => {
    setFeedback(null);
    const nextVal = !currentVal;
    startTransition(async () => {
      const res = await toggleProductCodAction(productId, nextVal);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isCodAllowed: nextVal } : p))
        );
        setFeedback(
          `COD policy updated · ${nextVal ? 'COD allowed' : 'Prepaid only'}`
        );
      } else {
        alert(res.error || 'Failed to update COD policy');
      }
    });
  };

  // Visibility toggle removed — use stock=0 (out of stock) to hide products instead

  return (
    <div className="bg-background text-foreground space-y-6">
      {/* Search + feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-strong pb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <span className="dot-rec" /> Catalog
          </div>
          <div className="text-xs font-mono text-stone-400">
            {products.length} products
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, brand, category, HSN"
              className="w-full pl-9 pr-3 h-9 bg-card border border-border text-xs text-foreground placeholder:text-stone-500 focus:outline-none focus:border-border-strong rounded-sm transition-colors font-sans"
            />
          </div>
          {feedback && (
            <div className="px-3 py-1.5 border border-border bg-card text-[11px] text-foreground flex items-center gap-2 rounded-sm">
              <span className="dot-rec" />
              <span className="font-mono">{feedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Catalog table — hairline editorial */}
      <div className="border border-border-strong bg-card overflow-hidden rounded-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="border-b border-border-subtle bg-background/30">
              <tr>
                <th className="eyebrow py-3 px-4 font-medium">Product</th>
                <th className="eyebrow py-3 px-4 font-medium">Category</th>
                <th className="eyebrow py-3 px-4 font-medium">HSN</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Base Price</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Variants / Stock</th>
                <th className="eyebrow py-3 px-4 font-medium">COD Policy</th>
                <th className="eyebrow py-3 px-4 font-medium text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-stone-500">
                    No products match the current filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce((acc, v) => {
                    const inv = v.sku?.inventory;
                    return acc + (inv ? inv.currentStock - inv.reservedStock : 0);
                  }, 0);

                  return (
                    <tr key={product.id} className="hover:bg-background/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="text-sm text-foreground font-medium line-clamp-1">
                          {product.name}
                        </div>
                        <div className="eyebrow text-stone-500 mt-1">{product.brand.name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-stone-300">{product.category.name}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">
                        {product.hsnCode}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm text-foreground">
                        {formatInr(Number(product.basePrice))}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono text-xs text-foreground">
                          {product.variants.length} variants
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            totalStock > 0 ? 'text-stone-400' : 'text-[var(--brand)]'
                          }`}
                        >
                          {totalStock} net
                        </div>
                      </td>

                      {/* COD toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          disabled={isPending}
                          onClick={() => handleToggleCod(product.id, product.isCodAllowed)}
                          className={`px-2.5 py-1 text-[10px] font-medium border rounded-sm transition-colors ${
                            product.isCodAllowed
                              ? 'text-foreground border-border hover:border-border-strong'
                              : 'text-[var(--brand)] border-[var(--brand)]/40 hover:border-[var(--brand)]'
                          }`}
                          title="Toggle COD eligibility (ADR-004)"
                        >
                          {product.isCodAllowed ? 'COD' : 'Prepaid'}
                        </button>
                      </td>

                      {/* Storefront link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-stone-400 hover:text-[var(--brand)] transition-colors"
                          title="View on storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
