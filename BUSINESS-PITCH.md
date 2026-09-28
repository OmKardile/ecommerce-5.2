# Patel Networks — Business Pitch

> **Surveillance infrastructure, presented with exceptional taste.**
> A premium B2B + B2C e-commerce platform for commercial CCTV and security hardware, built from scratch for the Indian market.

---

## The Opportunity

India's CCTV and surveillance market is growing at 30%+ annually. Installers, contractors, and businesses need a reliable source for genuine Hikvision, CP Plus, and Dahua hardware — with proper GST invoicing, fast dispatch, and technical support. Most existing suppliers operate through WhatsApp groups, Excel sheets, and cash transactions.

**Patel Networks changes that.** We've built a complete digital procurement platform — not a Shopify store, not a WordPress template — a purpose-built system designed specifically for how security hardware is bought and sold in India.

---

## What We've Built

### 1. Premium Storefront

A product-led e-commerce experience that feels like a curated catalogue, not an electronics shop.

- **Product catalogue** with real-time stock levels, SKU-level pricing, variant selectors (2MP / 4MP / 8MP / 16MP), and instant search by model number or brand
- **Interactive CCTV Kit Builder** — a 5-step configuration tool where customers pick their DVR/NVR, cameras, storage, and accessories, with automatic bundle discount calculation
- **B2B GST invoicing** — customers enter their GSTIN at checkout to claim 18% Input Tax Credit, with auto-generated tax invoices
- **Dual payment mode** — Razorpay (prepaid) + selective Cash on Delivery (with per-product COD eligibility rules)
- **Pincode delivery checker** — real-time COD + delivery estimation based on Indian pincode
- **WhatsApp support integration** — customers can reach the sales desk directly with pre-filled inquiry messages

### 2. Operations Command Center

A professional admin backend that replaces spreadsheets and phone calls.

- **Dashboard** with live KPIs — total orders, revenue, pending fulfillment, low-stock alerts, payment split
- **Order fulfillment console** — status transitions (PENDING → CONFIRMED → SHIPPED → DELIVERED), carrier AWB generation, 5-stage shipment tracking timeline
- **Inventory management** — SKU-level stock with concurrency-safe adjustments, movement audit trail (restock / dispatch / damage / return / manual correction), low-stock thresholds
- **Customer directory** — B2B/B2C segmentation, GSTIN records, total spend, order history
- **Commercial reports** — GSTR-1 tax analytics, payment split charts, daily sales trends, CSV exports
- **COD settings** — per-product COD eligibility rules with ceiling limits

### 3. Stock Monitor Employee Panel

A dedicated warehouse operations system — separate from the admin console.

- **Stock dashboard** with real-time inventory KPIs
- **Stock adjustments** — log movements (restock, dispatch, damage, return) with reason + notes
- **Alert management** — auto-generated low-stock and out-of-stock alerts with acknowledge/resolve workflow
- **Movement log** — searchable, filterable history of every stock change with CSV export
- **Count sessions** — batch physical inventory counts with expected vs counted reconciliation

### 4. Role-Based Access Control

Not everyone needs access to everything. The superadmin controls exactly who can do what.

- **SUPER_ADMIN** (store owner) — full access, can create other superadmins, manage staff accounts
- **STAFF** — dynamic permissions set per employee via a visual creation wizard (18 permissions across 9 modules: Dashboard, Orders, Products, Inventory, Customers, Reports, Stock Panel, Employees, Settings)
- **CUSTOMER** — OTP-based phone login, order tracking, account portal

### 5. Technical Architecture

Built for scale, security, and self-hosting.

- **Next.js 16** fullstack (React 19 + Turbopack + App Router)
- **PostgreSQL 16** with Prisma ORM (33 tables, 29 relational models)
- **JWT-based auth** with separate session cookies for admin, staff, and customer (3 isolated auth systems)
- **Edge proxy guards** on all protected routes
- **Self-hosted ready** — Docker + PgBouncer + Caddy + pm2 deployment guides for VPS or physical server
- **SEO optimized** — dynamic XML sitemap, robots.txt, JSON-LD structured data, ISR (Incremental Static Regeneration)

---

## Why This Is Different

| Feature | Typical Indian CCTV Supplier | Patel Networks |
|---|---|---|
| **Catalogue** | WhatsApp photos + Excel | Live web catalogue with real-time stock |
| **Orders** | Phone calls + manual entry | Online checkout with Razorpay/COD |
| **Invoices** | Manual GST bills | Auto-generated tax invoices with GSTIN |
| **Inventory** | Physical count + gut feeling | Digital stock with movement audit trail |
| **Shipping** | "I'll send it tomorrow" | AWB generation + 5-stage tracking timeline |
| **Customer support** | WhatsApp chaos | WhatsApp Cloud API integration + order tracking |
| **Staff management** | Trust everyone with everything | Role-based permissions, 18 granular controls |
| **Kit building** | "Buy these 5 items separately" | Interactive 5-step kit builder with bundle discount |
| **Design** | Generic WordPress/Shopify | Custom-built, editorial premium design |
| **Data ownership** | Hosted on someone else's server | Self-hosted on your own VPS/physical server |

---

## Business Benefits

### For the Store Owner

1. **24/7 automated sales** — customers browse, configure kits, and place orders without a phone call
2. **GST compliance built-in** — every order generates a proper GST invoice with GSTIN, HSN codes, and tax breakdown
3. **Real inventory visibility** — know exactly what's in stock, what's running low, and what needs reordering
4. **Staff accountability** — every stock movement is logged with who, when, and why
5. **Customer retention** — order tracking, account portal, WhatsApp notifications keep customers informed
6. **Scalable operations** — add staff with specific permissions as the business grows, no security risk

### For B2B Customers (Installers/Contractors)

1. **Bulk ordering** — configure complete surveillance kits online with bundle discounts
2. **GST Input Tax Credit** — claim 18% ITC on every purchase with proper B2B invoicing
3. **Technical specifications** — full spec sheets, model numbers, HSN codes visible before purchase
4. **Order tracking** — real-time shipment status with carrier AWB + WhatsApp updates
5. **Account history** — all past orders, invoices, and delivery details in one portal

### For End Consumers

1. **Genuine products** — serial-tracked, manufacturer-warranted hardware from authorized brands
2. **Transparent pricing** — GST-inclusive prices with MRP comparison and discount display
3. **Multiple payment options** — Razorpay (prepaid) or Cash on Delivery (where available)
4. **Fast dispatch** — pan-India logistics via Shiprocket + Delhivery with SMS/WhatsApp tracking

---

## Revenue Model

| Stream | How |
|---|---|
| **Product sales** | Margin on cameras, DVRs, NVRs, hard drives, cables, accessories |
| **Kit builder discount** | 5% bundle discount incentivizes larger cart values |
| **B2B contracts** | Bulk pricing for installers with GST invoicing |
| **Service revenue** (future) | Installation, AMC, technical consultation via WhatsApp desk |

---

## What's Ready vs What's Pending

### ✅ Ready Now
- Complete storefront (catalogue, cart, checkout, product detail)
- Admin command center (dashboard, orders, inventory, customers, reports, COD settings)
- Stock employee panel (dashboard, adjust, alerts, movements, count sessions)
- Role-based access control with staff creation wizard
- OTP customer authentication
- Razorpay integration (simulation mode — ready for live keys)
- WhatsApp Cloud API integration (simulation mode)
- Shiprocket/Delhivery shipping integration (simulation mode)
- GST invoicing + GSTR-1 reports
- Live on Render (auto-deploy on every git push)

### 🔶 Ready for Live Keys (Simulation Mode)
- Razorpay payment gateway — needs live API keys from dashboard.razorpay.com
- WhatsApp Cloud API — needs Meta Business Suite credentials
- Shiprocket shipping — needs Shiprocket account credentials
- SMS OTP gateway — needs MSG91/Fast2SMS API key

### 🚧 Future Phases
- **Live payment gateway** — procure Razorpay keys → activate
- **Live WhatsApp notifications** — procure Meta API credentials → activate
- **Live shipping + AWB** — procure Shiprocket account → activate
- **Live SMS OTP** — procure MSG91/Fast2SMS → activate
- **Product photography** — replace Unsplash stock images with real manufacturer product shots
- **Mobile app** (future) — React Native wrapper for the storefront
- **Multi-warehouse** (future) — if expanding to multiple locations

---

## Design Philosophy

This isn't a template. Every pixel was designed with intention.

- **Editorial premium aesthetic** — warm off-white surfaces, restrained cobalt accent, serif display typography for headlines, clean sans-serif for data
- **3-level visual hierarchy** — structural borders (sections), component borders (cards), subtle dividers (internal)
- **Responsive everywhere** — mobile-first design, tested at 375px viewport
- **Dark mode toggle** — "Industrial Steel" theme (warm charcoal + amber) available via nav toggle
- **Performance-first** — ISR caching, optimized images, minimal JavaScript

---

## Contact

**Omkar Kardile**
Patel Networks / MegaTech
📞 +91 98765 43210
✉️ sales@patelnetworks.com
🌐 https://patel-5-2.onrender.com

---

<p align="center">
<em>Designed & developed by Omkar Kardile — Patel Networks / MegaTech</em><br/>
<sub>Surveillance hardware procurement platform · India</sub>
</p>
