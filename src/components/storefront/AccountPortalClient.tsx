'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import {
  logoutAction,
  updateProfileAction,
  saveAddressAction,
  deleteAddressAction,
} from '@/app/actions/auth.actions';
import {
  Package,
  MapPin,
  Building2,
  LogOut,
  FileText,
  CheckCircle2,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  X,
} from 'lucide-react';

interface AccountPortalClientProps {
  user: {
    id: string;
    phone: string;
    role: string;
    customer: {
      id: string;
      fullName: string;
      companyName?: string | null;
      gstin?: string | null;
      isB2BVerified: boolean;
      addresses: Array<{
        id: string;
        recipientName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string | null;
        landmark?: string | null;
        city: string;
        state: string;
        pincode: string;
        isDefault: boolean;
        type: string;
      }>;
    };
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    isB2B: boolean;
    companyName?: string | null;
    gstin?: string | null;
    createdAt: string;
    shippingAddress: {
      recipientName: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      skuCode: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

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

export function AccountPortalClient({ user, orders }: AccountPortalClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESSES' | 'B2B'>('ORDERS');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.customer.fullName);
  const [profileCompany, setProfileCompany] = useState(user.customer.companyName || '');
  const [profileGstin, setProfileGstin] = useState(user.customer.gstin || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Gujarat');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfileAction({
        fullName: profileName,
        companyName: profileCompany,
        gstin: profileGstin,
      });
      setIsEditingProfile(false);
      triggerToast('Profile information updated successfully.');
      router.refresh();
    } catch {
      triggerToast('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrRecipient(user.customer.fullName);
    setAddrPhone(user.phone.replace('+91', ''));
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('Gujarat');
    setAddrPincode('');
    setAddrIsDefault(user.customer.addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrLine1.trim() || !addrCity.trim() || !/^\d{6}$/.test(addrPincode)) {
      alert('Please fill out all required address fields with a valid 6-digit PIN code.');
      return;
    }

    try {
      setSavingAddress(true);
      await saveAddressAction({
        id: editingAddressId || undefined,
        recipientName: addrRecipient.trim(),
        phone: addrPhone.startsWith('+91') ? addrPhone : `+91${addrPhone}`,
        addressLine1: addrLine1.trim(),
        addressLine2: addrLine2.trim() || undefined,
        city: addrCity.trim(),
        state: addrState,
        pincode: addrPincode.trim(),
        isDefault: addrIsDefault,
      });
      setIsAddressModalOpen(false);
      triggerToast('Address saved successfully.');
      router.refresh();
    } catch {
      triggerToast('Error saving address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await deleteAddressAction(id);
      triggerToast('Address removed.');
      router.refresh();
    } catch {
      triggerToast('Failed to delete address.');
    }
  };

  const tabs: Array<{ key: 'ORDERS' | 'ADDRESSES' | 'B2B'; label: string; count?: number; icon: React.ReactNode }> = [
    { key: 'ORDERS', label: 'Orders & shipments', count: orders.length, icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'ADDRESSES', label: 'Delivery addresses', count: user.customer.addresses.length, icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: 'B2B', label: 'B2B tax profile', icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-foreground text-background text-xs flex items-center gap-3 border border-foreground">
          <CheckCircle2 className="w-4 h-4 text-[var(--brand)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview — hairline card */}
      <section className="border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-rec" aria-hidden />
          <span className="eyebrow text-stone-500">Customer account</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Initial tile — solid ink, sharp */}
            <div className="w-14 h-14 flex items-center justify-center bg-foreground text-background display text-[24px] leading-none">
              {user.customer.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="display text-[26px] leading-none text-foreground">
                  {user.customer.fullName}
                </h1>
                {user.customer.gstin && (
                  <Badge variant="brand">B2B Verified</Badge>
                )}
              </div>
              <p className="text-xs text-stone-500 font-mono mt-2">
                {user.phone}
              </p>
              {user.customer.companyName && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {user.customer.companyName}
                  {user.customer.gstin && (
                    <span className="font-mono text-stone-400">
                      · GSTIN {user.customer.gstin}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="btn-ghost"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit profile'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost text-destructive hover:text-destructive"
              style={{ borderColor: 'var(--hairline-strong)' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            <div>
              <label className="eyebrow text-stone-500 block mb-2">Full name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="eyebrow text-stone-500 block mb-2">
                B2B company name (optional)
              </label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="Patel CCTV Integrators"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="eyebrow text-stone-500 block mb-2">
                15-character GSTIN (optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={profileGstin}
                onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                placeholder="24AABCP1234F1Z9"
                className="w-full px-3 py-2.5 text-sm font-mono uppercase bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Tabs — text labels with hairline underline active state */}
      <nav className="border-b border-border">
        <div className="flex items-center gap-6 -mb-px overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-stone-500 hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="font-mono text-[11px] text-stone-400 ml-1">
                    {String(tab.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* TAB 1: ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="border border-border bg-card p-12 text-center max-w-md mx-auto">
              <Package className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="display text-[20px] text-foreground">No orders placed yet</h3>
              <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Your past surveillance hardware orders and GST tax invoices will appear here.
              </p>
              <Link href="/products" className="inline-flex btn-ink mt-6">
                Browse surveillance catalog
              </Link>
            </div>
          ) : (
            orders.map((ord) => {
              const isPaid = ord.status === 'PAID';
              const isCancelled = ord.status === 'CANCELLED';
              return (
                <article
                  key={ord.id}
                  className="border border-border bg-card"
                >
                  {/* Header row */}
                  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-border">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-foreground">
                          #{ord.orderNumber}
                        </span>
                        <Badge
                          variant={
                            isPaid
                              ? 'success'
                              : isCancelled
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {ord.status}
                        </Badge>
                        {ord.isB2B && (
                          <Badge variant="tech">B2B tax invoice</Badge>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 mt-1.5 block font-mono">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="text-stone-300 dark:text-stone-600 mx-2">/</span>
                        {ord.paymentMethod === 'RAZORPAY' ? 'Online gateway' : 'Cash on delivery'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-mono text-foreground">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/order-success/${ord.orderNumber}`}
                          className="px-3 py-2 text-xs text-foreground hover:bg-accent border border-border hover:border-foreground transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>
                        <Link
                          href={`/order-success/${ord.orderNumber}`}
                          className="px-3 py-2 text-xs text-foreground hover:bg-accent border border-border hover:border-foreground transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </Link>
                      </div>
                    </div>
                  </header>

                  {/* Line items — hairline rows */}
                  <div className="px-6 py-2 divide-y divide-border">
                    {ord.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <div className="min-w-0 pr-4">
                          <span className="text-foreground">
                            <span className="font-mono text-stone-500 mr-1.5">{item.quantity}×</span>
                            {item.productName}
                          </span>
                          <span className="block text-[11px] text-stone-400 font-mono mt-0.5">
                            {item.variantName} · {item.skuCode}
                          </span>
                        </div>
                        <span className="font-mono text-foreground shrink-0">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer — shipping */}
                  <footer className="px-6 py-3 border-t border-border flex items-center justify-between text-[11px] text-stone-500 gap-4">
                    <span className="flex items-center gap-2 min-w-0">
                      <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        Dispatching to {ord.shippingAddress.recipientName}, {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.pincode})
                      </span>
                    </span>
                    <span className="text-[var(--brand)] shrink-0">Free express shipping</span>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'ADDRESSES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow text-stone-500 block mb-1">Dispatch directory</span>
              <h3 className="display text-[22px] text-foreground">Saved dispatch addresses</h3>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="btn-ink"
            >
              <Plus className="w-4 h-4" /> Add address
            </button>
          </div>

          {user.customer.addresses.length === 0 ? (
            <div className="border border-border bg-card p-10 text-center">
              <MapPin className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-sm text-stone-500">
                No saved addresses. Add one to enable express dispatch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
              {user.customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-card p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {addr.recipientName}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="brand">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      {addr.landmark && `, ${addr.landmark}`}
                      <br />
                      {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                      <br />
                      <span className="font-mono text-stone-500">{addr.phone}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-destructive hover:text-destructive font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: B2B TAX PROFILE */}
      {activeTab === 'B2B' && (
        <section className="border border-border bg-card p-6 sm:p-8 max-w-2xl space-y-6">
          <div>
            <span className="eyebrow text-stone-500 block mb-2">GSTR-2B Input Tax Credit</span>
            <h3 className="display text-[24px] text-foreground leading-tight">
              B2B business & GSTIN configuration
            </h3>
            <p className="text-sm text-stone-500 mt-2 max-w-prose leading-relaxed">
              Save your company GSTIN once to automatically populate legal B2B tax
              invoices for input tax credit on all future checkouts.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="eyebrow text-stone-500 block mb-2">
                Registered legal business / company name
              </label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="e.g. Patel Security Systems Pvt Ltd"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div>
              <label className="eyebrow text-stone-500 block mb-2">
                15-character Indian GSTIN
              </label>
              <input
                type="text"
                maxLength={15}
                value={profileGstin}
                onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                placeholder="24AABCP1234F1Z9"
                className="w-full px-3 py-2.5 text-sm font-mono uppercase bg-background border border-border text-foreground placeholder:text-stone-400 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div className="border border-border bg-background p-4 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="dot-rec" aria-hidden />
                <span className="eyebrow text-[var(--brand)]">18% GST input credit advantage</span>
              </div>
              <p className="text-[12px] leading-relaxed">
                When purchasing commercial surveillance cameras, NVRs, and Cat6
                cabling, your purchases generate a formal tax invoice filed under
                GSTR-1, enabling full credit offset on your business GST returns.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Save B2B GSTIN details
            </button>
          </form>
        </section>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
          <div className="bg-card border border-border shadow-sm max-w-lg w-full">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <span className="eyebrow text-stone-500 block mb-1">Dispatch directory</span>
                <h3 className="display text-[20px] text-foreground leading-none">
                  {editingAddressId ? 'Edit address' : 'Add new address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    Recipient name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">
                    Contact phone *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-sm font-mono bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-stone-500 block mb-2">
                  Street address / building *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label className="eyebrow text-stone-500 block mb-2">
                  Landmark / area (optional)
                </label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">State *</label>
                  <select
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="eyebrow text-stone-500 block mb-2">PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-sm font-mono bg-background border border-border text-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[var(--brand)]"
                />
                <label htmlFor="defaultCheck" className="text-xs text-stone-600 dark:text-stone-400">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {savingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
