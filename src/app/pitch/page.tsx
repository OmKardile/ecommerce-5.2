import React from 'react';
import {
  ShieldCheck, FileText, Truck, Wrench, Users, Package,
  BarChart3, Bell, ShoppingCart, Smartphone, Globe, Lock,
  CheckCircle2, ArrowRight, Sparkles, Building2, IndianRupee,
  Cpu, Camera, HardDrive, Cable, Boxes, Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Patel Networks — Business Pitch',
  description: 'Premium B2B + B2C e-commerce platform for commercial CCTV and security hardware. Built from scratch for the Indian market.',
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white py-20 lg:py-32">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Designed & Built by Omkar Kardile
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-medium leading-[1.05] tracking-tight mb-6">
            Surveillance infrastructure,<br />
            <span className="text-[#6080A0]">presented with exceptional taste.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            A premium B2B + B2C e-commerce platform for commercial CCTV and security
            hardware — built from scratch for the Indian market. Not Shopify. Not WordPress.
            A purpose-built system.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://patel-5-2.onrender.com" className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors">
              Visit the Store <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-white border-b border-[#E5E2DD] py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '33', label: 'Database Tables', icon: Database },
            { value: '25+', label: 'Routes & Pages', icon: Globe },
            { value: '18', label: 'Staff Permissions', icon: Lock },
            { value: '10+', label: 'Authorized Brands', icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-[#1E3A5F] mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-3xl font-bold text-[#1A1A1A]">{stat.value}</div>
              <div className="text-xs text-[#6B6B6B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-serif font-medium text-[#1A1A1A] tracking-tight mb-2 text-center">Everything Built In</h2>
          <p className="text-sm text-[#6B6B6B] text-center mb-16">Five interconnected systems, one unified platform.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                icon: ShoppingCart, title: 'Premium Storefront',
                points: ['Product catalogue with real-time stock levels', 'Interactive 5-step CCTV Kit Builder with bundle discount', 'B2B GST invoicing with GSTIN input tax credit', 'Dual payment: Razorpay + selective Cash on Delivery', 'Pincode delivery checker with COD eligibility', 'WhatsApp support integration'],
              },
              {
                icon: BarChart3, title: 'Operations Command Center',
                points: ['Live dashboard with KPIs, revenue, pending orders', 'Order fulfillment with 5-stage shipment tracking', 'Inventory management with movement audit trail', 'Customer directory with B2B/B2C segmentation', 'GSTR-1 tax analytics + CSV exports', 'Per-product COD eligibility rules'],
              },
              {
                icon: Package, title: 'Stock Monitor Employee Panel',
                points: ['Dedicated warehouse operations system', 'Real-time stock adjustments with reason logging', 'Auto-generated low-stock & out-of-stock alerts', 'Searchable movement log with CSV export', 'Batch physical count sessions with reconciliation', 'Separate from admin — isolated permissions'],
              },
              {
                icon: Users, title: 'Role-Based Access Control',
                points: ['SUPER_ADMIN: full access, can create other superadmins', 'STAFF: 18 dynamic permissions across 9 modules', 'Visual staff creation wizard with permission matrix', 'Admin sidebar filters by staff permissions', 'CUSTOMER: OTP-based phone login, account portal', 'Three isolated session systems (admin/staff/customer)'],
              },
              {
                icon: Cpu, title: 'Technical Architecture',
                points: ['Next.js 16 + React 19 + Turbopack', 'PostgreSQL 16 with Prisma ORM (33 tables)', 'JWT auth with separate session cookies', 'Edge proxy guards on all protected routes', 'Self-hosted: Docker + PgBouncer + Caddy + pm2', 'SEO: XML sitemap, robots.txt, JSON-LD structured data'],
              },
              {
                icon: Sparkles, title: 'Design Philosophy',
                points: ['Editorial premium aesthetic, not a template', 'Warm off-white + deep charcoal + restrained cobalt', 'Serif display typography for major statements', '3-level border hierarchy (structural/component/divider)', 'Dark mode toggle (Industrial Steel theme)', 'Mobile-first, tested at 375px viewport'],
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white border border-[#E5E2DD] p-6 lg:p-8 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">{feature.title}</h3>
                </div>
                <ul className="space-y-2">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" strokeWidth={1.5} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="bg-white border-y border-[#E5E2DD] py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-serif font-medium text-[#1A1A1A] tracking-tight mb-12 text-center">
            Why This Is Different
          </h2>
          <div className="overflow-hidden border border-[#E5E2DD] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F3F0EB] border-b border-[#E5E2DD]">
                  <th className="text-left py-4 px-6 font-semibold text-[#6B6B6B]">Feature</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#6B6B6B]">Typical Supplier</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#1E3A5F]">Patel Networks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DD]">
                {[
                  ['Catalogue', 'WhatsApp photos + Excel', 'Live web catalogue with real-time stock'],
                  ['Orders', 'Phone calls + manual entry', 'Online checkout with Razorpay/COD'],
                  ['Invoices', 'Manual GST bills', 'Auto-generated tax invoices with GSTIN'],
                  ['Inventory', 'Physical count + gut feeling', 'Digital stock with movement audit trail'],
                  ['Shipping', '"I\'ll send it tomorrow"', 'AWB generation + 5-stage tracking timeline'],
                  ['Staff access', 'Everyone sees everything', 'Role-based permissions, 18 granular controls'],
                  ['Kit building', 'Buy items separately', 'Interactive 5-step builder with bundle discount'],
                  ['Design', 'Generic WordPress/Shopify', 'Custom-built editorial premium design'],
                  ['Data ownership', 'Hosted on someone\'s server', 'Self-hosted on your own server'],
                ].map(([feature, typical, patel]) => (
                  <tr key={feature} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-6 font-medium text-[#1A1A1A]">{feature}</td>
                    <td className="py-3.5 px-6 text-[#9B9B9B]">{typical}</td>
                    <td className="py-3.5 px-6 text-[#1A1A1A] font-medium">{patel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== BRANDS ===== */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-sm font-medium text-[#6B6B6B] uppercase tracking-[0.15em] mb-8">
            Authorized Supply — Premier Security Brands
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {['CP Plus', 'Hikvision', 'Dahua', 'D-Link', 'Optilink', 'Lapcare', 'AOC', 'DGSoal', 'Axpial', 'MTC'].map((brand) => (
              <span key={brand} className="text-xl font-serif font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="bg-[#F3F0EB] py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-serif font-medium text-[#1A1A1A] tracking-tight mb-12 text-center">
            Six Disciplines of Security Hardware
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Camera, name: 'HD Analog Cameras', desc: '2MP to 16MP bullet & dome' },
              { icon: Cpu, name: 'Network IP Cameras', desc: 'PoE AI smart surveillance' },
              { icon: Boxes, name: 'DVR & NVR Recorders', desc: '4, 8 & 16 channel with AI' },
              { icon: HardDrive, name: 'Surveillance Storage', desc: '1TB to 8TB Seagate & WD' },
              { icon: Cable, name: 'CCTV & Cat6 Cables', desc: '305m drums & 3+1 HD' },
              { icon: Zap, name: 'Power & Accessories', desc: 'SMPS & BNC connectors' },
            ].map((cat) => (
              <div key={cat.name} className="bg-white border border-[#E5E2DD] p-6 rounded-lg text-center">
                <cat.icon className="w-8 h-8 text-[#1E3A5F] mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-sm font-bold text-[#1A1A1A]">{cat.name}</div>
                <div className="text-xs text-[#6B6B6B] mt-1">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-serif font-medium text-[#1A1A1A] tracking-tight mb-12 text-center">
            Business Benefits
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2, title: 'For the Store Owner',
                points: ['24/7 automated sales — no phone calls needed', 'GST compliance built into every order', 'Real inventory visibility — know what to reorder', 'Staff accountability — every movement logged', 'Scalable — add staff with specific permissions'],
              },
              {
                icon: Wrench, title: 'For B2B Installers',
                points: ['Bulk ordering with kit builder discounts', 'GST Input Tax Credit on every purchase', 'Full technical specs before buying', 'Real-time shipment tracking with AWB', 'Order history & invoices in one portal'],
              },
              {
                icon: Smartphone, title: 'For End Consumers',
                points: ['Genuine serial-tracked manufacturer warranty', 'Transparent GST-inclusive pricing', 'Razorpay prepaid or Cash on Delivery', 'Fast pan-India dispatch with WhatsApp updates', 'Order tracking from placement to delivery'],
              },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white border border-[#E5E2DD] p-6 lg:p-8 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-[#1E3A5F] flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">{benefit.title}</h3>
                <ul className="space-y-2">
                  {benefit.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" strokeWidth={1.5} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[#1A1A1A] text-white py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-medium tracking-tight mb-4">
            Ready to see it in action?
          </h2>
          <p className="text-sm text-white/60 mb-8">
            The platform is live and ready. Browse the catalogue, build a kit, place an order.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://patel-5-2.onrender.com" className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors">
              Visit the Store <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://patel-5-2.onrender.com/admin/login" className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
              Admin Demo
            </a>
            <a href="https://patel-5-2.onrender.com/stock/login" className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
              Stock Panel Demo
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1A1A1A] text-white/40 border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-xs">
            Designed & developed by <span className="text-white font-medium">Omkar Kardile</span> — Omkar Kardile
          </p>
          <p className="text-[10px] mt-1 text-white/30">
            Surveillance hardware procurement platform · India · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Database({ className }: { className?: string }) {
  return <Boxes className={className} />;
}
