'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintInvoiceButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="btn-ink"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save Tax Invoice</span>
    </button>
  );
}
