'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  Clock,
  Search,
  ExternalLink,
  Barcode,
  Save,
  Printer,
  ChevronDown,
  Building2,
  Download,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { formatInr } from '@/lib/utils';
import {
  adminTransitionOrderStatusAction,
  adminCreateShipmentAction,
  saveSerialNumbersAction,
} from '@/app/actions/admin.actions';

interface OrderItemData {
  id: string;
  skuId: string;
  productName: string;
  variantName: string;
  skuCode: string;
  quantity: number;
  unitPrice: number;
  serialNumbers: string[];
}

interface ShipmentSummary {
  id: string;
  carrier: string;
  awbNumber?: string | null;
  status: string;
  estimatedDelivery?: string | Date | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  gstAmount: number;
  paymentMethod: string;
  customerGstin?: string | null;
  customerPan?: string | null;
  companyName?: string | null;
  createdAt: string | Date;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: OrderItemData[];
  shipments: ShipmentSummary[];
}

interface Props {
  initialOrders: OrderData[];
}

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending Payment', value: OrderStatus.PENDING_PAYMENT },
  { label: 'COD Pending', value: OrderStatus.COD_PENDING },
  { label: 'Paid', value: OrderStatus.PAID },
  { label: 'Confirmed', value: OrderStatus.CONFIRMED },
  { label: 'Packed', value: OrderStatus.PACKED },
  { label: 'Shipped / In Transit', value: OrderStatus.SHIPPED },
  { label: 'Out for Delivery', value: OrderStatus.OUT_FOR_DELIVERY },
  { label: 'Delivered', value: OrderStatus.DELIVERED },
  { label: 'Cancelled', value: OrderStatus.CANCELLED },
];

// Statuses considered "live" — shown with the pulsing dot-rec indicator.
const LIVE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.CONFIRMED,
  OrderStatus.PACKED,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
]);

/**
 * Narrow an untyped shipment returned by `adminCreateShipmentAction` into the
 * shape our local `OrderData.shipments[]` expects — without resorting to
 * `as any`. All fields are coerced via standard `unknown`-narrowing.
 */
function toShipmentSummary(raw: unknown): ShipmentSummary {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid shipment payload returned from server action');
  }
  const rec = raw as Record<string, unknown>;
  const est = rec.estimatedDelivery;
  return {
    id: typeof rec.id === 'string' ? rec.id : String(rec.id ?? ''),
    carrier: typeof rec.carrier === 'string' ? rec.carrier : String(rec.carrier ?? ''),
    awbNumber:
      rec.awbNumber == null
        ? null
        : typeof rec.awbNumber === 'string'
        ? rec.awbNumber
        : String(rec.awbNumber),
    status: typeof rec.status === 'string' ? rec.status : String(rec.status ?? ''),
    estimatedDelivery:
      est == null
        ? null
        : est instanceof Date
        ? est
        : typeof est === 'string'
        ? est
        : String(est),
  };
}

export function OrderFulfillmentConsole({ initialOrders }: Props) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );

  // Serial Number editing state: { orderItemId: 'SN1, SN2' }
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter orders locally for fast response
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesOrderNo = order.orderNumber.toLowerCase().includes(q);
    const matchesRecipient =
      order.shippingAddress?.recipientName.toLowerCase().includes(q) || false;
    const matchesPhone = order.shippingAddress?.phone.includes(q) || false;
    const matchesAwb = order.shipments.some(
      (s) => s.awbNumber && s.awbNumber.toLowerCase().includes(q)
    );
    return matchesOrderNo || matchesRecipient || matchesPhone || matchesAwb;
  });

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setActionFeedback(null);
    startTransition(async () => {
      const res = await adminTransitionOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
        setActionFeedback(`Order advanced to ${nextStatus}`);
      } else {
        const msg = res.error || 'Failed to update order status';
        setActionFeedback(`Error: ${msg}`);
      }
    });
  };

  const handleCreateShipment = (orderId: string) => {
    setActionFeedback(null);
    startTransition(async () => {
      const res = await adminCreateShipmentAction(orderId);
      if (res.success && res.data) {
        const newShipment = toShipmentSummary(res.data);
        const awb = newShipment.awbNumber || '—';
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.PACKED,
                  shipments: [newShipment, ...o.shipments],
                }
              : o
          )
        );
        setActionFeedback(`Shipment booked · AWB ${awb}`);
      } else {
        const msg = res.error || 'Failed to create shipment';
        setActionFeedback(`Error: ${msg}`);
      }
    });
  };

  const handleSaveSerials = (orderItemId: string) => {
    const rawVal = serialInputs[orderItemId];
    if (rawVal === undefined) return;
    const serialArray = rawVal
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await saveSerialNumbersAction(orderItemId, serialArray);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => ({
            ...ord,
            items: ord.items.map((it) =>
              it.id === orderItemId ? { ...it, serialNumbers: serialArray } : it
            ),
          }))
        );
        setActionFeedback('Hardware serial numbers saved');
      } else {
        const msg = res.error || 'Failed to save serial numbers';
        setActionFeedback(`Error: ${msg}`);
      }
    });
  };

  const exportOrdersToCsv = () => {
    const headers = [
      'Order Number',
      'Date',
      'Recipient',
      'Phone',
      'City',
      'State',
      'Pincode',
      'GSTIN',
      'Total Amount (INR)',
      'GST Amount (INR)',
      'Status',
      'Payment Method',
      'AWB Number',
    ];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      `"${(o.shippingAddress?.recipientName || '').replace(/"/g, '""')}"`,
      o.shippingAddress?.phone || '',
      `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
      `"${(o.shippingAddress?.state || '').replace(/"/g, '""')}"`,
      o.shippingAddress?.pincode || '',
      o.customerGstin || '',
      o.totalAmount,
      o.gstAmount,
      o.status,
      o.paymentMethod,
      o.shipments[0]?.awbNumber || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patel_networks_orders_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background text-foreground space-y-6">
      {/* Console meta + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-strong pb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <span className="dot-rec" /> Fulfillment Console
          </div>
          <div className="text-xs font-mono text-stone-400">
            {orders.length} orders
            <span className="text-stone-600 mx-2">·</span>
            <span className="text-[var(--brand)]">{filteredOrders.length} shown</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] sm:w-80">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer, phone, or AWB"
              className="w-full pl-9 pr-3 h-9 bg-card border border-border text-xs text-foreground placeholder:text-stone-500 focus:outline-none focus:border-border-strong rounded-sm transition-colors font-sans"
            />
          </div>

          <button
            type="button"
            onClick={exportOrdersToCsv}
            title="Export filtered orders to CSV"
            className="btn-ghost text-xs"
            style={{ padding: '0.5rem 0.875rem' }}
          >
            <Download className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {actionFeedback && (
            <div className="px-3 py-1.5 border border-border bg-card text-[11px] text-foreground flex items-center gap-2 rounded-sm">
              <span className="dot-rec" aria-hidden />
              <span className="font-mono">{actionFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs — hairline pill row */}
      <div className="flex items-center gap-px overflow-x-auto scrollbar-thin border border-border bg-border -mt-2">
        {STATUS_FILTERS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-foreground text-background'
                  : 'bg-card text-stone-400 hover:text-foreground hover:bg-background/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List — hairline editorial rows */}
      <div className="border-t border-border-strong">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-2 border-b border-border-strong">
            <Package className="w-7 h-7 text-stone-600 mx-auto" />
            <p className="text-sm text-foreground">No orders matching your criteria.</p>
            <p>Adjust the search query or status filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const primaryShipment = order.shipments[0];
            const isLive = LIVE_STATUSES.has(order.status);
            const isCancelled = order.status === OrderStatus.CANCELLED;
            const isDelivered = order.status === OrderStatus.DELIVERED;

            return (
              <div key={order.id} className="border-b border-border">
                {/* Order Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-card/40 transition-colors"
                >
                  <div className="flex items-start md:items-center gap-4 min-w-0">
                    <div className="font-mono text-sm text-foreground shrink-0">
                      {order.orderNumber}
                    </div>
                    <div className="min-w-0">
                      {/* Status eyebrow */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`eyebrow flex items-center gap-1.5 ${
                            isCancelled
                              ? 'text-stone-500'
                              : isDelivered
                              ? 'text-foreground'
                              : 'text-[var(--brand)]'
                          }`}
                        >
                          {isLive && <span className="dot-rec" aria-hidden />}
                          {order.status}
                        </span>
                        {order.companyName && (
                          <span className="text-[10px] uppercase tracking-wider text-stone-400 border border-border px-1.5 py-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            B2B · ITC
                          </span>
                        )}
                      </div>

                      {/* Recipient meta */}
                      <div className="text-[11px] text-stone-400 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans">
                        <span className="text-foreground">
                          {order.shippingAddress?.recipientName}
                        </span>
                        <span className="text-stone-600">/</span>
                        <span className="font-mono">{order.shippingAddress?.phone}</span>
                        <span className="text-stone-600">/</span>
                        <span>
                          {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                        </span>
                        <span className="text-stone-600">/</span>
                        <span className="font-mono">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
                    <div className="text-right">
                      <div className="text-base font-mono text-foreground">
                        {formatInr(Number(order.totalAmount))}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {order.paymentMethod === 'RAZORPAY' ? 'Prepaid' : 'Cash on Delivery'}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-border-strong bg-card/30 space-y-6">
                    {/* Top Row: 3-panel grid with hairline separators */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border border border-border">
                      {/* Carrier & Shipment Panel */}
                      <div className="bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="eyebrow text-stone-500 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[var(--brand)]" />
                            Shipment &amp; AWB
                          </span>
                          {primaryShipment && (
                            <span className="text-[10px] font-mono text-[var(--brand)] border border-border-subtle px-1.5 py-0.5">
                              {primaryShipment.carrier}
                            </span>
                          )}
                        </div>

                        {primaryShipment ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-stone-500">AWB Tracking</span>
                              <span className="font-mono text-foreground bg-background border border-border-subtle px-2 py-0.5">
                                {primaryShipment.awbNumber || '—'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500">Courier State</span>
                              <span className="text-foreground font-medium">
                                {primaryShipment.status}
                              </span>
                            </div>
                            {primaryShipment.estimatedDelivery && (
                              <div className="flex items-center justify-between text-[11px] text-stone-500">
                                <span>Est. delivery</span>
                                <span className="font-mono">
                                  {new Date(
                                    primaryShipment.estimatedDelivery
                                  ).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-stone-400 leading-relaxed">
                              No carrier dispatch booked yet for this order.
                            </p>
                            <button
                              type="button"
                              disabled={isPending || order.status === OrderStatus.CANCELLED}
                              onClick={() => handleCreateShipment(order.id)}
                              className="btn-ink text-xs w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.625rem 1rem' }}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Generate AWB &amp; Book Courier
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status Transition Control */}
                      <div className="bg-card p-4 space-y-3">
                        <span className="eyebrow text-stone-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[var(--brand)]" />
                          Advance Order State
                        </span>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {(order.status === OrderStatus.PENDING_PAYMENT ||
                            order.status === OrderStatus.COD_PENDING) && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(order.id, OrderStatus.CONFIRMED)
                              }
                              className="btn-ink text-[11px] justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.5rem 0.875rem' }}
                            >
                              Confirm Order
                            </button>
                          )}

                          {(order.status === OrderStatus.CONFIRMED ||
                            order.status === OrderStatus.PAID) && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(order.id, OrderStatus.PACKED)
                              }
                              className="btn-ink text-[11px] justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.5rem 0.875rem' }}
                            >
                              Mark as Packed
                            </button>
                          )}

                          {order.status === OrderStatus.PACKED && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(order.id, OrderStatus.SHIPPED)
                              }
                              className="btn-ink text-[11px] justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.5rem 0.875rem' }}
                            >
                              Mark Dispatched
                            </button>
                          )}

                          {order.status === OrderStatus.SHIPPED && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(
                                  order.id,
                                  OrderStatus.OUT_FOR_DELIVERY
                                )
                              }
                              className="btn-ink text-[11px] justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.5rem 0.875rem' }}
                            >
                              Out for Delivery
                            </button>
                          )}

                          {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(order.id, OrderStatus.DELIVERED)
                              }
                              className="btn-ink text-[11px] justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                              style={{ padding: '0.5rem 0.875rem' }}
                            >
                              Mark Delivered
                            </button>
                          )}

                          {order.status !== OrderStatus.DELIVERED &&
                            order.status !== OrderStatus.CANCELLED && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  handleStatusChange(order.id, OrderStatus.CANCELLED)
                                }
                                className="text-[11px] justify-center px-3 py-2 border border-border text-stone-400 hover:border-border-strong hover:text-[var(--brand)] rounded-sm transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Cancel Order
                              </button>
                            )}
                        </div>

                        <div className="pt-2 border-t border-border-subtle">
                          <Link
                            href={`/order-success/${order.orderNumber}`}
                            target="_blank"
                            className="text-xs text-stone-400 hover:text-foreground flex items-center justify-between link-underline transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-[var(--brand)]" />
                              View / Print GST Invoice
                            </span>
                            <ExternalLink className="w-3 h-3 text-stone-500" />
                          </Link>
                        </div>
                      </div>

                      {/* B2B & Recipient Details */}
                      <div className="bg-card p-4 space-y-2">
                        <span className="eyebrow text-stone-500 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[var(--brand)]" />
                          Recipient &amp; Billing
                        </span>

                        <div className="space-y-1 text-xs text-stone-400 pt-1">
                          <div className="text-foreground font-medium">
                            {order.shippingAddress?.recipientName}
                          </div>
                          <div>
                            {order.shippingAddress?.addressLine1}
                            {order.shippingAddress?.addressLine2
                              ? `, ${order.shippingAddress.addressLine2}`
                              : ''}
                          </div>
                          <div>
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                            — {order.shippingAddress?.pincode}
                          </div>
                          <div className="font-mono text-stone-400">
                            Phone: {order.shippingAddress?.phone}
                          </div>

                          {order.customerGstin && (
                            <div className="pt-2 mt-1 border-t border-border-subtle">
                              <div className="text-foreground">
                                Firm: {order.companyName || 'B2B Enterprise'}
                              </div>
                              <div className="font-mono text-[11px] text-[var(--brand)]">
                                GSTIN: {order.customerGstin}
                              </div>
                              {order.customerPan && (
                                <div className="font-mono text-[11px] text-stone-500 mt-0.5">
                                  PAN: {order.customerPan}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items & Serial Numbers Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="eyebrow text-stone-500 flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-[var(--brand)]" />
                          Package Items &amp; Hardware Serials (RMA / Warranty)
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="border border-border-strong bg-card overflow-x-auto scrollbar-thin">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-border-subtle bg-background/30">
                            <tr>
                              <th className="eyebrow py-2.5 px-3 font-medium">Item</th>
                              <th className="eyebrow py-2.5 px-3 font-medium">SKU</th>
                              <th className="eyebrow py-2.5 px-3 font-medium text-center">
                                Qty
                              </th>
                              <th className="eyebrow py-2.5 px-3 font-medium text-right">
                                Unit Price
                              </th>
                              <th className="eyebrow py-2.5 px-3 font-medium">
                                Serial Numbers
                              </th>
                              <th className="eyebrow py-2.5 px-3 font-medium text-right">
                                Save
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {order.items.map((item) => {
                              const currentVal =
                                serialInputs[item.id] !== undefined
                                  ? serialInputs[item.id]
                                  : item.serialNumbers.join(', ');

                              return (
                                <tr
                                  key={item.id}
                                  className="hover:bg-background/30 transition-colors"
                                >
                                  <td className="py-3 px-3">
                                    <div className="text-foreground font-medium">
                                      {item.productName}
                                    </div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">
                                      {item.variantName}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand)]">
                                    {item.skuCode}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-foreground">
                                    {item.quantity}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono text-foreground">
                                    {formatInr(Number(item.unitPrice))}
                                  </td>
                                  <td className="py-3 px-3">
                                    <input
                                      type="text"
                                      value={currentVal}
                                      onChange={(e) =>
                                        setSerialInputs((prev) => ({
                                          ...prev,
                                          [item.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="e.g. SN-882941, SN-882942"
                                      className="w-full px-2.5 py-1.5 h-8 bg-background border border-border text-xs text-foreground placeholder:text-stone-600 font-mono focus:outline-none focus:border-border-strong rounded-sm transition-colors"
                                    />
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleSaveSerials(item.id)}
                                      className="px-2.5 py-1 text-[11px] text-foreground border border-border hover:border-border-strong hover:bg-background/40 rounded-sm transition-colors font-medium inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Save Serial Numbers"
                                    >
                                      <Save className="w-3 h-3" />
                                      Save
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
