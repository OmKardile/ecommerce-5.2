'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { formatPrice } from '@/lib/utils';
import {
  getCartAction,
  updateCartItemAction,
  removeFromCartAction,
} from '@/app/actions/cart.actions';
import {
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface CartItem {
  id: string;
  productName: string;
  brandName: string;
  variantName: string;
  skuCode: string;
  imageUrl: string;
  unitPrice: number | string;
  lineTotal: number | string;
  quantity: number;
  availableStock: number;
}
interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number | string;
  gstAmount: number | string;
  totalAmount: number | string;
  isCodAllowed: boolean;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  // loading defaults to true — the effect never calls setState synchronously
  // in its body, only inside the async callback after the await resolves.
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = (await getCartAction()) as CartData;
        if (active) {
          setCart(data);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const refetch = async () => {
    const data = (await getCartAction()) as CartData;
    setCart(data);
  };

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    setUpdatingId(itemId);
    await updateCartItemAction(itemId, newQty);
    await refetch();
    setUpdatingId(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    await removeFromCartAction(itemId);
    await refetch();
    setUpdatingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 sm:py-14">
        {/* Breadcrumb + heading */}
        <div className="mb-10">
          <nav className="text-[11px] text-stone-500 mb-3 flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span className="text-foreground">Cart</span>
          </nav>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="display text-[clamp(1.8rem,4vw,2.8rem)] leading-none text-foreground">
              Your cart
            </h1>
            {cart && cart.items.length > 0 && (
              <span className="eyebrow text-stone-500">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mb-4" />
            <p className="text-xs text-stone-500">Loading your cart…</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty state — editorial */
          <div className="border border-border bg-card p-12 sm:p-16 text-center max-w-lg mx-auto my-8">
            <div className="flex items-center justify-center mb-6">
              <span className="dot-rec" />
            </div>
            <h3 className="display text-2xl text-foreground">Your cart is empty</h3>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              You haven&apos;t added any surveillance equipment or networking hardware yet.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/products" className="btn-ink">
                Browse the catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/kit-builder" className="btn-ghost">
                Build a CCTV kit <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Items — editorial hairline rows */}
            <div className="lg:col-span-8">
              <div className="border-t border-border-strong">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-border py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="relative w-20 h-20 bg-card border border-border shrink-0 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="eyebrow text-stone-500 mb-1">{item.brandName}</div>
                        <Link
                          href={`/products`}
                          className="display text-lg text-foreground hover:text-[var(--brand)] transition-colors leading-tight"
                        >
                          {item.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500 flex-wrap">
                          <span>{item.variantName}</span>
                          <span className="text-stone-300 dark:text-stone-600">/</span>
                          <span className="font-mono">{item.skuCode}</span>
                        </div>
                        <div className="text-xs font-mono text-foreground mt-1">
                          {formatPrice(item.unitPrice)} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity + line total + remove */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 w-full sm:w-auto sm:min-w-[150px]">
                      <div className="flex items-center border border-border bg-background">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          disabled={updatingId === item.id}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-lg leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm font-mono text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id || item.quantity >= item.availableStock}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-lg leading-none"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-foreground">
                          {formatPrice(item.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingId === item.id}
                          className="text-stone-400 hover:text-foreground transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 mt-8 text-sm text-foreground link-underline"
              >
                Continue browsing <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Order summary — sticky */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="border border-border-strong bg-card p-7 space-y-6">
                <div>
                  <div className="eyebrow text-stone-500 mb-1">Order summary</div>
                  <div className="display text-xl text-foreground">Price calculation</div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Taxable base value</span>
                    <span className="font-mono text-foreground">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>GST (18%)</span>
                    <span className="font-mono text-foreground">{formatPrice(cart.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Shipping &amp; handling</span>
                    <span className="text-[var(--brand)]">Free</span>
                  </div>
                  <div className="pt-3 mt-1 border-t border-border-subtle flex justify-between items-baseline">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-xl font-mono text-[var(--brand)]">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* ITC notice */}
                <div className="p-3.5 border border-border bg-accent/40 text-[11px] space-y-1">
                  <div className="text-foreground font-medium flex items-center gap-1.5">
                    <span className="dot-rec" /> GST input tax credit
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    Claim back <strong className="font-mono">{formatPrice(cart.gstAmount)}</strong> in
                    GST input credit by entering your company GSTIN at checkout.
                  </p>
                </div>

                {/* COD warning */}
                {!cart.isCodAllowed && (
                  <div className="p-3 border border-amber-300/60 dark:border-amber-700/40 bg-amber-50/40 dark:bg-amber-950/20 text-[11px] flex items-start gap-2 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      One or more items require prepaid payment. Cash on delivery is disabled for this order.
                    </span>
                  </div>
                )}

                {/* Checkout — solid ink */}
                <Link
                  href="/checkout"
                  className="btn-ink w-full justify-center"
                >
                  Proceed to checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-[11px] text-center text-stone-500">
                  {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
