'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  User,
  Package,
  Check,
  Loader2,
  Send,
} from 'lucide-react';
import { submitB2BQuoteInquiryAction } from '@/app/actions/whatsapp.actions';

interface B2BQuoteModalProps {
  productName: string;
  skuCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function B2BQuoteModal({
  productName,
  skuCode,
  isOpen,
  onClose,
}: B2BQuoteModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    messageId: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || quantity < 1) {
      setErrorMsg('Please fill in your name, contact mobile number, and quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await submitB2BQuoteInquiryAction({
        customerName: customerName.trim(),
        phone: phone.trim(),
        productName: skuCode ? `${productName} (${skuCode})` : productName,
        quantity: Number(quantity),
        companyName: companyName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setSubmittedData(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to submit quotation inquiry.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting quote request.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchWhatsApp = () => {
    const text = `Hi Patel Networks Dealer Desk, I just submitted an inquiry for ${quantity}x ${productName} (Ref: ${submittedData?.messageId}). Please provide wholesale project pricing.`;
    window.open(
      `https://wa.me/919876543210?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60">
      <div className="w-full max-w-lg bg-card border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow text-stone-500 block mb-2">
              B2B Commercial Dealer Desk
            </span>
            <h3 className="display text-[22px] leading-tight text-foreground">
              Request project bulk quotation
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 max-w-sm leading-relaxed">
              Unlock Tier-2 wholesale dealer pricing with formal GST tax invoicing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedData ? (
            <div className="py-2 space-y-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-5 h-5 flex items-center justify-center border border-[var(--brand)] text-[var(--brand)]">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <h4 className="display text-[18px] text-foreground leading-snug">
                    Quotation request dispatched.
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-sm leading-relaxed">
                    We have queued your inquiry for{' '}
                    <span className="font-mono text-foreground">{quantity} units</span>{' '}
                    of {productName}. A WhatsApp confirmation has been dispatched to
                    your mobile.
                  </p>
                </div>
              </div>

              <div className="border border-border bg-background p-3 text-left text-xs font-mono text-stone-500">
                <span className="eyebrow text-stone-400 block mb-1.5">
                  Inquiry Reference
                </span>
                <span className="text-foreground">{submittedData.messageId}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLaunchWhatsApp}
                  className="flex-1 btn-ink justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-ghost justify-center"
                >
                  Close window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="px-3 py-2.5 border border-destructive/40 bg-destructive/5 text-destructive text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Product context — hairline row */}
              <div className="border border-border bg-background p-3 flex items-center gap-3">
                <Package className="w-4 h-4 text-stone-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-foreground truncate">{productName}</div>
                  {skuCode && (
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      {skuCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contractor Name */}
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    Your full name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className={`${inputClass} pl-9`}
                    />
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    WhatsApp number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-stone-400 select-none font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className={`${inputClass} pl-11 font-mono`}
                    />
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    Security agency / company name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Patel Security Systems"
                      className={`${inputClass} pl-9`}
                    />
                    <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    Required quantity (units) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              {/* Project / Site Notes */}
              <div>
                <label className="eyebrow text-stone-500 block mb-2">
                  Site details / tender scope (optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 16-channel industrial factory deployment in Surat with outdoor night-vision requirements"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatching…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
