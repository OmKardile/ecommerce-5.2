'use client';

import React, { useState } from 'react';
import { PhoneCall, MessageSquare } from 'lucide-react';
import { B2BQuoteModal } from './B2BQuoteModal';

interface B2BContractorCalloutProps {
  productName: string;
  skuCode?: string;
}

export function B2BContractorCallout({
  productName,
  skuCode,
}: B2BContractorCalloutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="border border-border bg-card p-5">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="eyebrow text-stone-500">Dealer Desk · Volume Pricing</span>
          {skuCode && (
            <span className="font-mono text-[10px] text-stone-400">{skuCode}</span>
          )}
        </div>

        <h4 className="display text-[18px] leading-snug text-foreground">
          Commercial contractor or system integrator?
        </h4>

        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed max-w-prose">
          Deploying 10+ units? Request wholesale project pricing and an
          automated WhatsApp quotation with formal GST tax invoicing.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-ink"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Request quote</span>
          </button>

          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 text-sm text-foreground link-underline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[var(--brand)]" />
            Dealer Desk · +91 98765 43210
          </a>
        </div>
      </div>

      <B2BQuoteModal
        productName={productName}
        skuCode={skuCode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
