import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { formatPrice } from '@/lib/utils';
import { getOrderByNumber } from '@/server/services/order.service';
import {
  createShipmentForOrder,
  getShipmentForOrder,
} from '@/server/services/shipping.service';
import { OrderTrackingTimeline } from '@/components/storefront/OrderTrackingTimeline';
import { PrintInvoiceButton } from './PrintInvoiceButton';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const isPaid = order.status === 'PAID';
  const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';
  const payment = order.payments[0];

  // Auto-manifest shipment for confirmed/paid order if not yet created (ADR-012)
  let shipment = await getShipmentForOrder(order.id);
  if (!shipment && (order.status === 'PAID' || order.status === 'CONFIRMED')) {
    try {
      shipment = await createShipmentForOrder(order.id, { autoAdvanceStatus: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[SHIPPING] Auto-manifest error:', msg);
    }
  }

  // Suppress the unused-variable check for isCod — it remains available for
  // future COD-specific messaging without re-deriving the flag.
  void isCod;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 sm:py-14">
        {/* Success header — editorial, no gradient banner */}
        <div className="print:hidden mb-10">
          <nav className="text-[11px] text-stone-500 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span className="text-foreground">Order confirmation</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
            <div className="max-w-2xl">
              <div className="eyebrow text-stone-500 mb-4 flex items-center gap-2">
                <span className="dot-rec" aria-hidden />
                {isPaid ? 'Payment confirmed & verified' : 'Order placed · Cash on delivery'}
              </div>
              <h1 className="display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] text-foreground">
                Order <em>confirmed.</em>
              </h1>
              <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Order{' '}
                <span className="font-mono text-foreground">#{order.orderNumber}</span>{' '}
                has been secured in our automated dispatch queue.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <PrintInvoiceButton />
              <Link href="/products" className="btn-ghost">
                Continue shopping
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live courier fulfillment & AWB tracking */}
        <div className="print:hidden mb-10">
          <OrderTrackingTimeline
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            carrier={shipment?.carrier || 'Delhivery Surface'}
            awbNumber={shipment?.awbNumber}
            trackingUrl={shipment?.trackingUrl}
            events={
              shipment?.events.map((e) => ({
                id: e.id,
                status: e.status,
                location: e.location,
                timestamp: e.timestamp.toISOString(),
                activity:
                  (e.payload as Record<string, unknown> | null)?.activity as string | undefined ||
                  e.status,
              })) || []
            }
          />
        </div>

        {/* GST TAX INVOICE DOCUMENT (print-friendly) */}
        <div
          id="tax-invoice-container"
          className="bg-card text-foreground border border-border p-6 sm:p-10 print:border-none print:p-0 print:m-0"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-border">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="display text-2xl leading-none text-foreground">
                  Patel<span className="text-[var(--brand)]">.</span>Networks
                </span>
                <span className="eyebrow text-stone-500">Mega-Tech</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-3 max-w-sm leading-relaxed">
                Authorized Surveillance Hardware &amp; Networking Distributor<br />
                Shop #4, Patel Commercial Complex, C.G. Road<br />
                Ahmedabad, Gujarat — 380009, India<br />
                GSTIN:{' '}
                <span className="font-mono text-foreground">24AABCP1234F1Z9</span>{' '}
                · State Code: 24 (Gujarat)<br />
                <a
                  href="mailto:billing@patelnetworks.in"
                  className="font-mono text-foreground link-underline"
                >
                  billing@patelnetworks.in
                </a>{' '}
                ·{' '}
                <a
                  href="tel:+919876543210"
                  className="font-mono text-foreground link-underline"
                >
                  +91 98765 43210
                </a>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="eyebrow text-stone-400 block mb-2">Original Tax Invoice</span>
              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                <div>
                  Invoice No:{' '}
                  <span className="font-mono text-foreground">{order.orderNumber}</span>
                </div>
                <div>
                  Invoice Date:{' '}
                  <span className="text-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  Payment Mode:{' '}
                  <span className="text-foreground">
                    {order.paymentMethod === 'RAZORPAY'
                      ? 'Online Gateway (Razorpay)'
                      : 'Cash on Delivery (COD)'}
                  </span>
                </div>
                <div>
                  Payment Status:{' '}
                  <span className={isPaid ? 'text-[var(--brand)]' : 'text-stone-500'}>
                    {order.status}
                  </span>
                </div>
                {payment?.gatewayPaymentId && (
                  <div>
                    Txn ID:{' '}
                    <span className="font-mono text-[11px] text-foreground">
                      {payment.gatewayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border text-xs text-stone-600 dark:text-stone-400">
            {/* Customer / Consignee */}
            <div>
              <div className="eyebrow text-stone-500 mb-2">Billed To</div>
              <p className="text-sm font-medium text-foreground">{order.customer.fullName}</p>
              {order.isB2B && order.companyName && (
                <div className="my-2 pt-2 border-t border-border text-xs space-y-1">
                  <div className="text-foreground">
                    <span className="text-stone-500">Company:</span> {order.companyName}
                  </div>
                  <div className="text-foreground">
                    <span className="text-stone-500">GSTIN:</span>{' '}
                    <span className="font-mono">{order.gstin}</span>
                  </div>
                  <div className="text-[var(--brand)] flex items-center gap-1.5">
                    <span className="dot-rec" /> Eligible for GSTR-2B Input Tax Credit (ITC)
                  </div>
                </div>
              )}
              <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                {order.shippingAddress.pincode}
                <br />
                <span className="font-mono">{order.shippingAddress.phone}</span>
              </p>
            </div>

            {/* Consignee / Dispatch */}
            <div>
              <div className="eyebrow text-stone-500 mb-2">Shipped To</div>
              <p className="text-sm font-medium text-foreground">
                {order.shippingAddress.recipientName}
              </p>
              <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                {order.shippingAddress.pincode}
                <br />
                Place of Supply:{' '}
                <span className="text-foreground">{order.shippingAddress.state}</span>
                <br />
                Reverse Charge: <span className="text-foreground">No</span>
              </p>
            </div>
          </div>

          {/* Tax Invoice Line Items */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-stone-500 text-[10px] uppercase tracking-wider border-b border-border">
                  <th className="py-2.5 px-2 text-center w-10 font-medium">#</th>
                  <th className="py-2.5 px-3 font-medium">Description</th>
                  <th className="py-2.5 px-2 text-center font-medium">HSN</th>
                  <th className="py-2.5 px-2 text-center font-medium">Qty</th>
                  <th className="py-2.5 px-3 text-right font-medium">Taxable</th>
                  <th className="py-2.5 px-3 text-right font-medium">GST 18%</th>
                  <th className="py-2.5 px-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item, idx) => {
                  const unitPrice = Number(item.unitPrice);
                  const qty = item.quantity;
                  const lineTotal = Number(item.totalPrice);
                  const gst = Number(item.taxAmount);
                  const taxableRate = unitPrice / 1.18;

                  return (
                    <tr key={item.id} className="hover:bg-accent/30">
                      <td className="py-3 px-2 text-center font-mono text-stone-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="text-foreground font-medium">{item.productName}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {item.variantName} · <span className="font-mono">{item.skuCode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-stone-500">8525</td>
                      <td className="py-3 px-2 text-center font-mono text-foreground">{qty}</td>
                      <td className="py-3 px-3 text-right font-mono text-foreground">
                        {formatPrice(taxableRate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-foreground">
                        {formatPrice(gst)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-foreground">
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals Summary */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-8">
            <div className="text-xs text-stone-600 dark:text-stone-400 max-w-sm space-y-3">
              <div>
                <div className="eyebrow text-stone-500 mb-1.5">Declaration &amp; Terms</div>
                <p className="text-[11px] leading-relaxed">
                  We declare that this invoice shows the actual price of the goods described and
                  that all particulars are true and correct. All surveillance hardware carries a
                  3-year warranty against manufacturing defects.
                </p>
              </div>
              <div className="text-[10px] text-stone-500 font-mono pt-2">
                Computer-generated tax invoice. No physical signature required.
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
                <span>Taxable base</span>
                <span className="font-mono text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
                <span>CGST (9.0%)</span>
                <span className="font-mono text-foreground">
                  {formatPrice(Number(order.gstAmount) / 2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
                <span>SGST (9.0%)</span>
                <span className="font-mono text-foreground">
                  {formatPrice(Number(order.gstAmount) / 2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
                <span>Shipping &amp; handling</span>
                <span className="text-[var(--brand)]">Free</span>
              </div>
              <div className="flex justify-between py-3 mt-1 border-t border-foreground text-foreground">
                <span className="text-sm font-medium">Grand total</span>
                <span className="text-lg font-mono text-[var(--brand)]">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Post-order Support */}
        <div className="print:hidden mt-10 pt-8 border-t border-border text-center">
          <div className="eyebrow text-stone-500 mb-2">Need assistance?</div>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Need technical assistance or custom installation wiring guidance? Our CCTV engineers
            are on standby.
          </p>
          <a
            href="tel:+919876543210"
            className="text-sm text-foreground link-underline inline-flex items-center gap-1.5 mt-3 font-mono"
          >
            +91 98765 43210
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand)]" />
          </a>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
