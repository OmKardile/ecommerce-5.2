'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { sendOtpAction, verifyOtpAction, getCurrentUserAction } from '@/app/actions/auth.actions';
import {
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit2,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // If already logged in, redirect.
  // setState is never called synchronously in the effect body — it happens
  // inside the async callback after the await resolves (or never on catch).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getCurrentUserAction();
        if (active && res.success && res.user) {
          router.push(redirectUrl);
        }
      } catch {
        // graceful
      }
    })();
    return () => {
      active = false;
    };
  }, [redirectUrl, router]);

  // Resend cooldown timer countdown — setState happens inside setInterval
  // (event-driven callback), not synchronously in the effect body.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]/.test(clean)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtpAction(clean);
      if (res.success) {
        setStep('OTP');
        setSuccessMsg(`6-digit verification code sent to +91 ${clean}`);
        if (res.testOtp) {
          setTestOtp(res.testOtp);
        }
        setResendCooldown(30); // 30s cooldown
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification code.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error communicating with SMS service.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter the 6-digit code received on your mobile.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtpAction(phone, cleanOtp);
      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.error || 'Invalid verification code entered.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error verifying code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-10 sm:my-16">
      {/* Header — editorial, centered */}
      <div className="mb-8 text-center">
        <div className="eyebrow text-stone-500 mb-4 flex items-center justify-center gap-2">
          <span className="dot-rec" aria-hidden />
          Patel Networks · Customer Portal
        </div>
        <h1 className="display text-[clamp(2rem,4.5vw,2.8rem)] leading-[1.02] text-foreground">
          Sign in with <em>phone OTP.</em>
        </h1>
        <p className="mt-3 text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
          Instant passwordless access via your mobile number and a 6-digit SMS code.
        </p>
      </div>

      {/* Card — hairline border, sharp corners */}
      <div className="border border-border bg-card p-7 sm:p-9">
        {/* Error feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 border border-rose-300/70 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success feedback */}
        {successMsg && (
          <div className="mb-5 p-3.5 border border-border bg-accent/40 text-foreground text-xs flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Test OTP helper banner (dev / placeholder mode) */}
        {testOtp && step === 'OTP' && (
          <div className="mb-5 p-3.5 border border-border bg-accent/40 text-xs flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow text-stone-500 mb-1">Developer Sandbox Mode</div>
              <div className="text-foreground">
                Test OTP:{' '}
                <strong className="font-mono text-base tracking-[0.3em] text-[var(--brand)]">
                  {testOtp}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(testOtp)}
              className="btn-ghost py-1.5 px-3 text-[11px]"
            >
              Auto-fill
            </button>
          </div>
        )}

        {step === 'PHONE' ? (
          /* STEP 1: ENTER PHONE NUMBER */
          <form onSubmit={handleSendOtp} className="space-y-7">
            <div>
              <label className="eyebrow text-stone-500 block mb-3">
                Indian Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-mono text-stone-400 select-none pointer-events-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-0 py-3 text-base font-mono tracking-wider bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                We will dispatch a secure 6-digit code to this mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching OTP…
                </>
              ) : (
                <>
                  Send verification code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-7">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="eyebrow text-stone-500 mb-1">Verifying</div>
                <span className="text-sm font-mono text-foreground">+91 {phone}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setOtpCode('');
                  setErrorMsg(null);
                }}
                className="text-xs text-foreground link-underline inline-flex items-center gap-1.5"
              >
                <Edit2 className="w-3 h-3" /> Change
              </button>
            </div>

            <div>
              <label className="eyebrow text-stone-500 block mb-3">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full px-0 py-3 text-center text-2xl tracking-[0.6em] font-mono bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-300 text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>Verify &amp; enter account</>
              )}
            </button>

            {/* Resend cooldown */}
            <div className="text-center pt-1">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-stone-500">
                  Resend code in{' '}
                  <span className="font-mono text-foreground">{resendCooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs text-foreground link-underline inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}

        {/* B2B contractor notice */}
        <div className="mt-7 pt-6 border-t border-border text-[11px] text-stone-500 leading-relaxed">
          <span className="eyebrow text-stone-400 block mb-2">B2B System Integrators</span>
          <p>
            Use your registered phone number to automatically load your company GSTIN and access
            your tax invoice archive.
          </p>
        </div>
      </div>

      {/* Continue as guest */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-foreground link-underline transition-colors"
        >
          Continue browsing as guest
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 lg:px-10 py-10">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mb-4" />
              <p className="text-xs text-stone-500">Loading authentication…</p>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
