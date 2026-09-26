'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  toggleProductCodAction,
  toggleProductActiveAction,
} from '@/app/actions/admin.actions';
import { formatInr } from '@/lib/utils';


interface ProductData {
  id: string;
  name: string;
  slug: string;
  hsnCode: string;
  basePrice: number | any;
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
          `COD policy updated: ${nextVal ? 'COD Allowed' : 'Prepaid Only (COD Disabled)'}`
        );
      } else {
        alert(res.error || 'Failed to update COD policy');
      }
    });
  };

  const handleToggleActive = (productId: string, currentVal: boolean) => {
    setFeedback(null);
    const nextVal = !currentVal;
    startTransition(async () => {
      const res = await toggleProductActiveAction(productId, nextVal);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: nextVal } : p))
        );
        setFeedback(`Catalog visibility updated: ${nextVal ? 'Published Live' : 'Hidden'}`);
      } else {
        alert(res.error || 'Failed to update product visibility');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, Brand, Category, HSN..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {feedback && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">HSN Code</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4 text-center">Variants & Stock</th>
                <th className="py-3 px-4 text-center">Cash On Delivery</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => {
                  const inv = v.sku?.inventory;
                  return acc + (inv ? inv.currentStock - inv.reservedStock : 0);
                }, 0);

                return (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white line-clamp-1">{product.name}</div>
                      <div className="text-[10px] text-sky-400 font-semibold mt-0.5">
                        {product.brand.name}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/60">
                        {product.category.name}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {product.hsnCode}
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {formatInr(Number(product.basePrice))}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="font-semibold text-slate-200">
                        {product.variants.length} Variants
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          totalStock > 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {totalStock} Available
                      </div>
                    </td>

                    {/* Selective COD Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleCod(product.id, product.isCodAllowed)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                          product.isCodAllowed
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                        }`}
                        title="Click to toggle COD eligibility (ADR-004)"
                      >
                        {product.isCodAllowed ? 'COD Allowed' : 'Prepaid Only'}
                      </button>
                    </td>

                    {/* Active Visibility Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          product.isActive
                            ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                        title={product.isActive ? 'Active (Visible in Catalog)' : 'Hidden from Catalog'}
                      >
                        {product.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* View on PDP */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
                        title="View on Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
