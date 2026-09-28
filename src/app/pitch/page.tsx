import React from 'react';
import Image from 'next/image';
import {
  ShieldCheck, FileText, Truck, Wrench, Users, Package,
  BarChart3, Bell, ShoppingCart, Smartphone, Globe, Lock,
  CheckCircle2, ArrowRight, Sparkles, Building2,
  Cpu, Camera, HardDrive, Cable, Boxes, Zap,
  Database, Layout, Eye, Settings, TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'Patel Networks — Business Pitch',
  description: 'Premium B2B + B2C e-commerce platform for commercial CCTV and security hardware. Built from scratch for the Indian market.',
};

const features = [
  { icon: ShoppingCart, title: 'Premium Storefront', points: ['Product catalogue with real-time stock levels', 'Interactive 5-step CCTV Kit Builder with bundle discount', 'B2B GST invoicing with GSTIN input tax credit', 'Dual payment: Razorpay + selective Cash on Delivery', 'Pincode delivery checker with COD eligibility', 'WhatsApp support integration'] },
  { icon: BarChart3, title: 'Operations Command Center', points: ['Live dashboard with KPIs, revenue, pending orders', 'Order fulfillment with 5-stage shipment tracking', 'Inventory management with movement audit trail', 'Customer directory with B2B/B2C segmentation', 'GSTR-1 tax analytics + CSV exports', 'Per-product COD eligibility rules'] },
  { icon: Package, title: 'Stock Monitor Employee Panel', points: ['Dedicated warehouse operations system', 'Real-time stock adjustments with reason logging', 'Auto-generated low-stock & out-of-stock alerts', 'Searchable movement log with CSV export', 'Batch physical count sessions with reconciliation', 'Separate from admin — isolated permissions'] },
  { icon: Users, title: 'Role-Based Access Control', points: ['SUPER_ADMIN: full access, can create other superadmins', 'STAFF: 18 dynamic permissions across 9 modules', 'Visual staff creation wizard with permission matrix', 'Admin sidebar filters by staff permissions', 'CUSTOMER: OTP-based phone login, account portal', 'Three isolated session systems (admin/staff/customer)'] },
  { icon: Cpu, title: 'Technical Architecture', points: ['Next.js 16 + React 19 + Turbopack', 'PostgreSQL 16 with Prisma ORM (33 tables)', 'JWT auth with separate session cookies', 'Edge proxy guards on all protected routes', 'Self-hosted: Docker + PgBouncer + Caddy + pm2', 'SEO: XML sitemap, robots.txt, JSON-LD structured data'] },
  { icon: Sparkles, title: 'Design Philosophy', points: ['Editorial premium aesthetic, not a template', 'Warm off-white + deep charcoal + restrained cobalt', 'Serif display typography for major statements', '3-level border hierarchy (structural/component/divider)', 'Dark mode toggle (Industrial Steel theme)', 'Mobile-first, tested at 375px viewport'] },
];

const comparisons = [
  ['Catalogue', 'WhatsApp photos + Excel', 'Live web catalogue with real-time stock'],
  ['Orders', 'Phone calls + manual entry', 'Online checkout with Razorpay/COD'],
  ['Invoices', 'Manual GST bills', 'Auto-generated tax invoices with GSTIN'],
  ['Inventory', 'Physical count + gut feeling', 'Digital stock with movement audit trail'],
  ['Shipping', '"I\'ll send it tomorrow"', 'AWB generation + 5-stage tracking timeline'],
  ['Staff access', 'Everyone sees everything', 'Role-based permissions, 18 granular controls'],
  ['Kit building', 'Buy items separately', 'Interactive 5-step builder with bundle discount'],
  ['Design', 'Generic WordPress/Shopify', 'Custom-built editorial premium design'],
  ['Data ownership', 'Hosted on someone\'s server', 'Self-hosted on your own server'],
];

const categories = [
  { icon: Camera, name: 'HD Analog Cameras', desc: '2MP to 16MP bullet & dome' },
  { icon: Cpu, name: 'Network IP Cameras', desc: 'PoE AI smart surveillance' },
  { icon: Boxes, name: 'DVR & NVR Recorders', desc: '4, 8 & 16 channel with AI' },
  { icon: HardDrive, name: 'Surveillance Storage', desc: '1TB to 8TB Seagate & WD' },
  { icon: Cable, name: 'CCTV & Cat6 Cables', desc: '305m drums & 3+1 HD' },
  { icon: Zap, name: 'Power & Accessories', desc: 'SMPS & BNC connectors' },
];

const benefits = [
  { icon: Building2, title: 'For the Store Owner', points: ['24/7 automated sales — no phone calls needed', 'GST compliance built into every order', 'Real inventory visibility — know what to reorder', 'Staff accountability — every movement logged', 'Scalable — add staff with specific permissions'] },
  { icon: Wrench, title: 'For B2B Installers', points: ['Bulk ordering with kit builder discounts', 'GST Input Tax Credit on every purchase', 'Full technical specs before buying', 'Real-time shipment tracking with AWB', 'Order history & invoices in one portal'] },
  { icon: Smartphone, title: 'For End Consumers', points: ['Genuine serial-tracked manufacturer warranty', 'Transparent GST-inclusive pricing', 'Razorpay prepaid or Cash on Delivery', 'Fast pan-India dispatch with WhatsApp updates', 'Order tracking from placement to delivery'] },
];

const brands = ['CP Plus', 'Hikvision', 'Dahua', 'D-Link', 'Optilink', 'Lapcare', 'AOC', 'DGSoal', 'Axpial', 'MTC'];

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#1A1A1A] text-white overflow-hidden">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2C5282 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#8BAAC4]" />
            Designed & Built by Omkar Kardile
          </div>

          <h1
            className="text-[clamp(2.2rem,7vw,5.5rem)] font-medium leading-[0.98] tracking-tight mb-8"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Surveillance infrastructure,
            <br />
            <span className="text-[#8BAAC4] italic">presented</span> with
            <br />
            exceptional taste.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
            A premium B2B + B2C e-commerce platform for commercial CCTV and security
            hardware — built from scratch for the Indian market.
            Not Shopify. Not WordPress. A purpose-built system.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <a
              href="https://patel-5-2.onrender.com"
              className="group inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3.5 rounded-lg font-bold text-sm transition-transform hover:scale-105"
            >
              Visit the Store
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border border-white/15 px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Explore Features
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8 max-w-3xl mx-auto pt-8 border-t border-white/10">
            {[
              { v: '33', l: 'DB Tables', i: Database },
              { v: '26+', l: 'Routes', i: Globe },
              { v: '18', l: 'Permissions', i: Lock },
              { v: '10+', l: 'Brands', i: ShieldCheck },
              { v: '3', l: 'Auth Systems', i: Users },
              { v: '9', l: 'DB Domains', i: Boxes },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <s.i className="w-4 h-4 text-[#8BAAC4] mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-xl lg:text-2xl font-bold">{s.v}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ===== OVERVIEW BANNER ===== */}
      <section className="bg-white border-b border-[#E5E2DD] py-12 lg:py-16 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium leading-[1.15] tracking-tight mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            India's CCTV market is growing 30%+ annually.
            <br />
            <span className="text-[#1E3A5F]">Most suppliers still use WhatsApp + Excel.</span>
          </div>
          <p className="text-sm lg:text-base text-[#6B6B6B] max-w-2xl leading-relaxed">
            Patel Networks changes that. We've built a complete digital procurement platform —
            not a Shopify store, not a WordPress template — a purpose-built system designed
            specifically for how security hardware is bought and sold in India.
          </p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#A8743A] mb-3">Section 1</div>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-medium tracking-tight mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Everything Built In
            </h2>
            <p className="text-sm text-[#6B6B6B]">Five interconnected systems, one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="group bg-white border border-[#E5E2DD] p-7 lg:p-8 rounded-xl hover:border-[#1E3A5F] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#1E3A5F] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-[#6B6B6B] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="bg-white border-y border-[#E5E2DD] py-20 lg:py-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#A8743A] mb-3">Section 2</div>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-medium tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Why This Is Different
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#E5E2DD]">
            <table className="w-full text-sm" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="bg-[#F3F0EB]">
                  <th className="text-left py-4 px-4 sm:px-6 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Feature</th>
                  <th className="text-left py-4 px-4 sm:px-6 font-semibold text-[#6B6B6B] text-xs uppercase tracking-wider">Typical Supplier</th>
                  <th className="text-left py-4 px-4 sm:px-6 font-semibold text-[#1E3A5F] text-xs uppercase tracking-wider">Patel Networks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DD] bg-white">
                {comparisons.map(([f, t, p]) => (
                  <tr key={f} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#1A1A1A]">{f}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-[#9B9B9B]">{t}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#1A1A1A]">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="bg-[#F3F0EB] py-20 lg:py-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#A8743A] mb-3">Section 3</div>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-medium tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Six Disciplines
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.name} className="bg-white border border-[#E5E2DD] p-6 rounded-xl text-center hover:shadow-md transition-shadow">
                <c.icon className="w-8 h-8 text-[#1E3A5F] mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-xs text-[#6B6B6B] mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#A8743A] mb-3">Section 4</div>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-medium tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Business Benefits
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white border border-[#E5E2DD] p-7 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-5">
                  <b.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold mb-4">{b.title}</h3>
                <ul className="space-y-2.5">
                  {b.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRANDS ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#6B6B6B] mb-8">
            Authorized Supply — Premier Security Brands
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-base lg:text-xl font-medium text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors cursor-default"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #2C5282 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2
            className="text-[clamp(1.8rem,4vw,3.5rem)] font-medium tracking-tight mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Ready to see it in action?
          </h2>
          <p className="text-sm text-white/50 mb-10">
            The platform is live and ready. Browse the catalogue, build a kit, place an order.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://patel-5-2.onrender.com"
              className="group inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3.5 rounded-lg font-bold text-sm transition-transform hover:scale-105"
            >
              Visit the Store
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="https://patel-5-2.onrender.com/admin/login" className="inline-flex items-center gap-2 border border-white/15 px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
              Admin Demo
            </a>
            <a href="https://patel-5-2.onrender.com/stock/login" className="inline-flex items-center gap-2 border border-white/15 px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
              Stock Panel Demo
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1A1A1A] text-white/40 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs">
            Designed & developed by{' '}
            <a href="https://omkardile.is-a.dev/" className="text-white font-medium hover:underline">
              Omkar Kardile
            </a>
          </p>
          <p className="text-[10px] mt-1 text-white/30">
            Patel Networks · India · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
