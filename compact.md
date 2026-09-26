# Patel Networks — Compact System Reference (`compact.md`)

## 1. Stack & Architecture
* **Framework**: Next.js 15/16 App Router, TypeScript (Strict, 0 `any` types), Tailwind CSS v4.
* **Database**: PostgreSQL 16 on Supabase Cloud via Prisma ORM 6.19.3.
* **Storage Constraint**: **NO `.webp` browser recordings**.
* **Integrations (Dual-Mode Live + Deterministic Simulation)**:
  * **Razorpay**: Key/secret in `.env`; interactive test modal simulation on placeholder keys.
  * **Shiprocket / Delhivery**: AWB generation (`DELH...`, `BLUD...`) and webhook tracking state machine.
  * **WhatsApp Cloud API**: Meta Graph API HSM payloads, formatted terminal logs, and DB audit logging.

## 2. Invariants & Key ADRs
* **Hierarchy**: `Category ➔ Brand ➔ Product ➔ Variant ➔ SKU ➔ Inventory`. Stock tracked strictly at SKU level.
* **ADR-002**: Hybrid B2C & B2B Billing with 15-character GSTIN for 18% Input Tax Credit.
* **ADR-003 / ADR-011**: Mobile Number primary identity + 6-digit SMS OTP + Edge-compatible JWT session cookie (`pn_session`).
* **ADR-004**: Selective COD (₹15,000 ceiling, air-cargo exclusion, per-product disqualification).
* **ADR-006**: Interactive 5-Step CCTV Kit Builder with automatic 5% bundle discount.
* **ADR-010**: Row-level inventory locking inside Prisma interactive transactions.
* **ADR-012**: 6-digit Pincode Engine + Shiprocket/Delhivery AWB generation + 5-stage tracking timeline.
* **ADR-013**: WhatsApp Business Cloud API real-time lifecycle notifications & B2B inquiry modal.
* **ADR-014**: Admin Console (`/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/settings/cod`) + SKU stock adjustments + hardware serial tracking.
* **ADR-015**: Master Loopback Regression + Dynamic XML Sitemaps + Google Rich Snippet JSON-LD schemas.
* **ADR-016**: Public Policy Infrastructure (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`, `/contact`, `/about`, `/faq`).
* **ADR-017**: Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory (`/admin/customers`, `/admin/reports`).
* **ADR-018**: Storefront UI/UX Polish, Custom 404/Error Boundaries (`src/app/not-found.tsx`, `src/app/error.tsx`), and Admin CSV Export Engine (Orders & GSTR-1 tax data).
* **ADR-019**: Admin Command Center Authentication, Session Isolation (`pn_admin_session`) & Edge Middleware Guards (`/admin/login`).

## 3. Key Routes & Endpoints (26 Total Platform Endpoints Tested)
* **Storefront Core**: `/`, `/products`, `/products/[slug]`, `/kit-builder`, `/cart`, `/checkout`, `/account`, `/account/login`, `/order-success/[orderNumber]`.
* **Policy & Corporate**: `/about`, `/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`.
* **Admin Command Center**: `/admin/login`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/customers`, `/admin/reports`, `/admin/settings/cod`.
* **SEO & Protocols**: `/sitemap.xml`, `/robots.txt`.
* **Error Boundaries**: Custom branded `/not-found.tsx` (HTTP 404), `error.tsx` client recovery.
* **Webhooks**:
  * `POST /api/webhooks/razorpay` (Payment capture)
  * `POST /api/webhooks/shipping` (Tracking status sync)
  * `GET|POST /api/webhooks/whatsapp` (Meta verification & status callbacks)

## 4. Verification Commands
```bash
npx tsc --noEmit
npx tsx scripts/comprehensive_loopback_test.ts
npx tsx scripts/master_loopback_test.ts
```

## 5. Documentation Map
* `continue.md`: Universal AI & developer handoff guide, active operational status, credentials, and roadmap.
* `production-deployment-checklist.md`: Step-by-step production action plan for Supabase, Razorpay, Shiprocket, WhatsApp, and Vercel.
* `decisions.md`: All 19 Architectural Decision Records (ADR-001 – ADR-019).
* `review-test-followup.md`: Executive operations handover, production configuration guide, smoke test matrix.
* `changelog.md`: Full version release notes (v0.1.0 – v1.2.0).
* `technical-dcoumentation.md`: Exhaustive architecture, database models, transaction locks, and API specs.
* `business-documentation.md`: Commercial policies, B2B invoicing, selective COD, and RMA rules.
* `help.md`: Admin operator handbook, credentials reference, and GSTR-1 returns.





---

## Update (v1.9.0 — 2026-09-26)

### Current State
- **Live**: https://patel-5-2.onrender.com (Render auto-deploy on git push)
- **Database**: Supabase PostgreSQL (temporary, 412+ rows, read-only — will migrate to self-hosted VPS/physical server per ADR-022)
- **Design**: Cinematic VFX aesthetic — dark, immersive, parallax, particle grid, scroll-driven animations
- **GitHub**: https://github.com/OmKardile/patel-5.2

### Design Language
- **Direction**: Cinematic / VFX / ultra-parallax (client's explicit choice)
- **Hero**: Full-screen CinematicHero component — layered parallax (city bg + camera lens fg), animated particle grid, scroll-driven text fade+scale, staggered entrance, shimmer CTA
- **All sections**: Dark cinematic treatment with ParallaxSection component (sticky parallax bg images)
- **Color**: Near-black bg, white text, blue accent (var(--brand-soft) = #60A5FA dark / #1E40AF light)
- **Typography**: Fraunces serif (hero headline only), Geist sans (everything else), font-mono for numbers/SKUs
- **Motion**: fade-in-up, pulse-slow, scroll-line animations + Reveal component (up/mask/scale/stagger variants)

### Architecture
- Next.js 16.1.3 (pinned — 16.3.6 has /_global-error prerender bug)
- Build: `next build --webpack` (Turbopack has the same prerender bug)
- Start: `next start` (reads PORT env — was using standalone server.js which 502'd)
- proxy.ts (renamed from middleware.ts per Next.js 16 — runs on Node runtime, not Edge)
- NODE_ENV MUST be production (or unset) — non-standard values cause useContext crash

### Key Files
- `src/components/storefront/CinematicHero.tsx` — VFX hero
- `src/components/storefront/ParallaxSection.tsx` — sticky parallax bg
- `src/components/storefront/Reveal.tsx` — scroll animations (up/mask/scale/stagger)
- `src/components/storefront/ProductsFilterDrawer.tsx` — mobile filter drawer
- `src/hooks/use-parallax.ts` — scroll progress + parallax hooks
- `src/app/globals.css` — design tokens + cinematic animations
- `STOCK-PANEL-RESEARCH.md` — stock employee panel spec (NOT implemented)

### Deployment Guides
- `RENDER-DEPLOYMENT.md` — staging (auto-deploy on commit)
- `VPS-SETUP-GUIDE.md` — production on cloud VPS
- `PHYSICAL-SERVER-SETUP-GUIDE.md` — production on bare metal
- `ENVIRONMENT-VARIABLES-GUIDE.md` — every .env variable explained

### Verified
- All 23 routes HTTP 200/307
- Admin auth guards work (all /admin/* → 307 redirect to login)
- Customer auth guard works (/account → 307 redirect to login)
- robots.txt fixed (was 500, now 200)
- Mobile responsive: products page sidebar overflow fixed (drawer replaces sidebar on mobile)
- Lint: 0 errors, Typecheck: 0 errors, Build: exit 0
