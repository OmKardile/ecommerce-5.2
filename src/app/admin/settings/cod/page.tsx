import React from 'react';
import { getAdminProducts } from '@/server/services/admin.service';
import { ProductCatalogTable } from '@/components/admin/ProductCatalogTable';

export const revalidate = 0; // Dynamic server component

export default async function AdminCodSettingsPage() {
  const products = await getAdminProducts();

  const formatted = products.map((p) => {
    const firstSkuPrice = p.variants[0]?.sku ? Number(p.variants[0].sku.sellingPrice) : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      hsnCode: p.category.hsnCode || '8525',
      basePrice: firstSkuPrice,
      isActive: p.isActive,
      isCodAllowed: p.isCodAllowed,
      brand: { name: p.brand.name, slug: p.brand.slug },
      category: { name: p.category.name, slug: p.category.slug },
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku
          ? {
              id: v.sku.id,
              code: v.sku.code,
              inventory: v.sku.inventory
                ? {
                    currentStock: v.sku.inventory.currentStock,
                    reservedStock: v.sku.inventory.reservedStock,
                  }
                : null,
            }
          : null,
      })),
    };
  });

  // 3 policy rule cards
  const policyRules = [
    {
      index: '01',
      eyebrow: 'Order Value Ceiling',
      title: '₹15,000 hard cap',
      body: 'Orders exceeding ₹15,000 are automatically restricted to Prepaid (Razorpay). High-value enterprise CCTV kits and bulk reels of Cat6 cable require advance payment to prevent Return-To-Origin carrier losses.',
      enforced: 'checkout.actions.ts',
    },
    {
      index: '02',
      eyebrow: 'Air Cargo Postal Circles',
      title: 'Pincode routing',
      body: 'Remote postal circles (PIN prefix 79X, North-East, Island territories) shipped via air cargo do not accept COD. The checkout validates against the 6-digit Pincode Engine before showing payment options.',
      enforced: 'src/lib/pincodes.ts',
    },
    {
      index: '03',
      eyebrow: 'Cart Disqualification',
      title: 'Per-item policy',
      body: 'If any single item in the buyer\'s cart is marked isCodAllowed=false below, the entire cart switches to Prepaid-only mode. Per-product policy is configurable in the table below.',
      enforced: 'configurable below',
    },
  ];

  return (
    <div className="dark bg-background text-foreground space-y-10 min-h-screen">
      {/* Page header */}
      <div className="border-b border-[#2A2823] pb-6">
        <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
          <span className="dot-rec" /> ADR-004 · Selective COD
        </div>
        <h1 className="text-2xl font-sans font-semibold text-foreground tracking-tight">
          Cash on Delivery policies
        </h1>
        <p className="text-sm text-stone-400 mt-2 max-w-2xl leading-relaxed">
          Configure risk-mitigation rules, order-value ceilings, postal zone boundaries, and
          per-item COD eligibility toggles. All rules enforced at checkout.
        </p>
      </div>

      {/* Policy rules — hairline editorial cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2823] border border-[#2A2823] rounded-sm overflow-hidden">
        {policyRules.map((rule) => (
          <div key={rule.index} className="bg-card p-6 flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono text-[11px] text-stone-500">RULE / {rule.index}</span>
              <span className="font-mono text-[10px] text-[var(--brand)] border border-[var(--brand)]/40 px-2 py-0.5 rounded-sm">
                active
              </span>
            </div>
            <div className="eyebrow text-stone-500 mb-1.5">{rule.eyebrow}</div>
            <h2 className="text-base font-sans font-medium text-foreground tracking-tight mb-3">
              {rule.title}
            </h2>
            <p className="text-[12px] text-stone-400 leading-relaxed flex-1">{rule.body}</p>
            <div className="mt-4 pt-4 border-t border-[#2A2823]">
              <div className="eyebrow text-stone-500 mb-1">Enforced</div>
              <code className="font-mono text-[11px] text-foreground">{rule.enforced}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Per-Product COD switcher */}
      <div className="space-y-4">
        <div className="border-b border-[#2A2823] pb-3 flex items-baseline justify-between gap-4">
          <div>
            <div className="eyebrow text-stone-500 mb-1.5">Per-Product Eligibility</div>
            <h2 className="text-base font-sans font-semibold text-foreground tracking-tight">
              Cash on Delivery toggles
            </h2>
          </div>
          <p className="text-[11px] text-stone-500 max-w-sm text-right">
            Toggle the COD column for each product to switch its eligibility.
          </p>
        </div>

        <ProductCatalogTable initialProducts={formatted} />
      </div>
    </div>
  );
}
