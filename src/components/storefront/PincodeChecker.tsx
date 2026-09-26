'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { checkPincodeAction } from '@/app/actions/shipping.actions';
import { PincodeServiceability } from '@/lib/pincodes';

interface PincodeCheckerProps {
  orderTotal?: number;
  className?: string;
  onPincodeValidated?: (info: PincodeServiceability) => void;
}

export function PincodeChecker({
  orderTotal = 0,
  className = '',
  onPincodeValidated,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<PincodeServiceability | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore saved pincode from previous session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pn_customer_pincode');
      if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
        setPincode(saved);
        handleCheck(saved);
      }
    }
  }, []);

  const handleCheck = async (pinToCheck?: string) => {
    const targetPin = (pinToCheck || pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(targetPin)) {
      setErrorMsg('Enter a valid 6-digit Indian PIN code');
      setServiceInfo(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await checkPincodeAction(targetPin, orderTotal);

      if (res.success && res.data) {
        setServiceInfo(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pn_customer_pincode', targetPin);
          window.dispatchEvent(
            new CustomEvent('pincode-selected', { detail: res.data })
          );
        }
        if (onPincodeValidated) {
          onPincodeValidated(res.data);
        }
      } else {
        setErrorMsg(res.error || 'Pincode not serviceable.');
        setServiceInfo(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error validating delivery location.';
      setErrorMsg(msg);
      setServiceInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      handleCheck(val);
    } else {
      setServiceInfo(null);
      setErrorMsg(null);
    }
  };

  return (
    <div className={`border border-border bg-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="pincode-input"
          className="eyebrow text-stone-500 flex items-center gap-2"
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--brand)]" /> Check delivery & COD
        </label>
        {serviceInfo && (
          <span className="text-[11px] font-mono text-foreground">
            {serviceInfo.city} · {serviceInfo.state}
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <input
            id="pincode-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter 6-digit PIN (e.g. 395003)"
            value={pincode}
            onChange={handleInputChange}
            className="w-full text-sm font-mono py-2.5 px-3 bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleCheck()}
          disabled={loading || pincode.length !== 6}
          className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none shrink-0"
        >
          Check
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="mt-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Validated results — hairline data rows */}
      {serviceInfo && (
        <div className="mt-4 pt-4 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow text-stone-500">Est. delivery</span>
            <span className="font-mono text-foreground">
              {serviceInfo.estimatedDeliveryDate}
              <span className="text-stone-500 ml-2">
                ({serviceInfo.estimatedDaysMin}–{serviceInfo.estimatedDaysMax} days)
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow text-stone-500">Cash on delivery</span>
            <span className="flex items-center gap-1.5 font-medium">
              {serviceInfo.isCodAvailable ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span className="text-foreground">Available</span>
                </>
              ) : (
                <span className="text-stone-500">Prepaid only · special zone</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow text-stone-500">Carrier partner</span>
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-400" />
              {serviceInfo.carrierPartner}
            </span>
          </div>

          {serviceInfo.notes && (
            <p className="text-[11px] text-stone-500 leading-relaxed pt-2 border-t border-border mt-3">
              {serviceInfo.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
