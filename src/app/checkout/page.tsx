'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { formatPrice } from '@/lib/utils';
import { getCartAction } from '@/app/actions/cart.actions';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import {
  processCheckoutAction,
  confirmPaymentAction,
} from '@/app/actions/checkout.actions';
import { checkPincodeAction } from '@/app/actions/shipping.actions';
import { PincodeServiceability } from '@/lib/pincodes';
import {
  Truck,
  AlertCircle,
  CreditCard,
  Banknote,
  Check,
  ArrowRight,
  Loader2,
  XCircle,
  Lock,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
];

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeServiceability | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_DELIVERY'>('RAZORPAY');

  // B2B GSTIN States
  const [isB2B, setIsB2B] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  // Simulated Payment Modal State (ADR-007)
  const [simulatedModal, setSimulatedModal] = useState<{
    open: boolean;
    orderNumber: string;
    totalAmount: number;
    razorpayOrderId?: string;
  } | null>(null);
  const [simulatingProcessing, setSimulatingProcessing] = useState<boolean>(false);

  // Real-time Pincode Validation and COD eligibility check (ADR-012).
  // All setState calls happen inside the async callback (after await or in
  // the synchronous-but-nested IIFE body), never directly in the effect
  // body — keeps react-hooks/set-state-in-effect satisfied.
  useEffect(() => {
    let active = true;
    (async () => {
      if (/^[1-9][0-9]{5}$/.test(pincode)) {
        try {
          const res = await checkPincodeAction(pincode, cart?.total || 0);
          if (!active) return;
          if (res.success && res.data) {
            setPincodeInfo(res.data);
            if (!res.data.isCodAvailable && paymentMethod === 'CASH_ON_DELIVERY') {
              setPaymentMethod('RAZORPAY');
            }
          } else {
            setPincodeInfo(null);
          }
        } catch {
          if (active) setPincodeInfo(null);
        }
      } else {
        setPincodeInfo(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [pincode, cart?.total]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingCart(true);
        const data = await getCartAction();
        if (!active) return;
        setCart(data);
        if (data && !data.isCodAllowed) {
          setPaymentMethod('RAZORPAY');
        }

        // Check if user is logged in and prefill profile
        const userRes = await getCurrentUserAction();
        if (!active) return;
        if (userRes?.success && userRes.user) {
          const u = userRes.user;
          if (u.customer?.fullName && u.customer.fullName !== 'Valued Customer') {
            setRecipientName(u.customer.fullName);
          }
          if (u.phone) {
            setPhone(u.phone.replace('+91', ''));
          }
          const addrs = u.customer?.addresses || [];
          if (addrs.length > 0) {
            const defAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
            if (defAddr) {
              setAddressLine1(defAddr.addressLine1);
              if (defAddr.addressLine2) setAddressLine2(defAddr.addressLine2);
              setCity(defAddr.city);
              setState(defAddr.state);
              setPincode(defAddr.pincode);
            }
          }
          if (u.customer?.companyName || u.customer?.gstin) {
            setIsB2B(true);
            if (u.customer.companyName) setCompanyName(u.customer.companyName);
            if (u.customer.gstin) setGstin(u.customer.gstin);
          }
        }
      } catch {
        if (active) setErrorMessage('Failed to load cart for checkout.');
      } finally {
        if (active) setLoadingCart(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    // Client-side validations
    if (!recipientName.trim()) {
      setErrorMessage('Please enter recipient full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }
    if (!addressLine1.trim() || addressLine1.trim().length < 5) {
      setErrorMessage('Please provide a complete street address.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('Please enter city name.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (isB2B) {
      if (!companyName.trim()) {
        setErrorMessage('Please enter legal registered business name for B2B invoice.');
        return;
      }
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        setErrorMessage('Invalid 15-character GSTIN format (e.g. 24AAAAA0000A1Z5).');
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload = {
        cartId: cart.id,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        paymentMethod,
        isB2B,
        companyName: isB2B ? companyName.trim() : undefined,
        gstin: isB2B ? gstin.trim().toUpperCase() : undefined,
      };

      const result = await processCheckoutAction(payload) as {
        success: boolean;
        error?: string;
        orderNumber?: string;
        orderId?: string;
        paymentMethod?: string;
        totalAmount?: number;
        razorpayOrder?: { id: string; amount: number; isSimulated?: boolean } | null;
      };

      if (!result.success) {
        setErrorMessage(result.error || 'Checkout failed. Please check form inputs.');
        setSubmitting(false);
        return;
      }

      // If Cash On Delivery, redirect directly to order confirmation
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(`/order-success/${result.orderNumber}`);
        return;
      }

      // If Razorpay Online Payment
      if (result.razorpayOrder?.isSimulated) {
        // Open Simulated Payment Dialog (ADR-007)
        setSimulatedModal({
          open: true,
          orderNumber: result.orderNumber!,
          totalAmount: result.totalAmount!,
          razorpayOrderId: result.razorpayOrder.id,
        });
        setSubmitting(false);
      } else if (result.razorpayOrder) {
        // Live Razorpay Script Launch
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: result.razorpayOrder.amount,
          currency: 'INR',
          name: 'Patel Networks & MegaTech',
          description: `Order #${result.orderNumber}`,
          order_id: result.razorpayOrder.id,
          handler: async function (response: any) {
            await confirmPaymentAction({
              orderNumber: result.orderNumber!,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('cart-updated'));
            }
            router.push(`/order-success/${result.orderNumber}`);
          },
          prefill: {
            name: recipientName,
            email: email,
            contact: phone,
          },
          theme: {
            color: '#1E40AF',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
      setSubmitting(false);
    }
  };

  // Handle Simulated Payment Completion (ADR-007)
  const handleSimulatedPaymentSuccess = async () => {
    if (!simulatedModal) return;
    try {
      setSimulatingProcessing(true);
      const res = await confirmPaymentAction({
        orderNumber: simulatedModal.orderNumber,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpayOrderId: simulatedModal.razorpayOrderId,
        razorpaySignature: 'simulated_signature',
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(`/order-success/${simulatedModal.orderNumber}`);
      } else {
        setErrorMessage(res.error || 'Payment confirmation failed.');
        setSimulatingProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation error.');
      setSimulatingProcessing(false);
    }
  };

  const inputCls =
    'w-full bg-transparent border-b border-border focus:border-foreground focus:outline-none text-foreground text-sm py-2.5 placeholder:text-stone-400';
  const monoInputCls =
    'w-full bg-transparent border-b border-border focus:border-foreground focus:outline-none font-mono text-foreground text-sm py-2.5 tracking-wider placeholder:text-stone-400';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 sm:py-14">
        {/* Breadcrumb + heading */}
        <div className="mb-10">
          <nav className="text-[11px] text-stone-500 mb-3 flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="eyebrow text-stone-500 mb-3 flex items-center gap-2">
                <span className="dot-rec" />
                256-bit SSL · Verified GST invoicing · Pan-India dispatch
              </div>
              <h1 className="display text-[clamp(1.8rem,4vw,2.8rem)] leading-none text-foreground">
                Secure checkout & dispatch
              </h1>
            </div>
            <div className="text-xs text-stone-500 max-w-xs sm:text-right">
              Direct manufacturer warranty included. Real-time inventory locks applied on order placement.
            </div>
          </div>
        </div>

        {/* Step index — editorial hairline table-of-contents */}
        {!loadingCart && cart && cart.items.length > 0 && (
          <div className="border-t border-border mb-12">
            <div className="grid grid-cols-3 border-b border-border">
              {([
                ['01', 'Recipient & shipping'],
                ['02', 'B2B GST invoicing'],
                ['03', 'Payment method'],
              ] as const).map(([num, label], i) => (
                <div
                  key={num}
                  className={`py-4 px-3 ${i > 0 ? 'border-l border-border' : ''}`}
                >
                  <div className="font-mono text-xs text-stone-400 mb-1">{num}</div>
                  <div className="text-sm text-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingCart ? (
          <div className="py-32 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mb-4" />
            <p className="text-xs text-stone-500">Preparing your order details…</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty state — editorial */
          <div className="border border-border bg-card p-12 sm:p-16 text-center max-w-lg mx-auto my-8">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-stone-400" />
            </div>
            <h3 className="display text-2xl text-foreground">Cart is empty</h3>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              Your cart has no items to checkout. Add surveillance hardware before placing an order.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/products" className="btn-ink">
                Browse the catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/kit-builder" className="btn-ghost">
                Build a CCTV kit
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left col: forms */}
            <div className="lg:col-span-8 space-y-12">
              {/* Error */}
              {errorMessage && (
                <div className="p-4 border border-rose-300/70 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Checkout attention required</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 01 — Recipient & Shipping Address */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-3 border-b border-border">
                  <div>
                    <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                      <span className="font-mono">01</span>
                      <span className="text-stone-300 dark:text-stone-600">/</span>
                      <span>Step one</span>
                    </div>
                    <h2 className="display text-2xl text-foreground">Recipient & shipping address</h2>
                  </div>
                  <span className="hidden sm:block text-[11px] text-stone-500">Where we deliver your surveillance hardware</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Recipient name */}
                  <div>
                    <label className="block eyebrow text-stone-500 mb-2">Recipient full name *</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className={inputCls}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block eyebrow text-stone-500 mb-2">Mobile number (courier OTP) *</label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-stone-400">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={`flex-1 ${monoInputCls}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block eyebrow text-stone-500 mb-2">Email address (optional, for GST invoice PDF)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Address line 1 */}
                  <div className="sm:col-span-2">
                    <label className="block eyebrow text-stone-500 mb-2">Street address / flat / floor / building *</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Shop #4, Patel Complex, Station Road"
                      className={inputCls}
                    />
                  </div>

                  {/* Address line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block eyebrow text-stone-500 mb-2">Landmark / area (optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Near Sardar Chowk"
                      className={inputCls}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block eyebrow text-stone-500 mb-2">City / district *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ahmedabad"
                      className={inputCls}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block eyebrow text-stone-500 mb-2">State / UT *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-transparent border-b border-border focus:border-foreground focus:outline-none text-foreground text-sm py-2.5"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st} className="bg-background text-foreground">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block eyebrow text-stone-500 mb-2">PIN code (6 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="380001"
                      className={monoInputCls}
                    />
                  </div>

                  {/* Pincode serviceability banner */}
                  {pincodeInfo && (
                    <div className="sm:col-span-2 p-4 border border-border bg-card text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-stone-400 shrink-0" />
                        <span className="text-stone-600 dark:text-stone-400">
                          Est. delivery by{' '}
                          <strong className="text-[var(--brand)] font-medium">
                            {pincodeInfo.estimatedDeliveryDate}
                          </strong>{' '}
                          ({pincodeInfo.estimatedDaysMin}–{pincodeInfo.estimatedDaysMax} days via {pincodeInfo.carrierPartner})
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono shrink-0">
                        {pincodeInfo.city} · {pincodeInfo.isCodAvailable ? 'COD available' : 'Prepaid only'}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* 02 — B2B GST invoicing */}
              <section>
                <div className="flex items-start sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-border">
                  <div>
                    <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                      <span className="font-mono">02</span>
                      <span className="text-stone-300 dark:text-stone-600">/</span>
                      <span>Step two</span>
                    </div>
                    <h2 className="display text-2xl text-foreground">B2B GST invoicing</h2>
                    <p className="text-xs text-stone-500 mt-1">Claim 18% GST input credit on surveillance & networking purchases.</p>
                  </div>
                  {/* Sharp toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isB2B}
                    onClick={() => setIsB2B(!isB2B)}
                    className={`relative w-12 h-6 border border-border transition-colors shrink-0 ${
                      isB2B ? 'bg-foreground' : 'bg-transparent'
                    }`}
                    aria-label="Toggle B2B GST invoicing"
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 transition-transform ${
                        isB2B
                          ? 'translate-x-[24px] bg-background'
                          : 'translate-x-[2px] bg-foreground'
                      }`}
                    />
                  </button>
                </div>

                {isB2B ? (
                  <div className="space-y-6">
                    <div className="p-3.5 border border-border bg-accent/40 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed flex items-start gap-2.5">
                      <span className="dot-rec mt-1 shrink-0" />
                      <span>
                        Enter your registered GST details below. A formal GST tax invoice with HSN breakdown will be generated and filed under GSTR-1 for your direct input tax credit.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block eyebrow text-stone-500 mb-2">Registered business / company name *</label>
                        <input
                          type="text"
                          required={isB2B}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Patel Security Systems Pvt Ltd"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block eyebrow text-stone-500 mb-2">15-character Indian GSTIN *</label>
                        <input
                          type="text"
                          required={isB2B}
                          maxLength={15}
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="24AAAAA0000A1Z5"
                          className={`${monoInputCls} uppercase`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">
                    Buying for individual or home surveillance? Keep this disabled to generate a standard retail consumer tax invoice.
                  </p>
                )}
              </section>

              {/* 03 — Payment method */}
              <section>
                <div className="mb-6 pb-3 border-b border-border">
                  <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                    <span className="font-mono">03</span>
                    <span className="text-stone-300 dark:text-stone-600">/</span>
                    <span>Step three</span>
                  </div>
                  <h2 className="display text-2xl text-foreground">Payment method</h2>
                  <p className="text-xs text-stone-500 mt-1">Choose your preferred payment mode.</p>
                </div>

                {/* Sharp radio cards — selected = solid ink */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                  {/* Razorpay */}
                  <label
                    className={`flex flex-col p-5 cursor-pointer transition-colors ${
                      paymentMethod === 'RAZORPAY'
                        ? 'bg-foreground text-background'
                        : 'bg-background text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="RAZORPAY"
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Razorpay online
                      </span>
                      {paymentMethod === 'RAZORPAY' && <Check className="w-4 h-4" />}
                    </div>
                    <p className={`text-xs leading-relaxed ${paymentMethod === 'RAZORPAY' ? 'text-background/70' : 'text-stone-500'}`}>
                      UPI (GPay, PhonePe, Paytm), NetBanking (50+ banks), Credit / Debit cards, EMI & corporate cards.
                    </p>
                    <div className={`mt-3 pt-3 border-t ${paymentMethod === 'RAZORPAY' ? 'border-background/20' : 'border-border'} flex items-center justify-between text-[10px] uppercase tracking-[0.16em]`}>
                      <span className={paymentMethod === 'RAZORPAY' ? 'text-background/60' : 'text-stone-400'}>Recommended</span>
                      <span className="font-mono normal-case tracking-normal">Instant dispatch</span>
                    </div>
                  </label>

                  {/* COD */}
                  {(() => {
                    const isCodAvailableForOrder = Boolean(
                      cart.isCodAllowed && (!pincodeInfo || pincodeInfo.isCodAvailable)
                    );
                    return (
                      <label
                        className={`flex flex-col p-5 transition-colors ${
                          !isCodAvailableForOrder
                            ? 'bg-background text-stone-400 cursor-not-allowed'
                            : paymentMethod === 'CASH_ON_DELIVERY'
                            ? 'bg-foreground text-background cursor-pointer'
                            : 'bg-background text-foreground hover:bg-accent/50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CASH_ON_DELIVERY"
                            disabled={!isCodAvailableForOrder}
                            checked={paymentMethod === 'CASH_ON_DELIVERY'}
                            onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Banknote className="w-4 h-4" /> Cash on delivery
                          </span>
                          {paymentMethod === 'CASH_ON_DELIVERY' && <Check className="w-4 h-4" />}
                        </div>
                        <p className={`text-xs leading-relaxed ${paymentMethod === 'CASH_ON_DELIVERY' ? 'text-background/70' : !isCodAvailableForOrder ? 'text-stone-400' : 'text-stone-500'}`}>
                          {!cart.isCodAllowed
                            ? 'One or more items (e.g. bulky Cat6 drum or high-value NVR) require prepaid online payment.'
                            : pincodeInfo && !pincodeInfo.isCodAvailable
                            ? `COD restricted for PIN ${pincode} (${pincodeInfo.city} — special logistics / air cargo zone).`
                            : 'Pay via cash or UPI directly to the delivery agent on arrival.'}
                        </p>
                        <div className={`mt-3 pt-3 border-t ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-background/20' : 'border-border'} flex items-center justify-between text-[10px] uppercase tracking-[0.16em]`}>
                          <span className={!isCodAvailableForOrder ? 'text-stone-400' : paymentMethod === 'CASH_ON_DELIVERY' ? 'text-background/60' : 'text-stone-400'}>
                            {!isCodAvailableForOrder ? 'Unavailable' : 'Pay on arrival'}
                          </span>
                          <span className="font-mono normal-case tracking-normal">₹0 advance</span>
                        </div>
                      </label>
                    );
                  })()}
                </div>
              </section>
            </div>

            {/* Right col: sticky order summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="border border-border bg-card p-7 space-y-6">
                <div>
                  <div className="eyebrow text-stone-500 mb-1">Review & finalize</div>
                  <div className="display text-xl text-foreground">Order summary</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-background border border-border shrink-0 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{item.productName}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {item.quantity}× · {item.variantName}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-foreground shrink-0">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 text-xs pt-4 border-t border-border">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Taxable base value</span>
                    <span className="font-mono text-foreground">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>GST (18%)</span>
                    <span className="font-mono text-foreground">{formatPrice(cart.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Shipping & transit insurance</span>
                    <span className="text-[var(--brand)]">Free</span>
                  </div>
                  <div className="pt-3 mt-1 border-t border-border flex justify-between items-baseline">
                    <span className="text-foreground font-medium">Total amount</span>
                    <span className="text-xl font-mono text-[var(--brand)]">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 text-right">
                    All taxes & 18% GST included
                  </div>
                </div>

                {/* ITC notice */}
                <div className="p-3.5 border border-border bg-accent/40 text-[11px] space-y-1">
                  <div className="text-foreground font-medium flex items-center gap-1.5">
                    <span className="dot-rec" /> GST input tax credit
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    Claim back <strong className="font-mono">{formatPrice(cart.gstAmount)}</strong> in
                    GST input credit by entering your company GSTIN above.
                  </p>
                </div>

                {/* Place order — solid ink */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Securing order & inventory…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {paymentMethod === 'RAZORPAY'
                        ? `Pay ${formatPrice(cart.totalAmount)} online`
                        : `Place COD order (${formatPrice(cart.totalAmount)})`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Trust features */}
                <div className="pt-4 border-t border-border text-[11px] text-stone-500 space-y-1.5">
                  <div>3-year direct manufacturer replacement warranty</div>
                  <div>Express transit via Bluedart / Delhivery / DTDC</div>
                  <div>Compliant B2B tax invoice with HSN & GSTIN</div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Simulated Razorpay Payment Dialog (ADR-007) */}
      {simulatedModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4">
          <div className="bg-background border border-border max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                <span className="dot-rec" /> Razorpay sandbox
              </div>
              <h3 className="display text-xl text-foreground">Simulated payment portal</h3>
              <p className="text-[11px] text-stone-500 mt-1">
                ADR-007 · placeholder mode for end-to-end order lifecycle verification
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="border border-border bg-card p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order reference</span>
                  <span className="font-mono text-foreground">{simulatedModal.orderNumber}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-stone-500">Total payable</span>
                  <span className="text-lg font-mono text-[var(--brand)]">
                    {formatPrice(simulatedModal.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mode</span>
                  <span className="text-stone-600 dark:text-stone-400">Razorpay sandbox (placeholder)</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed text-center">
                Live Razorpay procurement is in progress. You can simulate an instant successful
                payment or cancel to verify order lifecycle transitions.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={simulatingProcessing}
                  onClick={handleSimulatedPaymentSuccess}
                  className="btn-ink w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {simulatingProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Capturing payment & generating invoice…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Simulate successful payment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={simulatingProcessing}
                  onClick={() => setSimulatedModal(null)}
                  className="btn-ghost w-full justify-center"
                >
                  Cancel / close simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
