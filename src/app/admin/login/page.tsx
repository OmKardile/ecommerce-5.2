'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminLoginAction } from '@/app/actions/admin-auth.actions';

/**
 * AdminLoginPage — operator login portal.
 *
 * Centered editorial dark card on the warm-ink background.
 * Hairline inputs (email + password with show/hide), btn-ink submit,
 * demo-credentials hint.
 *
 * Auth flow preserved exactly:
 *  - email/password/showPassword/errorMsg state
 *  - useTransition + adminLoginAction(formData)
 *  - success: router.push(redirectUrl) + router.refresh()
 *  - error: setErrorMsg
 *  - handleFillDemo restores default credentials
 *  - nextUrl from search params (default '/admin')
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('superadmin@patelnetworks.in');
  const [password, setPassword] = useState('patel@admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    formData.set('next', nextUrl);

    startTransition(async () => {
      try {
        const res = await adminLoginAction(formData);
        if (res.success && res.redirectUrl) {
          router.push(res.redirectUrl);
          router.refresh();
        } else {
          setErrorMsg(res.error || 'Authentication rejected. Please check your credentials.');
        }
      } catch {
        setErrorMsg('An unexpected error occurred during authentication. Please retry.');
      }
    });
  };

  const handleFillDemo = () => {
    setEmail('superadmin@patelnetworks.in');
    setPassword('patel@admin2026');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-12 px-4 sm:px-6 selection:bg-[var(--brand)] selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card text-[11px] uppercase tracking-[0.18em] font-medium text-stone-400 mb-6">
            <span className="dot-rec" aria-hidden />
            <span>Patel Networks Internal Portal</span>
          </div>
          <h1 className="font-sans text-[28px] sm:text-[32px] leading-none font-semibold tracking-tight text-foreground">
            Command Center Login
          </h1>
          <p className="mt-3 text-[12px] text-stone-500 max-w-sm mx-auto leading-relaxed">
            Restricted access for authorized surveillance logistics, warehouse inventory, and tax compliance personnel.
          </p>
        </div>

        {/* Login card */}
        <div className="mt-8 bg-card border border-border-strong p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 p-3 border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 text-[var(--destructive)] text-[11px] flex items-start gap-2.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="admin-email" className="eyebrow text-stone-400 mb-2 block">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@patelnetworks.in"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-background border border-border focus:border-border-strong text-sm text-foreground placeholder:text-stone-600 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="admin-password" className="eyebrow text-stone-400 mb-2 block">
                Secret Access Key
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-background border border-border focus:border-border-strong text-sm text-foreground placeholder:text-stone-600 transition-colors outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn-ink w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-400">
                <KeyRound className="w-3 h-3 text-[var(--brand)]" />
                <span>Default superadmin demo</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[var(--brand)] hover:text-[var(--brand-soft)] font-medium link-underline cursor-pointer transition-colors"
              >
                Autofill credentials
              </button>
            </div>
            <div className="border border-border bg-background px-3 py-2 font-mono text-[10px] text-stone-500 space-y-0.5">
              <div>
                <span className="text-stone-600">email&nbsp;·</span>{' '}
                <span className="text-stone-400">superadmin@patelnetworks.in</span>
              </div>
              <div>
                <span className="text-stone-600">pass&nbsp;·</span>{' '}
                <span className="text-stone-400">patel@admin2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security disclaimer */}
        <div className="mt-6 text-center text-[10px] text-stone-600 leading-relaxed">
          256-bit edge-signed JWT session. Unauthorized intrusion attempts are logged
          and monitored with IP verification.
        </div>
      </div>
    </div>
  );
}
