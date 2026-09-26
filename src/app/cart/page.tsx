'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import {
  getCartAction,
  updateCartItemAction,
  removeFromCartAction,
} from '@/app/actions/cart.actions';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  Truck,
} from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    const data = await getCartAction();
    setCart(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    setUpdatingId(itemId);
    await updateCartItemAction(itemId, newQty);
    await fetchCart();
    setUpdatingId(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    await removeFromCartAction(itemId);
    await fetchCart();
    setUpdatingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Shopping Cart</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-sky-500" />
            Surveillance Hardware Cart
          </h1>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-semibold text-slate-500">Loading your cart items...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You haven&apos;t added any surveillance equipment or networking hardware yet.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/products"
                className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs"
              >
                Browse Surveillance Catalog
              </Link>
              <Link
                href="/kit-builder"
                className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Build Custom CCTV Kit
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        {item.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Variant: <strong>{item.variantName}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">SKU: {item.skuCode}</span>
                      </div>
                      <span className="block text-xs font-semibold text-slate-900 dark:text-white mt-1">
                        {formatPrice(item.unitPrice)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id || item.quantity >= item.availableStock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.lineTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingId === item.id}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Right 1 col) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Price Calculation
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Order Summary
                </h4>
              </div>

              <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="pt-2 flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxable Base Value:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Goods & Services Tax (18% GST):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.gstAmount)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping & Handling:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                </div>
                <div className="pt-3 flex justify-between text-lg font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-sky-600 dark:text-sky-400">{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              {/* B2B Input Credit Notice */}
              <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-[11px] space-y-1">
                <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" /> GST Input Tax Credit
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Claim back <strong>{formatPrice(cart.gstAmount)}</strong> in GST input credit by entering your company GSTIN during checkout.
                </p>
              </div>

              {/* COD Availability Warning */}
              {!cart.isCodAllowed && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] flex items-start gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    One or more items in your cart require online prepaid payment. Cash on Delivery is disabled for this order.
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
              >
                Proceed to Checkout ({cart.itemCount} Items) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
