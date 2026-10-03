import React from 'react';
import Image from 'next/image';
import {
  ShoppingCart, BarChart3, Package, Users, Cpu, Sparkles,
  Check, ArrowRight, ArrowUpRight, ShieldCheck, Truck,
  FileText, Wrench, Building2, Smartphone, Camera, HardDrive,
  Cable, Boxes, Zap, Database, Lock, Globe,
} from 'lucide-react';

export const metadata = {
  title: 'Patel Networks — Showcase',
  description: 'A premium B2B + B2C e-commerce platform for commercial CCTV and security hardware. Built from scratch by Omkar Kardile.',
};

const stats = [
  { value: '33', label: 'DB Tables', sub: '9 domains' },
  { value: '26+', label: 'Routes', sub: 'storefront + admin + stock' },
  { value: '18', label: 'Permissions', sub: '9 modules' },
  { value: '3', label: 'Auth Systems', sub: 'isolated sessions' },
  { value: '10+', label: 'Brands', sub: 'authorized' },
  { value: '100%', label: 'Custom Built', sub: 'not a template' },
];

const systems = [
  { num: '01', icon: ShoppingCart, title: 'Storefront', desc: 'Product catalogue, cart, checkout, kit builder, OTP login', features: ['Real-time stock levels per SKU', '5-step CCTV Kit Builder with bundle discount', 'B2B GST invoicing with GSTIN ITC', 'Razorpay + selective COD', 'Pincode delivery checker', 'WhatsApp support integration'] },
  { num: '02', icon: BarChart3, title: 'Operations', desc: 'Admin command center for orders, inventory, customers', features: ['Live KPI dashboard (revenue, orders, stock)', 'Order fulfillment with 5-stage tracking', 'Inventory with movement audit trail', 'Customer directory (B2B/B2C)', 'GSTR-1 tax analytics + CSV export', 'Per-product COD eligibility rules'] },
  { num: '03', icon: Package, title: 'Warehouse', desc: 'Dedicated stock panel for warehouse staff', features: ['Real-time stock adjustments', 'Auto low-stock & out-of-stock alerts', 'Searchable movement log + CSV export', 'Batch physical count sessions', 'Reconciliation with variance tracking', 'Isolated from admin — own session'] },
  { num: '04', icon: Users, title: 'Access Control', desc: 'Role-based permissions with visual wizard', features: ['SUPER_ADMIN: full access, can create superadmins', 'STAFF: 18 dynamic permissions, 9 modules', 'Staff creation wizard with permission matrix', 'Sidebar filters by permissions', 'CUSTOMER: OTP phone login', '3 isolated JWT session cookies'] },
  { num: '05', icon: Cpu, title: 'Architecture', desc: 'Built for scale, security, self-hosting', features: ['Next.js 16 + React 19 + Turbopack', 'PostgreSQL 16 + Prisma ORM', 'JWT auth, edge proxy guards', 'Docker + PgBouncer + Caddy + pm2', 'XML sitemap, robots.txt, JSON-LD', 'ISR caching for performance'] },
];

const comparisons = [
  ['Catalogue', 'WhatsApp photos', 'Live web catalogue'],
  ['Orders', 'Phone calls', 'Online checkout'],
  ['Invoices', 'Manual bills', 'Auto GST invoices'],
  ['Inventory', 'Gut feeling', 'Digital audit trail'],
  ['Shipping', 'Tomorrow maybe', 'AWB + 5-stage tracking'],
  ['Staff', 'Everyone sees all', '18 granular permissions'],
  ['Kit building', 'Buy separately', '5-step builder + discount'],
  ['Design', 'WordPress template', 'Custom editorial premium'],
  ['Data', 'Someone else\'s server', 'Self-hosted VPS'],
];

const categories = [
  { icon: Camera, name: 'HD Analog Cameras', desc: '2MP–16MP' },
  { icon: Cpu, name: 'Network IP Cameras', desc: 'PoE AI' },
  { icon: Boxes, name: 'DVR & NVR', desc: '4–16 channel' },
  { icon: HardDrive, name: 'Storage', desc: '1TB–8TB' },
  { icon: Cable, name: 'Cables', desc: 'Cat6 + 3+1 HD' },
  { icon: Zap, name: 'Power', desc: 'SMPS + BNC' },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A1A1A] text-white">
        {/* Background image */}
        <Image
          src="/editorial/hero-camera-dark.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#8BAAC4] animate-pulse" />
            Designed & Built by Omkar Kardile
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-tight mb-6"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Surveillance infrastructure,
            <br />
            <span className="text-[#8BAAC4] italic">presented</span> with
            <br />
            exceptional taste.
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
            A complete B2B + B2C e-commerce platform for CCTV and security hardware.
            Not Shopify. Not WordPress. Built from scratch for India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://ecommerce-5-2.onrender.com"
              className="group inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-7 py-3.5 rounded-lg font-bold text-sm transition-transform hover:scale-105"
            >
              Visit Store
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#systems"
              className="inline-flex items-center gap-2 border border-white/15 px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Explore Systems
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white border-b border-[#E5E2DD] py-12 lg:py-16 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-1"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-[#1A1A1A]">{s.label}</div>
                <div className="text-[10px] text-[#9B9B9B] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SYSTEMS (alternating dark/light) ===== */}
      <section id="systems" className="py-0">
        {systems.map((sys, idx) => {
          const isDark = idx % 2 === 1;
          return (
            <div
              key={sys.num}
              className={isDark ? 'bg-[#1A1A1A] text-white py-20 lg:py-28 px-6 lg:px-10' : 'bg-[#FAF8F5] text-[#1A1A1A] py-20 lg:py-28 px-6 lg:px-10'}
            >
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  {/* Left: number + icon + title */}
                  <div className="lg:col-span-4">
                    <div
                      className={`text-6xl lg:text-7xl font-bold mb-4 ${isDark ? 'text-white/10' : 'text-[#1E3A5F]/15'}`}
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {sys.num}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-[#1E3A5F]'}`}>
                        <sys.icon className="w-5 h-5" strokeWidth={1.5} color={isDark ? '#8BAAC4' : '#fff'} />
                      </div>
                      <h3
                        className="text-xl lg:text-2xl font-medium tracking-tight"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {sys.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-[#6B6B6B]'} leading-relaxed`}>
                      {sys.desc}
                    </p>
                  </div>

                  {/* Right: features list */}
                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sys.features.map((f) => (
                        <div
                          key={f}
                          className={`flex items-start gap-3 p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-[#E5E2DD] bg-white'}`}
                        >
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#8BAAC4]' : 'text-[#1E3A5F]'}`} strokeWidth={2} />
                          <span className={`text-sm ${isDark ? 'text-white/70' : 'text-[#6B6B6B]'}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="bg-white border-y border-[#E5E2DD] py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl lg:text-4xl font-medium tracking-tight text-center mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Why this is different
          </h2>
          <p className="text-sm text-[#9B9B9B] text-center mb-12">Built differently from the ground up.</p>

          <div className="space-y-2">
            {comparisons.map(([feature, typical, ours], idx) => (
              <div
                key={feature}
                className="grid grid-cols-3 gap-4 items-center py-4 border-b border-[#F0EDE8] last:border-0"
              >
                <div className="text-sm font-semibold text-[#1A1A1A]">{feature}</div>
                <div className="text-sm text-[#9B9B9B] line-through decoration-[#9B9B9B]/40">{typical}</div>
                <div className="text-sm font-medium text-[#1E3A5F] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1E3A5F] shrink-0" strokeWidth={2} />
                  {ours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl lg:text-4xl font-medium tracking-tight text-center mb-12"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Six disciplines of security hardware
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white border border-[#E5E2DD] rounded-xl p-6 text-center hover:shadow-lg hover:border-[#1E3A5F] transition-all duration-300"
              >
                <cat.icon className="w-8 h-8 text-[#1E3A5F] mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-sm font-bold">{cat.name}</div>
                <div className="text-xs text-[#9B9B9B] mt-1">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRANDS ===== */}
      <section className="bg-[#1A1A1A] py-16 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium text-white/40 mb-8">
            Authorized supply
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {['CP Plus', 'Hikvision', 'Dahua', 'D-Link', 'Optilink', 'Lapcare', 'AOC', 'DGSoal', 'Axpial', 'MTC'].map((b) => (
              <span
                key={b}
                className="text-lg lg:text-xl font-medium text-white/40 hover:text-white transition-colors cursor-default"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-[#FAF8F5] py-24 lg:py-32 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl lg:text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            See it for yourself.
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-10 max-w-md mx-auto">
            The platform is live. Browse the catalogue, build a kit, log into the admin console.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://ecommerce-5-2.onrender.com"
              className="group inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-7 py-3.5 rounded-lg font-bold text-sm transition-transform hover:scale-105"
            >
              Visit Store
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://ecommerce-5-2.onrender.com/admin/login"
              className="inline-flex items-center gap-2 border border-[#D1CEC9] px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-[#F3F0EB] transition-colors"
            >
              Admin Demo
            </a>
            <a
              href="https://ecommerce-5-2.onrender.com/stock/login"
              className="inline-flex items-center gap-2 border border-[#D1CEC9] px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-[#F3F0EB] transition-colors"
            >
              Stock Panel
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1A1A1A] text-white/30 py-8 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs">
            Designed & developed by{' '}
            <a href="https://omkardile.is-a.dev/" className="text-white font-medium hover:underline">
              Omkar Kardile
            </a>
          </p>
          <p className="text-[10px] mt-1 text-white/20">
            Patel Networks · India · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
