---
**Task ID**: 3-DOCS
**Agent**: Explore (research-only, no repo modifications)
**Task**: Analyze the cloned `patelnetworks-study` repo (CCTV Security E-commerce platform "Patel Networks / MegaTech") — read all documentation, explore `src/`, `prisma/schema.prisma`, `supabase/`, `scripts/`, `.env.example`, and `git log --stat`; produce a comprehensive briefing for the lead developer.

---

## Work Log (actions performed)

1. Verified worklog.md did not yet exist at `/home/z/my-project/worklog.md` — creating new file (append-mode initial creation).
2. Listed repo root `/home/z/patelnetworks-study/` and confirmed presence of all 13 markdown docs + `CCTV_Security_Ecommerce_Website_Plan.docx` + `package.json` (Next.js 16.3.6) + `prisma/` + `supabase/` + `scripts/` + `src/` + `.env.example`.
3. Read in full: `README.md`, `changelog.md` (336 lines), `decisions.md` (491 lines, all 19 ADRs), `technical-dcoumentation.md` (1178 lines, the typo'd filename is the real one), `technical-documentation.md` (5-line stub), `business-documentation.md` (348 lines), `continue.md` (234 lines), `compact.md` (57 lines), `help.md` (136 lines), `review-test-followup.md` (200 lines), `production-deployment-checklist.md` (252 lines), `AGENTS.md`, `CLAUDE.md`.
4. Listed `src/` recursively (69 source files total) — confirmed layout uses **flat** `src/app/<route>/` structure (NOT `(storefront)` / `(admin)` route groups despite README claims). Read `src/middleware.ts`, `src/server/db/index.ts`, `src/lib/utils.ts`, `src/lib/pincodes.ts`, `src/app/layout.tsx`, `next.config.ts`, `package.json`, `scripts/comprehensive_loopback_test.ts`, `scripts/check_locks.ts`, `prisma/seed.ts`.
5. Read `prisma/schema.prisma` completely (534 lines) — confirmed exactly **29 models** + **5 enums**, all with `@@map` directives to snake_case Supabase tables.
6. Read `supabase/config.toml` (415 lines, default Supabase CLI scaffold, `project_id = "patelnetworks"`, db major_version 17). Verified NO `supabase/migrations/` folder exists.
7. Listed `scripts/` — 8 TypeScript test scripts. Identified `verify_phase3.ts`–`verify_phase7.ts`, `comprehensive_loopback_test.ts`, `master_loopback_test.ts`, `check_locks.ts`.
8. Read `.env.example` — confirmed all required env vars (DB, JWT, Razorpay, WhatsApp, Shiprocket, SMS, Cloudinary).
9. Ran `git log --stat` and `git log --oneline` — 12 commits, all dated 2026-09-26, authored by Omkar Kardile.
10. Verified `supabase/.temp/cli-latest` contains `v2.118.0` (Supabase CLI version marker).

---

## Stage Summary: Comprehensive Research Report

# Patel Networks / MegaTech — Repo Analysis Report (Task 3-DOCS)

## 1. Documentation Analysis

### 1.1 `README.md` (184 lines, 14 KB)
- **Project overview**: Unified Next.js fullstack CCTV/surveillance e-commerce platform serving B2C retail + B2B contractors/installers in India.
- **Brand alliances**: Hikvision, Dahua, CP Plus, MTC, D-Link, DGSoal, Axpial, Optilink, Lapcare, AOC.
- **Three-layer architecture**: (1) Customer Storefront, (2) Back-office Admin Portal, (3) Core Server Services.
- **Tech stack table**: Next.js App Router + Tailwind/Radix + TS strict + PostgreSQL 16/Prisma + Razorpay + Selective COD + Shiprocket/Delhivery + Phone OTP (Fast2SMS/MSG91/Firebase) + Cloudinary/S3.
- **5 core engineering rules**: Hierarchy `Category→Brand→Product→Variant→SKU→Inventory`; Zero-trust pricing; Concurrency-safe inventory; Idempotent webhooks; Strict TS + RBAC.
- **Phased roadmap (Phases 0–12, all marked [x] DONE)**: Phase 0 setup → Phase 1 DB → Phase 2 storefront → Phase 3 cart/checkout → Phase 4 OTP auth → Phase 5 shipping → Phase 6 WhatsApp → Phase 7 admin ops → Phase 8 SEO → Phase 9 policies → Phase 10 CRM/GSTR-1 → Phase 11 UI polish/CSV → Phase 12 admin auth.
- **Claims 26 endpoints** (verified) — actual route list contained in §1.1 of README.
- **Quick-start**: `npx prisma db push` + `npx tsx prisma/seed.ts` + `npm run dev` + 3 verification commands (`tsc --noEmit`, `comprehensive_loopback_test.ts`, `master_loopback_test.ts`).
- **NOTE mismatch**: README's directory tree shows `(storefront)` and `(admin)` route groups — but the actual `src/app/` is FLAT (no route groups). Docs are aspirational; code is flat.

### 1.2 `changelog.md` (336 lines)
Follows Keep-a-Changelog format. Versions v0.1.0 → v1.2.0 (all dated 2026-09-25/26):

| Version | Phase | Highlights |
|---|---|---|
| **[Unreleased]** | Production Launch | Vercel/Railway deployment, custom domain `patelnetworks.in` SSL — PENDING. |
| **v1.2.0** | Phase 12 — ADR-019 | Admin auth service (`pn_admin_session` cookie, HS256 JWT, `SUPER_ADMIN`/`ADMIN` roles), `/admin/login` portal, `src/middleware.ts` Edge guards (307 redirects), `AdminHeader` session + sign-out, regression tests for admin auth. |
| **v1.1.0** | Phase 11 — ADR-018 | Custom `not-found.tsx` ("Surveillance Feed Lost"), `error.tsx` boundary, Orders CSV export, GSTR-1 CSV export, Header search click-outside + Escape, mobile autocomplete parity, 36-point loopback suite (100%). |
| **v1.0.0** | Phase 9–10 — ADR-016/017 | Public policy pages (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`, `/contact`, `/about`, `/faq`), `/admin/customers` CRM, `/admin/reports` GSTR-1 analytics, debounced autocomplete, mobile sticky bar, zero-`any` audit. |
| **v0.9.0** | Phase 8 — ADR-015 | `/sitemap.xml`, `/robots.txt`, JSON-LD schemas (`Product`, `AggregateOffer`, `BreadcrumbList`) on PDP, master loopback suite (25 pts, 100%), Prisma transaction tuning `{ maxWait: 15000, timeout: 30000 }`. |
| **v0.8.0** | Phase 7 — ADR-014 | `/admin` exec dashboard, `/admin/orders` fulfillment console, hardware serial tracking on `OrderItem.serialNumbers`, `/admin/inventory` concurrency-safe adjustments w/ `InventoryMovement` audit, `/admin/settings/cod` selective COD toggles, admin layout + sidebar/header. |
| **v0.8.0 (cont.)** | Phase 6 — ADR-013 | WhatsApp Cloud API service (`whatsapp.service.ts`, dual-mode), event-driven notifications (Order Placed, Dispatched, Out-for-Delivery, Delivered, B2B Quote), `/api/webhooks/whatsapp` GET/POST, `WhatsAppSupportWidget.tsx`, `B2BQuoteModal.tsx`, `B2BContractorCallout.tsx`. |
| **v0.6.0** | Phase 5 — ADR-012 | `src/lib/pincodes.ts` (6-digit PIN engine, 4 zones, COD restrictions, business-day SLAs), `shipping.service.ts` (dual-mode Shiprocket live + deterministic `DELH...`/`BLUD...` simulation), `/api/webhooks/shipping` (idempotent dedup, state machine sync), `PincodeChecker.tsx`, `OrderTrackingTimeline.tsx` (5-stage), checkout pincode validation. |
| **v0.5.0** | Phase 4 — ADR-003/011 | `auth.service.ts` (Indian phone normalization, OTP rate-limit 3/10min, 5-min expiry, 5-attempt cap), dual-mode SMS gateway, `jose` JWT in `pn_session` cookie (7-day), `auth.actions.ts`, `/account/login` + `/account` portal, `AccountPortalClient.tsx`. |
| **v0.4.0** | Phase 3 — ADR-007/010 | `cart.service.ts` (`pn_cart_id` cookie, server-side price revalidation), `checkout.actions.ts` (Zod schemas: 10-digit phone, 6-digit PIN, 15-char GSTIN regex), `/cart`, `/checkout` (B2B GSTIN toggle, dual-mode Razorpay), `order.service.ts` (row-level `SELECT…FOR UPDATE` lock, finite state machine), `/order-success/[orderNumber]` + GST Tax Invoice (HSN 8525/8471/8544, CGST 9% + SGST 9%), `/api/webhooks/razorpay` (HMAC SHA-256, idempotent). |
| **v0.3.0** | Phase 2 | Header + Footer + homepage, `/products` faceted catalog, `/products/[slug]` PDP with `DynamicVariantSelector`, `/kit-builder` 5-step builder (5% bundle discount). |
| **v0.2.0** | ADR log | Authored `decisions.md` ADR-001 through ADR-009. |
| **v0.1.0** | Init | Ingested `CCTV_Security_Ecommerce_Website_Plan.docx`, created initial docs. |

### 1.3 `decisions.md` (491 lines, 39 KB) — All 19 ADRs
| ADR | Title | Date | Status |
|---|---|---|---|
| **ADR-001** | Unified Next.js Fullstack Architecture (App Router + Prisma). Single codebase, `(storefront)` + `(admin)` + `api/` route groups. | 2026-09-25 | ACCEPTED |
| **ADR-002** | Hybrid B2C & B2B Billing with GSTIN Input Tax Credit. Customer schema stores `isB2B`, `gstin`, `companyName`. CGST+SGST intra-state vs IGST inter-state split. | 2026-09-25 | ACCEPTED |
| **ADR-003** | Phone Number + 6-digit SMS OTP primary customer auth (MSG91/Fast2SMS/Firebase). Admins keep email+password+MFA. OTP rate-limit 3/10min, 5-min expiry. | 2026-09-25 | ACCEPTED |
| **ADR-004** | Selective COD admin-controlled per-SKU via `Product.isCodAllowed`. ₹15,000 ceiling, air-cargo postal zones auto-disable, cart-level enforcement. | 2026-09-25 | ACCEPTED |
| **ADR-005** | Multi-Attribute JSONB Variants (`{"resolution":"4MP","focal_length":"3.6mm",...}`). Strict `Product→Variant→SKU→Inventory` chain. | 2026-09-25 | ACCEPTED |
| **ADR-006** | Interactive 5-Step CCTV Kit Builder (Recorder→Cameras→Storage→Power→Bundle). 5% bundle discount, `Bundle`+`BundleItem` models. | 2026-09-25 | ACCEPTED |
| **ADR-007** | Integration Readiness with Placeholder Fallback (Razorpay, WhatsApp). Dual-mode: live API when real keys, deterministic simulation when `placeholder` detected. Zero-code switchover. | 2026-09-25 | ACCEPTED |
| **ADR-008** | Senior Lead Production-Grade Engineering: Zero `any`, Zod DTOs everywhere, `SELECT…FOR UPDATE` locks, integer paise or `Prisma.Decimal` for money, idempotency keys, Argon2id passwords, RBAC guards, no shortcuts. | 2026-09-25 | ACCEPTED |
| **ADR-009** | Supabase PostgreSQL Cloud. Dual-URL: `DATABASE_URL` (PgBouncer port 6543 transaction pooler) + `DIRECT_URL` (port 5432 session for migrations). Project `yhqgogsednnarjfspado`. | 2026-09-25 | ACCEPTED |
| **ADR-010** | Concurrency-safe Order Creation: `SELECT…FOR UPDATE` on `inventory` rows in Prisma `$transaction`, `ORDER_RESERVED` increment, state machine `PENDING_PAYMENT/COD_PENDING→PAID/CONFIRMED→PROCESSING→PACKED→SHIPPED→OUT_FOR_DELIVERY→DELIVERED`. Interactive txn timeout 30s/maxWait 15s. Idempotent Razorpay webhook dedup via `PaymentEvent.eventId`. | 2026-09-25 | ACCEPTED |
| **ADR-011** | Phone OTP + Dual-mode SMS + JWT Sessions. E.164 normalization `+91[6-9]\d{9}`, 6-digit OTP, `jose` HS256 signed `pn_session` HTTP-only 7-day cookie, guest-cart association on login. | 2026-09-25 | ACCEPTED |
| **ADR-012** | Carrier Logistics + Pincode Intelligence + AWB. PIN prefix matching across INTRA_STATE/METRO/REGIONAL/SPECIAL_ZONE, COD auto-disable in air-cargo zones, Shiprocket live + deterministic `DELH...`/`BLUD...` AWB simulation, `/api/webhooks/shipping` idempotent dedup (`evt_${awb}_${status}_${timestamp}`), auto-sync order state. | 2026-09-25 | ACCEPTED |
| **ADR-013** | WhatsApp Cloud API Lifecycle Engine. Dual-mode Meta Graph API + simulation, HSM templates (`order_confirmation`, `order_dispatched`, `out_for_delivery`, `order_delivered`, `b2b_quote_inquiry`), bidirectional `/api/webhooks/whatsapp` (GET handshake, POST status/inbound), floating widget + B2B modal. | 2026-09-25 | ACCEPTED |
| **ADR-014** | Admin Operations + SKU Inventory + Hardware Serials. `/admin` GMV/GST dashboard, `/admin/orders` fulfillment w/ AWB booking + `OrderItem.serialNumbers[]`, `/admin/inventory` concurrency-safe adjustments with `MovementReason` audit (`PURCHASE_RECEIPT`/`MANUAL_ADJUSTMENT`/`DAMAGED_WRITE_OFF`/`RETURN_RESTOCK`), `/admin/settings/cod` toggles. | 2026-09-26 | ACCEPTED |
| **ADR-015** | SEO + Loopback Engine. `scripts/master_loopback_test.ts` (25 pts), dynamic `/sitemap.xml`, `/robots.txt`, JSON-LD on PDP. Resolved Supabase cloud latency via `{ maxWait: 15000, timeout: 30000 }`. | 2026-09-26 | ACCEPTED |
| **ADR-016** | Public Policy Suite. 7 corporate/policy routes (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`, `/contact`, `/about`, `/faq`) + B2B quote inquiry action. IT Act 2000, PCI-DSS, Surat jurisdiction. | 2026-09-26 | ACCEPTED |
| **ADR-017** | Admin CRM + GSTR-1 Tax Analytics. `/admin/customers` (lifetime spend, B2B verification badges, WhatsApp launch) + `/admin/reports` (GSTR-1 CGST 9% + SGST 9% vs IGST 18%, warehouse asset valuation, payment split, 30-day sales velocity). | 2026-09-26 | ACCEPTED |
| **ADR-018** | UI Polish + 404/Error Boundaries + CSV Export. Custom `not-found.tsx` ("Surveillance Feed Lost"), `error.tsx`, Orders CSV export, GSTR-1 CSV export, Header autocomplete outside-click + Escape + mobile parity, 36-point loopback (24 endpoints + custom 404). | 2026-09-26 | ACCEPTED |
| **ADR-019** | Admin Command Center Auth + Edge Middleware. Dedicated `pn_admin_session` JWT cookie (HS256, 7-day) carrying `adminId/email/fullName/role`, isolated from `pn_session`, `/admin/login` portal with demo autofill, `src/middleware.ts` Edge guards intercepting `/admin/*` (307 redirect to `/admin/login?next=...`), `AdminHeader` sign-out action. Default creds `superadmin@patelnetworks.in` / `patel@admin2026`. | 2026-09-26 | ACCEPTED |

### 1.4 `technical-dcoumentation.md` (1178 lines, the real / typo'd filename)
14 numbered sections:
1. **Engineering Ground Rules & Non-Negotiables** — 8 rules including inventory invariant, zero-trust client data, ACID transactions, idempotent webhooks, integer paise money, soft-delete, DoD.
2. **Directory Layout** — describes `(storefront)`/`(admin)`/`api` groupings (aspirational; actual code is flat).
3. **Prisma Schema** — full schema dump (29 models + 5 enums, identical to `prisma/schema.prisma`).
4. **Concurrency & Race Condition Patterns** — full TS code samples for `reserveStockForOrder` with `SELECT…FOR UPDATE`, idempotent Razorpay webhook handler.
5. **Shipping Provider Abstraction Layer** — `ShippingProvider` interface (serviceability, rate, shipment, cancel, track) implemented by `ShiprocketProvider` + `DelhiveryProvider`.
6. **Payment (Razorpay) & WhatsApp Integration** — `WhatsAppNotificationService.isConfigured()` detection, Meta Graph API `POST /v20.0/{PHONE_NUMBER_ID}/messages`, Razorpay mock-mode handler.
7. **Environment Variables** — full `.env.example` template with placeholder defaults.
8. **Auth & RBAC** — JWT access+refresh, Argon2id passwords, `assertRole` guard.
9. **Cart, Checkout, Concurrency Orders & GST Engine** — anonymous cart `pn_cart_id` cookie, price revalidation, GST math (`price / 1.18`), order state machine, Razorpay webhook dedup, GST Tax Invoice with HSN breakdown.
10. **Customer Auth + SMS OTP** — `normalizeIndianPhone`, rate-limit `prisma.otpVerification.count`, `jose` JWT, account portal guards.
11. **Shipping Logistics** — pincode zone resolution table (Surat 395003 origin, INTRA/METRO/REGIONAL/SPECIAL zones), Shiprocket REST endpoints (`/auth/login`, `/orders/create/adhoc`, `/couriers/assign/awb`, `/courier/serviceability`), webhook dedup + state machine sync.
12. **WhatsApp Cloud API** — HSM template parameters, Meta handshake, storefront widget details.
13. **Back-Office Admin** — admin service methods (`getAdminDashboardMetrics`, `getAdminCustomersList`, `getAdminCommercialReports`), server actions list, admin UI components list, CSV export engine, live search autocomplete, ADR-019 admin auth.
14. **Verification Protocol** — `comprehensive_loopback_test.ts` (39 assertions, 11 domains, 26 endpoints) + `master_loopback_test.ts` (28 assertions) + `tsc --noEmit`.

### 1.5 `technical-documentation.md` (5 lines)
Tiny stub: just redirects to `technical-dcoumentation.md` (the typo'd one). Created to "preserve conventional spelling and prevent dead links."

### 1.6 `business-documentation.md` (348 lines)
18 sections covering commercial/business specs:
- **Catalog taxonomy**: 5-level `Category→Subcategory→Brand→Product→Variant(SKU)`. 5 top categories (CCTV, Displays, Cables, Connectors, Media Converters).
- **Multi-attribute dimensions**: Resolution (2/4/8/16MP), Lens (2.8/3.6/6mm), Form Factor (Dome/Bullet), Night Vision (IR/ColorVu), Audio (Mic/Terminal/None).
- **Example SKU table**: CP Plus Bullet variants with `CPP-B01-2MP-36` (₹1,450, COD allowed) through `CPP-B01-8MP-28` (₹4,890, prepaid only).
- **Kit Builder**: 5 steps + 5% bundle discount.
- **GST compliance**: HSN codes 8525 (CCTV), 8544 (cables), 8536 (connectors), 8528 (monitors). All 18% GST. B2B input tax credit via GSTIN.
- **Selective COD rules**: admin `isCodAllowed` flag, bulky/high-value items prepaid-only.
- **Customer auth**: Phone OTP via MSG91/Fast2SMS/Firebase.
- **Order state machine** (ASCII diagram): checkout→pending→paid→processing→packed→shipped→out_for_delivery→delivered.
- **Inventory policies**: current_stock, reserved_stock, available_stock, low_stock_threshold. Immutable audit log.
- **RBAC roles**: SUPER_ADMIN, ADMIN, INVENTORY_MANAGER, ORDER_MANAGER, CONTENT_MANAGER.
- **WhatsApp notification templates** (6 event triggers with parameters).
- **B2B invoicing**: GSTIN format, ITC claim procedure.
- **COD risk management**: ₹15K ceiling, 305m cable drums prepaid-only.
- **Surat Central Fulfillment Hub** ops: GMV dashboard, fulfillment console, hardware serial scanning for warranty/RMA.
- **Public policies** (Phase 9): shipping SLAs, 7-day DOA return policy, 2-3 yr manufacturer warranties, Surat legal jurisdiction.
- **Admin CRM + GSTR-1** (Phase 10): lifetime value tracking, B2B contractor badges, GSTR-1 schedules (CGST 9% + SGST 9% vs IGST 18%).
- **CSV export + 404/error UX** (Phase 11).
- **Admin session isolation** (Phase 12): `pn_admin_session` cookie + Edge middleware.

### 1.7 `continue.md` (234 lines) — Universal AI Handoff Guide
- **§1 Project overview**: Patel Networks/MegaTech, Surat HQ, brand alliances (CP Plus, Hikvision, Dahua, WD, D-Link).
- **§2 Tech stack**: Next.js 15/16 App Router, TS strict, Tailwind v4, PostgreSQL 16 Supabase via Prisma 6.19.3 (29 models). NO `.webp` recordings constraint.
- **§3 Credentials**: admin login URL + default superadmin creds (`superadmin@patelnetworks.in` / `patel@admin2026`), customer OTP flow, Supabase dual-URL connection strings, complete `.env` reference.
- **§4 Verified 26 endpoints** (numbered 1–26): storefront 1–9, corporate 10–16, admin 17–24, SEO/error 25–26.
- **§5 ADR-001 to ADR-019 table** (concise summary).
- **§6 Verification commands**: `tsc --noEmit`, `comprehensive_loopback_test.ts` (39 pts), `master_loopback_test.ts` (28 pts) — all pass with code 0.
- **§7 Future scope**: (1) Vercel/Railway prod deploy + `patelnetworks.in` SSL, (2) Live Razorpay/WhatsApp/Shiprocket/SMS credential onboarding, (3) Bulk B2B price matrix, multi-warehouse (Ahmedabad/Rajkot), automated PDF invoices via `@react-pdf/renderer`.
- **§8 Documentation map**: 10-file sync policy table — every file's update trigger.
- **Final instruction**: Read `continue.md` + `compact.md` at session start; implement feature; re-run tests; append to all related docs.

### 1.8 `compact.md` (57 lines) — Ultra-Concise Cheatsheet
5 sections: stack/architecture, invariants & key ADRs, key routes (26 + 3 webhooks), verification commands, documentation map.

### 1.9 `help.md` (136 lines) — Admin Operator Handbook
- 22-row URL navigation table.
- Default superadmin credentials + demo autofill button.
- 6-step order fulfillment workflow (intake→AWB→serials→dispatch→delivery→CSV export).
- SKU inventory adjustment procedure (4 audit reasons).
- 3 selective COD rules (₹15K ceiling, air-cargo PIN exclusion, per-product toggle).
- GSTR-1 monthly filing workflow.
- Customer CRM directory procedures.
- 3 verification commands.

### 1.10 `review-test-followup.md` (200 lines) — Executive Operations Handover
- **§1 Verification milestones**: 39/39 + 28/28 test passes, 0 TS errors, 26 endpoints serviceable.
- **§2 Detailed action plan** (6 sub-steps): Supabase production DB provisioning (Mumbai `ap-south-1`), Razorpay live keys + webhook, Shiprocket/Delhivery carrier setup, WhatsApp Cloud API (permanent System User token + 4 HSM templates), SMS OTP DLT registration, Vercel/Railway deployment + DNS.
- **§3 Testing playbook**: 3 commands (tsc, comprehensive, master) with expected outputs.
- **§4 Manual smoke testing matrix**: 12-step QA checklist covering live autocomplete, PDP variants, kit builder, cart tax, pincode intelligence, B2B GSTIN, order success, admin fulfillment, inventory adjustment, CRM directory, GSTR-1 export, custom 404.
- **§5 Ongoing operational guidelines**: monthly GSTR-1 filing, hardware serial tracking, stock intake.
- **§6 Sign-off**: feature-complete, ready for production credential onboarding.

### 1.11 `production-deployment-checklist.md` (252 lines) — Production Action Plan
8 sections of step-by-step live configuration:
1. **Supabase production**: Mumbai `ap-south-1` provisioning, dual URLs, `prisma db push` + `tsx prisma/seed.ts`.
2. **Razorpay live**: KYC + GSTIN `24AAACP1234F1Z8`, live API keys, webhook `https://patelnetworks.in/api/webhooks/razorpay` (subscribe `payment.captured` + `payment.failed` + `order.paid`).
3. **Shiprocket/Delhivery**: Surat pickup address PIN 395003, webhook for tracking status events.
4. **WhatsApp Cloud API**: Permanent System User token `PatelNetworksEcomEngine`, 4 HSM templates with exact body text (`order_confirmation`, `order_dispatched`, `order_out_for_delivery`, `b2b_inquiry_received`), webhook verify token `patel_networks_meta_verify_token_2026`.
5. **SMS OTP**: DLT entity registration (Sender `PTLNET`), Fast2SMS/MSG91 keys.
6. **Production security**: strong admin password, 32-byte JWT_SECRET.
7. **Vercel/Railway hosting**: import repo from `github.com/OmKardile/patelnetworks.git`, add env vars, bind `patelnetworks.in` + `www` (A record → `76.76.21.21`, CNAME → `cname.vercel-dns.com`).
8. **12-step pre-flight smoke test**: SSL, search, PDP variants, kit builder, cart tax, pincode test (Surat 395003 vs Imphal 795001), Razorpay ₹1 test, GST invoice print, WhatsApp alert, admin auth redirect, AWB + CSV exports, 404 page.

### 1.12 `AGENTS.md` (30 lines) — AI Agent Operating Instructions
- Top: `<!-- BEGIN:nextjs-agent-rules -->` block — auto-added by `next dev`, warns about breaking changes in this Next.js version, instructs to read `node_modules/next/dist/docs/`.
- Body: 4 numbered rules — (1) Read `continue.md` + `compact.md` at session start; (2) Continuously update 8 docs (continue/changelog/decisions/compact/README/technical-dcoumentation/business-documentation/help/review-test-followup); (3) Strict TS, Decimal/paise money, concurrency-safe Prisma txns, dual-mode architecture; (4) Verification protocol: `tsc --noEmit` + 2 loopback suites.

### 1.13 `CLAUDE.md` (1 line)
Single directive: `@AGENTS.md` — Claude imports AGENTS.md as context.

---

## 2. Source Code Structure

### 2.1 Total source files: **69 TypeScript/TSX files** under `src/`

### 2.2 `src/app/` — All route files (37 files)

**Storefront pages (10):**
- `src/app/page.tsx` — Homepage (300 lines)
- `src/app/products/page.tsx` — Catalog browser (239 lines)
- `src/app/products/[slug]/page.tsx` — Product Detail Page (265 lines)
- `src/app/kit-builder/page.tsx` — 5-step CCTV Kit Builder (754 lines)
- `src/app/cart/page.tsx` — Cart (251 lines)
- `src/app/checkout/page.tsx` — Checkout (930 lines, largest storefront page)
- `src/app/order-success/[orderNumber]/page.tsx` — Order confirmation + GST invoice (332 lines)
- `src/app/order-success/[orderNumber]/PrintInvoiceButton.tsx` — Print client component (23 lines)
- `src/app/account/page.tsx` — Customer account portal (88 lines, server-side auth guard)
- `src/app/account/login/page.tsx` — Phone OTP login (320 lines)
- `src/app/login/page.tsx` — Login alias (5 lines)

**Corporate/policy pages (7):**
- `src/app/about/page.tsx` (106 lines)
- `src/app/contact/page.tsx` (283 lines, includes B2B quote inquiry form)
- `src/app/faq/page.tsx` (173 lines)
- `src/app/shipping-policy/page.tsx` (174 lines)
- `src/app/return-policy/page.tsx` (147 lines)
- `src/app/privacy-policy/page.tsx` (118 lines)
- `src/app/terms/page.tsx` (100 lines)

**Admin pages (8):**
- `src/app/admin/layout.tsx` (42 lines)
- `src/app/admin/page.tsx` — Dashboard (324 lines)
- `src/app/admin/login/page.tsx` — Admin auth (197 lines)
- `src/app/admin/orders/page.tsx` (69 lines)
- `src/app/admin/products/page.tsx` (57 lines)
- `src/app/admin/inventory/page.tsx` (54 lines)
- `src/app/admin/customers/page.tsx` (26 lines)
- `src/app/admin/reports/page.tsx` (26 lines)
- `src/app/admin/settings/cod/page.tsx` (120 lines)

**API webhooks (3 route.ts files):**
- `src/app/api/webhooks/razorpay/route.ts` (139 lines) — HMAC SHA-256 + idempotent
- `src/app/api/webhooks/shipping/route.ts` (68 lines) — Carrier tracking
- `src/app/api/webhooks/whatsapp/route.ts` (106 lines) — Meta handshake + status

**Server Actions (8 files in `src/app/actions/`):**
- `admin-auth.actions.ts` (23 lines) — admin login/logout
- `admin.actions.ts` (98 lines) — adjustStockAction, toggleProductCodAction, toggleProductActiveAction, adminTransitionOrderStatusAction, adminCreateShipmentAction, saveSerialNumbersAction
- `auth.actions.ts` (115 lines) — sendOtpAction, verifyOtpAction, logoutAction, getCurrentUserAction, updateProfileAction, saveAddressAction, deleteAddressAction
- `cart.actions.ts` (44 lines) — addToCartAction, updateCartItemAction, removeFromCartAction, getCartAction
- `catalog.actions.ts` (13 lines) — searchProductsQuick
- `checkout.actions.ts` (125 lines) — processCheckoutAction (Zod schemas)
- `shipping.actions.ts` (129 lines)
- `whatsapp.actions.ts` (75 lines) — submitB2BQuoteInquiryAction

**App-level files (6):**
- `src/app/layout.tsx` (38 lines) — Root layout, Geist + Geist_Mono fonts, renders WhatsApp widget globally
- `src/app/globals.css` (62 lines) — Design tokens + base styles
- `src/app/page.tsx` (300 lines) — Homepage
- `src/app/robots.ts` (25 lines) — robots.txt generator
- `src/app/sitemap.ts` (109 lines) — Dynamic XML sitemap
- `src/app/not-found.tsx` (90 lines) — Custom "Surveillance Feed Lost" 404
- `src/app/error.tsx` (69 lines) — Client error boundary
- `src/app/favicon.ico` (25,931 bytes binary)

**Middleware:**
- `src/middleware.ts` (67 lines) — Edge JWT guards for `/admin/*` (requires `pn_admin_session`) + `/account/*` (requires `pn_session`), matcher `['/admin/:path*', '/account/:path*']`

### 2.3 `src/server/` — Domain Services (12 files)

**`src/server/db/` (1 file):**
- `index.ts` (17 lines) — PrismaClient singleton via `globalForPrisma`, dev mode logs `['error', 'warn']`

**`src/server/services/` (10 files):**
- `admin-auth.service.ts` (155 lines) — AdminAuthService: HS256 JWT in `pn_admin_session`, env-default fallback to `superadmin@patelnetworks.in` / `patel@admin2026`
- `admin.service.ts` (557 lines, LARGEST service) — getAdminDashboardMetrics, getAdminOrders, adjustSkuStock, toggleProductCodAllowed, updateOrderItemSerialNumbers, getAdminCustomersList, getAdminCommercialReports
- `auth.service.ts` (386 lines) — normalizeIndianPhone, OTP gen/verify with rate-limit, dual-mode SMS, JWT sessions
- `catalog.service.ts` (234 lines) — searchProductsQuick, catalog queries
- `cart.service.ts` (251 lines) — Anonymous cart via `pn_cart_id`, server-side price revalidation, GST calc
- `order.service.ts` (366 lines) — `createOrderFromCart` with `SELECT…FOR UPDATE`, state machine
- `payment.service.ts` (181 lines) — Dual-mode Razorpay gateway
- `whatsapp.service.ts` (419 lines) — Meta Graph API + simulation mode, 5 lifecycle notification functions
- `shipping.service.ts` (437 lines) — Shiprocket REST + deterministic AWB simulation, webhook event ingestion

### 2.4 `src/lib/` — Shared Utilities (2 files)
- `utils.ts` (37 lines) — `cn` (clsx+tailwind-merge), `formatPrice`/`formatInr` (Indian rupee formatter), `calculateGstBreakdown(price, gstRatePct=18)` returning `{taxableValue, totalGst, cgst, sgst, igst}`
- `pincodes.ts` (212 lines) — Indian Pincode intelligence: `WAREHOUSE_ORIGIN` (Surat 395003), `KNOWN_POSTAL_ZONES` array (prefix → city/state/zone/days/carrier/COD), `lookupPincodeServiceability()` returning `PincodeServiceability` interface. Zones: INTRA_STATE (Gujarat), METRO (Delhi/Mumbai/Bengaluru/Hyderabad/Chennai/Kolkata), REGIONAL, SPECIAL_ZONE (NE/J&K/Andaman — air-cargo, COD disabled).

### 2.5 `src/components/` — UI Components (18 files)

**`src/components/storefront/` (10 files):**
- `Header.tsx` (428 lines) — Live debounced autocomplete search, cart count, mobile drawer
- `Footer.tsx` (247 lines) — Policy links, operations portal link
- `ProductCard.tsx` (162 lines) — Catalog card
- `DynamicVariantSelector.tsx` (369 lines) — Matrix selector, mobile sticky bar, B2B callout
- `PincodeChecker.tsx` (193 lines) — 6-digit PIN checker on PDP + checkout
- `OrderTrackingTimeline.tsx` (328 lines) — 5-stage tracking stepper
- `WhatsAppSupportWidget.tsx` (172 lines) — Floating chat widget
- `B2BQuoteModal.tsx` (287 lines) — Project bulk quotation modal
- `B2BContractorCallout.tsx` (60 lines) — PDP contractor pricing trigger
- `AccountPortalClient.tsx` (766 lines, largest component) — Customer portal client (orders, addresses, B2B profile)

**`src/components/admin/` (7 files):**
- `AdminSidebar.tsx` (149 lines) — Dark sidebar navigation
- `AdminHeader.tsx` (96 lines) — Session display, role badge, sign-out
- `OrderFulfillmentConsole.tsx` (654 lines) — Order fulfillment, AWB booking, serial numbers, CSV export
- `ProductCatalogTable.tsx` (240 lines) — Catalog management w/ COD toggles
- `InventoryManagementConsole.tsx` (364 lines) — SKU stock drawer + adjustment modal
- `CustomerDirectoryTable.tsx` (234 lines) — CRM directory
- `CommercialReportsConsole.tsx` (371 lines) — GSTR-1 reports + CSV export

**`src/components/ui/` (1 file):**
- `Badge.tsx` (30 lines) — Only one UI primitive in dedicated ui folder.

**NOTE**: README mentions Radix UI primitives, but `package.json` does NOT include `@radix-ui/*` — only `clsx`, `jose`, `lucide-react`, `next`, `react`, `react-dom`, `tailwind-merge`, `zod`. The "Radix" claim is aspirational; UI is plain Tailwind + the single Badge component.

### 2.6 Full Route Map (26 endpoints)

**Storefront (9):** `/`, `/products`, `/products/[slug]`, `/kit-builder`, `/cart`, `/checkout`, `/account` (307 redirect when unauthenticated), `/account/login`, `/order-success/[orderNumber]`, `/login` (alias).

**Corporate & Policy (7):** `/about`, `/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`.

**Admin Command Center (8, all protected via ADR-019 middleware):** `/admin/login`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/customers`, `/admin/reports`, `/admin/settings/cod`.

**SEO & Exception Boundaries (4):** `/sitemap.xml`, `/robots.txt`, `/not-found.tsx` (custom 404), `/error.tsx` (client boundary).

**Webhooks (3):** `POST /api/webhooks/razorpay`, `POST /api/webhooks/shipping`, `GET|POST /api/webhooks/whatsapp`.

---

## 3. Database Schema Analysis (`prisma/schema.prisma`, 534 lines)

### 3.1 Configuration
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")    // Supabase dual-URL strategy
}
generator client { provider = "prisma-client-js" }
```

### 3.2 All 5 Enums
| Enum | Values |
|---|---|
| `UserRole` | `SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, `ORDER_MANAGER`, `CONTENT_MANAGER`, `CUSTOMER` |
| `MovementReason` | `PURCHASE_RECEIPT`, `ORDER_RESERVED`, `ORDER_DISPATCHED`, `ORDER_CANCELLED_RESTOCK`, `RETURN_RESTOCK`, `MANUAL_ADJUSTMENT`, `DAMAGED_WRITE_OFF` |
| `OrderStatus` | `PENDING_PAYMENT`, `COD_PENDING`, `PAID`, `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED`, `REFUNDED` (13 states) |
| `PaymentMethod` | `RAZORPAY`, `CASH_ON_DELIVERY` |
| `PaymentStatus` | `INITIATED`, `SUCCESS`, `FAILED`, `REFUNDED` |

### 3.3 All 29 Models with @@map table names

| # | Model | @@map | Key Fields / Notes |
|---|---|---|---|
| 1 | `User` | `users` | `phone @unique` (primary login), `email?`, `passwordHash?` (admin only), `role UserRole @default(CUSTOMER)`, `isActive`, `deletedAt?` soft-delete |
| 2 | `OtpVerification` | `otp_verifications` | `phone`, `otpCode`, `expiresAt`, `isVerified`, `attempts`. `@@index([phone, isVerified])` |
| 3 | `AdminProfile` | `admin_profiles` | `userId @unique`, `fullName`. Cascade delete from User |
| 4 | `Customer` | `customers` | `userId @unique`, `fullName`, `companyName?`, `gstin?` (15-char), `isB2BVerified`. Relations: addresses, orders, cart, wishlist, reviews |
| 5 | `Address` | `addresses` | `recipientName`, `phone`, `addressLine1/2`, `landmark?`, `city`, `state`, `pincode`, `isDefault`, `type` ("HOME"/"WORK"/"WAREHOUSE"). Two relations to Order: `"OrderShippingAddress"` + `"OrderBillingAddress"` |
| 6 | `Category` | `categories` | `slug @unique`, `parentId?` (self-relation "SubCategories"), `hsnCode @default("8525")`, `gstRate Decimal(5,2) @default(18.0)`, `isActive` |
| 7 | `Brand` | `brands` | `slug @unique`, `logoUrl?`, `description?`, `isActive` |
| 8 | `Product` | `products` | `slug @unique`, `brandId`, `categoryId`, `description @db.Text`, `modelNumber?`, `isActive`, `isFeatured`, `isCodAllowed @default(true)` (ADR-004), `specifications Json?`, `deletedAt?` soft-delete. `@@index([brandId])`, `@@index([categoryId])` |
| 9 | `ProductImage` | `product_images` | `productId`, `url`, `altText?`, `sortOrder @default(0)`. Cascade delete |
| 10 | `ProductVariant` | `product_variants` | `productId`, `name` (e.g. "4MP / 3.6mm / Bullet / ColorVu"), `attributes Json` (ADR-005 multi-attribute map), `skuId @unique`. Cascade delete from Product |
| 11 | `Sku` | `skus` | `code @unique` (e.g. "CPP-B01-4MP-CV"), `barcode? @unique`, `mrp Decimal(12,2)`, `sellingPrice Decimal(12,2)`, `weightGrams @default(500)`, `dimensionsCm Json?`. Relations: variant?, inventory?, cartItems, orderItems, bundleItems, movements |
| 12 | `Inventory` | `inventory` | `skuId @unique`, `currentStock @default(0)`, `reservedStock @default(0)`, `lowStockThreshold @default(5)`. Cascade delete from Sku |
| 13 | `InventoryMovement` | `inventory_movements` | `skuId`, `quantity Int` (signed), `reason MovementReason`, `referenceId?` (OrderId/PO/ReturnId), `notes?`, `createdById?` |
| 14 | `Bundle` | `bundles` | `slug @unique`, `discountPct Decimal(5,2) @default(5.0)`, `isActive` |
| 15 | `BundleItem` | `bundle_items` | `bundleId`, `skuId`, `quantity @default(1)`, `isOptional @default(false)`. Cascade delete from Bundle |
| 16 | `Cart` | `carts` | `customerId @unique`. Cascade delete from Customer |
| 17 | `CartItem` | `cart_items` | `cartId`, `skuId`, `quantity`. `@@unique([cartId, skuId])` |
| 18 | `Wishlist` | `wishlists` | `customerId @unique` |
| 19 | `WishlistItem` | `wishlist_items` | `wishlistId`, `productId`. `@@unique([wishlistId, productId])` |
| 20 | `Order` | `orders` | `orderNumber @unique` ("ORD-2026-0001"), `customerId`, `status OrderStatus @default(PENDING_PAYMENT)`, `paymentMethod @default(RAZORPAY)`, money fields all `Decimal(12,2)`: `subtotal`, `discountAmount`, `gstAmount`, `shippingAmount`, `totalAmount`. `isB2B`, `gstin?`, `companyName?`, `shippingAddressId`, `billingAddressId`, `invoiceUrl?`. Relations: items, statusHistory, payments, shipments, returns |
| 21 | `OrderItem` | `order_items` | `orderId`, `skuId`, `productName`, `variantName`, `skuCode`, `quantity Int`, `unitPrice/taxRate/taxAmount/totalPrice Decimal`, `serialNumbers String[]` (scanned hardware serials). Cascade delete from Order |
| 22 | `OrderStatusHistory` | `order_status_history` | `orderId`, `status OrderStatus`, `comment?`, `changedBy?`. Cascade delete |
| 23 | `Payment` | `payments` | `orderId`, `gateway @default("RAZORPAY")`, `gatewayOrderId? @unique`, `gatewayPaymentId? @unique`, `amount Decimal(12,2)`, `currency @default("INR")`, `status PaymentStatus @default(INITIATED)`. Relations: events |
| 24 | `PaymentEvent` | `payment_events` | `paymentId`, `eventId @unique` (dedup key), `eventType`, `payload Json` |
| 25 | `Shipment` | `shipments` | `orderId`, `carrier @default("SHIPROCKET")`, `shipmentId? @unique`, `awbNumber? @unique`, `trackingUrl?`, `labelUrl?`, `status @default("MANIFESTED")`. Relations: events |
| 26 | `ShipmentEvent` | `shipment_events` | `shipmentId`, `eventId @unique` (dedup), `status`, `location?`, `timestamp DateTime`, `payload Json` |
| 27 | `OrderReturn` | `order_returns` | `orderId`, `reason`, `status @default("REQUESTED")`, `isRma @default(false)` (retail return vs manufacturer RMA) |
| 28 | `Review` | `reviews` | `productId`, `customerId`, `rating Int @default(5)`, `title?`, `comment?`, `isVerified @default(false)`, `isApproved @default(false)` |
| 29 | `AuditLog` | `audit_logs` | `userId?`, `action`, `entity`, `entityId`, `details Json?`, `ipAddress?` |

### 3.4 Hierarchy: `Category → Brand → Product → Variant → SKU → Inventory`
- `Category` (1) ─< `Product` (N) via `categoryId` (category also has self-relation for subcategories)
- `Brand` (1) ─< `Product` (N) via `brandId`
- `Product` (1) ─< `ProductVariant` (N) via `productId` (cascade delete)
- `ProductVariant` (1) ─(1) `Sku` via `skuId @unique` (one-to-one)
- `Sku` (1) ─(1) `Inventory` via `skuId @unique` (cascade delete)
- `Sku` (1) ─< `InventoryMovement` (N) via `skuId`
- `Sku` (1) ─< `CartItem`, `OrderItem`, `BundleItem` (N)

### 3.5 Cascades (onDelete: Cascade)
- `User → AdminProfile`, `User → Customer`
- `Customer → Address`, `Customer → Cart`, `Customer → Wishlist`
- `Product → ProductImage`, `Product → ProductVariant`
- `Sku → Inventory`
- `Bundle → BundleItem`
- `Cart → CartItem`, `Wishlist → WishlistItem`
- `Order → OrderItem`, `Order → OrderStatusHistory`

Note: `Order → Payment`, `Order → Shipment`, `Order → OrderReturn` do NOT specify onDelete (default = Restrict), preserving financial records.

### 3.6 Soft-Deletes
- `User.deletedAt`, `Product.deletedAt` only (financial records/orders never hard-deleted per ADR-008 rule 7).

### 3.7 Composite Uniques
- `CartItem: @@unique([cartId, skuId])`
- `WishlistItem: @@unique([wishlistId, productId])`

### 3.8 Indexes
- `OtpVerification: @@index([phone, isVerified])`
- `Product: @@index([brandId]), @@index([categoryId])`

### 3.9 Notable Type Choices
- All monetary fields use `@db.Decimal(12, 2)` — ₹0.01 precision up to ₹99,999,999,999.99
- Tax rate uses `@db.Decimal(5, 2)` — supports rates like 18.00, 28.00
- `OrderItem.serialNumbers String[]` — PostgreSQL native text array
- `Product.specifications Json?`, `ProductVariant.attributes Json`, `Sku.dimensionsCm Json?`, `PaymentEvent.payload Json`, `ShipmentEvent.payload Json`, `AuditLog.details Json?` — extensive JSONB usage for flexible schemas

---

## 4. Supabase Folder

`/home/z/patelnetworks-study/supabase/` contains ONLY:
- `config.toml` (415 lines) — Default Supabase CLI local-dev config with `project_id = "patelnetworks"`. Configures API (port 54321), DB (port 54322, major_version 17), pooler (disabled by default), studio (port 54323), local_smtp, storage, auth (site_url `http://127.0.0.1:3000`), edge_runtime (Deno v2, per_worker policy), analytics (postgres backend).
- `.temp/cli-latest` — contains `v2.118.0` (Supabase CLI version marker, auto-generated).

**NO `migrations/` folder exists.** Schema is deployed via `npx prisma db push` (push-based) rather than `prisma migrate dev` (migration-based). The Supabase config is essentially default scaffold; production deployment targets Supabase Cloud directly via the dual-URL connection strings.

---

## 5. Scripts Folder (8 files, all TypeScript)

| File | Lines | Purpose |
|---|---|---|
| `scripts/check_locks.ts` | 12 | Utility — queries `pg_stat_activity` for active non-idle queries to inspect long-running locks during debugging. |
| `scripts/verify_phase3.ts` | 158 | Phase 3 verification — cart creation, inventory reservation, order generation, simulated payment, webhook idempotency. |
| `scripts/verify_phase4.ts` | 117 | Phase 4 verification — phone normalization, OTP dispatch, customer provisioning, address creation, B2B profile updates. |
| `scripts/verify_phase5.ts` | 279 | Phase 5 verification — 11 Indian PIN codes across 4 zones, SLAs, COD restrictions, order creation, AWB generation, tracking webhook progression, dedup. |
| `scripts/verify_phase6.ts` | 244 | Phase 6 verification — phone normalization, Order Confirmation/Shipment Dispatched/Out-for-Delivery/Delivered WhatsApp alerts, B2B quote inquiry, Meta GET handshake + POST callbacks. |
| `scripts/verify_phase7.ts` | 139 | Phase 7 verification — metrics aggregation, order search, COD toggles, stock adjustments, movement audits, hardware serial tracking. |
| `scripts/master_loopback_test.ts` | 270 | Master 28-point domain regression — catalog taxonomy, pincode routing, GST math, B2B order creation, carrier AWB booking, WhatsApp notifications, admin dashboard, stock adjustments, hardware serials, superadmin auth. |
| `scripts/comprehensive_loopback_test.ts` | 309 | **Primary 39-point end-to-end suite** — 11 domains + 26 HTTP endpoints (with cloud Supabase pooler retry backoff). Imports services directly from `src/server/services/*`. |

All test scripts use `assert(condition, message)` helper that calls `process.exit(1)` on failure and console-logs `✅ [PASS]` on success.

---

## 6. `.env.example` Analysis — Required Environment Variables

Confirmed complete list of 18 environment variables in 6 categories:

### Application & Database (3)
- `NODE_ENV="development"`
- `NEXT_PUBLIC_APP_URL="http://localhost:3000"`
- `DATABASE_URL` — Supabase transaction pooler URL (port 6543, `?pgbouncer=true`)

### Authentication & Security (2)
- `JWT_SECRET` — 32-byte secret for HS256 JWT signing
- `JWT_EXPIRES_IN="7d"`

> **NOTE**: `.env.example` does NOT explicitly list `DIRECT_URL` (only `DATABASE_URL`), but `prisma/schema.prisma` declares `directUrl = env("DIRECT_URL")` — so `DIRECT_URL` IS required at runtime. The `continue.md` reference DOES include both URLs. Same goes for `ADMIN_EMAIL` and `ADMIN_PASSWORD` (referenced in `continue.md` and `production-deployment-checklist.md` but missing from `.env.example`).

### Razorpay Payments (3)
- `RAZORPAY_KEY_ID` — placeholder `rzp_test_placeholder_key_id` activates simulation mode
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

### WhatsApp Cloud API (4)
- `WHATSAPP_API_URL="https://graph.facebook.com/v20.0"`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`

### Shipping / Logistics (3)
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"`

### SMS OTP Gateway (2)
- `SMS_GATEWAY_API_KEY`
- `SMS_SENDER_ID="PTLNET"`

### Media Storage (3 — present in `.env.example` but NOT actually used in current code per source review)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

> **DISCREPANCY**: Cloudinary env vars are declared but no `cloudinary` package is in `package.json` and no service file imports them. The README claims "Cloudinary / AWS S3" for media, but media URLs in seed/catalog are stored as plain strings (likely pointing to Unsplash / Cloudinary URLs in `next.config.ts` `images.remotePatterns`). Cloudinary integration appears NOT yet implemented.

---

## 7. Current Operational Status

### 7.1 Current Version
- **Documentation version**: v1.2.0 (per `changelog.md`, dated 2026-09-26)
- **package.json version**: `0.1.0` (DRIFT — package.json was never bumped despite 12 feature commits)
- **Release label**: "Commercial Grade" per `review-test-followup.md` header

### 7.2 What's DONE (all 12 phases complete + 19 ADRs implemented)
- ✅ Phase 0–12 (all marked complete in README)
- ✅ 29-model Prisma schema + catalog seed (8 brands, 7+ categories, multi-variant SKUs)
- ✅ Storefront: homepage, catalog, PDP with variant matrix, kit builder, cart, checkout, account portal, OTP login, order success + GST invoice
- ✅ 7 corporate/policy pages
- ✅ 8 admin pages + admin auth + middleware guards
- ✅ 3 webhooks (Razorpay, shipping, WhatsApp) — all idempotent
- ✅ SEO: sitemap.xml, robots.txt, JSON-LD structured data
- ✅ Custom 404 + error boundary
- ✅ CSV export engine (Orders + GSTR-1)
- ✅ WhatsApp Cloud API integration code (with simulation)
- ✅ Pincode intelligence engine (19,000+ PIN codes via prefix matching)
- ✅ Dual-mode Razorpay / Shiprocket / WhatsApp / SMS gateway architecture
- ✅ 39-point comprehensive + 28-point master regression test suites (both report 100% pass)
- ✅ Strict TS zero-`any` audit complete

### 7.3 What's PENDING / Roadmap
Per `continue.md` §7 and `changelog.md` [Unreleased]:
- 🟡 **Production cloud deployment** on Vercel/Railway with Supabase production tier (Mumbai `ap-south-1`)
- 🟡 **Custom domain SSL binding** for `patelnetworks.in` (and `www`)
- 🟡 **Live Razorpay merchant account** KYC + production API keys (currently `rzp_test_placeholder_key_id`)
- 🟡 **Live WhatsApp Cloud API** permanent System User token + 4 HSM templates approval (currently placeholder token)
- 🟡 **Live Shiprocket/Delhivery** production carrier credentials (currently `placeholder@patelnetworks.com`)
- 🟡 **Live SMS gateway** (Fast2SMS/MSG91) with Indian DLT registration (Sender `PTLNET`)
- 🟡 **Bulk B2B tiered price matrix** for verified contractors ordering >10 units
- 🟡 **Multi-warehouse support** (Ahmedabad / Rajkot satellite nodes in addition to Surat Central Hub)
- 🟡 **Automated PDF invoice generation** via `@react-pdf/renderer` for instant download attachments
- 🟡 **Cloudinary/S3 media storage** actually wired up (env vars exist but no service implementation)
- 🟡 **Admin user CRUD UI** — currently only env-default superadmin login; no UI to manage admin users / roles

### 7.4 Integrations: LIVE vs SIMULATION/PLACEHOLDER

| Integration | Code Status | Live Status |
|---|---|---|
| **Supabase PostgreSQL** | ✅ Live (production cloud via dual-URL) | Live in dev (project `yhqgogsednnarjfspado` in `ap-northeast-1` per ADR-009). Production should migrate to Mumbai `ap-south-1`. |
| **Razorpay Payments** | ✅ Dual-mode code complete | 🟡 Placeholder keys → simulation mode active. Needs live `rzp_live_*` keys + webhook registration. |
| **Shiprocket / Delhivery** | ✅ Dual-mode code complete | 🟡 Placeholder creds → deterministic simulation (`DELH...`/`BLUD...` AWBs). Needs live tokens. |
| **WhatsApp Cloud API** | ✅ Dual-mode code complete (Meta Graph API `v20.0`) | 🟡 Placeholder token → simulation (terminal logging + audit_logs). Needs permanent System User token + approved HSM templates. |
| **SMS OTP (Fast2SMS/MSG91)** | ✅ Dual-mode code complete | 🟡 Placeholder key → simulation (terminal OTP logging). Needs live API key + DLT template approval. |
| **Cloudinary / S3 Media** | ❌ Env vars declared but no service code | Not implemented. Product images currently use remote URLs (Unsplash + Cloudinary patterns whitelisted in `next.config.ts`). |
| **Argon2id password hashing** | ⚠️ Documented in ADR-008 but `package.json` lacks `argon2` dep | Admin password currently compared via env-default fallback (`superadmin@patelnetworks.in` / `patel@admin2026`); seed has placeholder hash `$argon2id$v=19$m=65536,t=3,p=4$dummyhashforadminpassword`. Real Argon2id hashing NOT actually wired up. |
| **Edge Middleware (jose JWT)** | ✅ Live (production-ready) | Working with default fallback secret `patel_networks_secure_jwt_secret_key_32_bytes!` (must change for prod). |

### 7.5 Known Issues / Risks Identified
1. **package.json version drift**: Says `0.1.0` while docs claim v1.2.0 — needs sync.
2. **Missing `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env.example`** — required by schema/middleware but absent from template.
3. **Cloudinary env vars declared but no service uses them** — dead config or pending implementation.
4. **Argon2id documented (ADR-008) but `argon2` package not installed** — password hashing falls back to plaintext env comparison. The seed `passwordHash` is a dummy non-verifiable string.
5. **Route group mismatch**: README/docs describe `(storefront)` and `(admin)` route groups but actual `src/app/` is FLAT — docs are aspirational not reflective.
6. **Single UI primitive**: Only `Badge.tsx` exists in `src/components/ui/`. README claims Radix UI primitives but `@radix-ui/*` is NOT in `package.json`. UI is hand-rolled Tailwind.
7. **Default JWT_SECRET fallback in middleware.ts**: `process.env.JWT_SECRET || 'patel_networks_secure_jwt_secret_key_32_bytes!'` — production risk if env var missing.
8. **Default admin credentials in source**: `superadmin@patelnetworks.in` / `patel@admin2026` hardcoded as fallback in `admin-auth.service.ts` — must be overridden via env in production.
9. **No `prisma/migrations/` folder**: Schema applied via `db push` (acceptable for dev, riskier for production audit trails).
10. **Supabase CLI version 2.118.0** but `supabase/config.toml` declares `db.major_version = 17` — Supabase Cloud production tier may use 15/16; verify compatibility.
11. **Test scripts require running dev server**: `comprehensive_loopback_test.ts` uses `http.get('http://localhost:3000...')` — must `npm run dev` first.
12. **No CI/CD pipeline**: Tests must be run manually; no GitHub Actions workflow visible.
13. **`/login` route duplicates `/account/login`** — both exist as separate files (5 lines vs 320 lines); minor confusion risk.
14. **WhatsApp verify token discrepancy**: `production-deployment-checklist.md` specifies `patel_networks_meta_verify_token_2026` but `.env.example` does not include `WHATSAPP_VERIFY_TOKEN` at all.

---

## 8. Commit History Detail

12 commits, all authored by **Omkar Kardile <omkardile84@gmail.com>** on **2026-09-26** (within ~50 minutes — appears to be a single bulk-commit session).

| # | Hash | Time | Subject | Files Changed | Lines Added |
|---|---|---|---|---|---|
| 1 (latest) | `b7581b7` | 10:55 | `docs: create production-deployment-checklist.md with live api, webhook, and hosting steps` | 3 (compact.md, continue.md, production-deployment-checklist.md) | +254 |
| 2 | `d4190c6` | 10:10 | `docs: master adr log (ADR-001 - ADR-019), changelog, operator handbook, and universal ai handoff guide` | 13 (AGENTS.md, CLAUDE.md, README.md, business-documentation.md, changelog.md, compact.md, continue.md, decisions.md, help.md, review-test-followup.md, technical-dcoumentation.md, technical-documentation.md, word/document.xml) | +3,200 |
| 3 | `89cf24c` | 10:10 | `test(regression): comprehensive 39-point loopback suite and master domain test harness` | 8 scripts (check_locks.ts, comprehensive_loopback_test.ts, master_loopback_test.ts, verify_phase3–7.ts) | +1,528 |
| 4 | `7e278ff` | 10:09 | `feat(security-polish): custom 404 feed lost boundary, error recovery, and admin command center authentication (Phases 11 & 12)` | 7 (admin-auth.actions.ts, admin/login/page.tsx, error.tsx, login/page.tsx, not-found.tsx, middleware.ts, admin-auth.service.ts) | +606 |
| 5 | `2daf26b` | 10:09 | `feat(seo-governance): dynamic xml sitemaps, robots.txt, corporate consult desk, and legal policy suite (Phases 8 & 9)` | 9 (about, contact, faq, privacy-policy, return-policy, robots.ts, shipping-policy, sitemap.ts, terms pages) | +1,235 |
| 6 | `19b10a3` | 10:09 | `feat(admin): operations dashboard, sku stock adjustments, order fulfillment, and crm directory (Phases 7 & 10)` | 17 (admin actions + 8 admin pages + 6 admin components + admin.service.ts) | +3,481 |
| 7 | `99efc20` | 10:09 | `feat(logistics-whatsapp): carrier awb generation, 5-stage live tracking, and whatsapp cloud api engine (Phases 5 & 6)` | 13 (cart/catalog/shipping/whatsapp actions, 2 webhooks, 3 storefront components, Badge, 2 services) | +2,108 |
| 8 | `9f22f02` | 10:09 | `feat(auth): passwordless 6-digit sms otp login, jwt sessions, and customer account portal (Phase 4)` | 5 (account/login, account/page, auth.actions, AccountPortalClient, auth.service) | +1,675 |
| 9 | `6ca139a` | 10:09 | `feat(checkout): server cart validation, hybrid b2b gstin, dual-mode razorpay, and concurrency-safe orders (Phase 3)` | 9 (checkout.actions, razorpay webhook, cart/checkout pages, order-success page + button, 3 services) | +2,598 |
| 10 | `d6b07c4` | 10:08 | `feat(storefront): homepage, faceted catalog, dynamic variant selector, and cctv kit builder (Phase 2)` | 13 (globals.css, kit-builder, layout, page, products pages, 6 storefront components, catalog.service) | +3,351 |
| 11 | `d86d400` | 10:08 | `feat(db): prisma schema with 29 relational models, catalog seed, and db client (Phase 1)` | 7 (schema.prisma 534 lines, seed.ts 406 lines, pincodes.ts, utils.ts, db/index.ts, supabase/.temp/cli-latest, supabase/config.toml) | +1,622 |
| 12 (oldest) | `d01d210` | 10:08 | `chore(init): project setup, next.js fullstack scaffold, and configuration (Phase 0)` | 14 (.env.example, .gitignore, CCTV_Security_Ecommerce_Website_Plan.docx, eslint.config.mjs, next.config.ts, package-lock.json 7,888 lines, package.json, postcss.config.mjs, 5 SVGs in public/, tsconfig.json) | +8,112 |

**Total**: 12 commits, ~85 files, ~29,570 lines of code+docs added in a single 50-minute session. The work was clearly done in a prior environment (Windows paths like `file:///d:/work/megatech/patelnetworks/` are embedded throughout docs) and then committed in batch to this git repo.

---

## 9. Final Briefing for Lead Developer

### What you have
A feature-complete, single-developer-built, commercially-ambitious Next.js 16 + Prisma 6 + Supabase CCTV e-commerce platform with 29 database models, 26 verified HTTP endpoints, 8 server actions, 10 server services, 18 UI components, 3 idempotent webhooks, dual-mode fallback architecture for 4 external integrations (Razorpay, Shiprocket, WhatsApp, SMS), and 8 automated regression test scripts claiming 100% pass rates. Code is strict TypeScript (zero `any`), uses `Prisma.Decimal` for all money, `SELECT…FOR UPDATE` row-level locks for inventory, and `jose` HS256 JWT for both customer (`pn_session`) and admin (`pn_admin_session`) sessions isolated via Edge middleware.

### What needs immediate attention before production
1. **Bump `package.json` version** from `0.1.0` → `1.2.0` to match docs.
2. **Add missing env vars to `.env.example`**: `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `WHATSAPP_VERIFY_TOKEN`.
3. **Install and wire up `argon2`** (or `@node-rs/argon2`) for real password hashing per ADR-008 — currently a documented rule not enforced in code.
4. **Implement Cloudinary service** (or remove the env vars if media strategy is changing).
5. **Provision production Supabase** in Mumbai (`ap-south-1`) — current dev uses `ap-northeast-1` (Tokyo).
6. **Onboard live credentials**: Razorpay KYC + GSTIN `24AAACP1234F1Z8`, Meta WhatsApp permanent token + 4 HSM templates, Shiprocket live account, Fast2SMS/MSG91 DLT-approved template.
7. **Deploy to Vercel/Railway**, bind `patelnetworks.in` + SSL.
8. **Generate secure `JWT_SECRET`** (32 random bytes) and override default admin password.
9. **Run the 12-step pre-flight smoke test** from `production-deployment-checklist.md` §8.
10. **Reconcile docs vs reality**: README's `(storefront)` / `(admin)` route group claims don't match actual flat `src/app/` structure. Either restructure code to match docs or fix docs.

### What's safe to extend
- The dual-mode architecture means you can develop and test all integrations locally without external dependencies — when live keys arrive, you swap env vars with zero code changes.
- All 8 server actions + 10 services are cleanly separated from UI per ADR-008 clean-architecture rule.
- The 39-point comprehensive loopback suite (`scripts/comprehensive_loopback_test.ts`) imports services directly and exercises the full flow end-to-end against a running `next dev` server + cloud Supabase — use it as your safety net for any refactor.

### Repo metadata summary
- **Repo path**: `/home/z/patelnetworks-study/`
- **Git remote**: Not configured in this clone (no `origin`).
- **Source repo** (per `production-deployment-checklist.md`): `https://github.com/OmKardile/patelnetworks.git`
- **Author**: Omkar Kardile <omkardile84@gmail.com>
- **Total commits**: 12 (all on default branch, single bulk-commit session 2026-09-26)
- **Languages**: TypeScript / TSX (React 19.2 + Next.js 16.3.6)
- **Runtime deps**: `@prisma/client@^6.4.1`, `clsx@^2.1.1`, `jose@^6.2.12`, `lucide-react@^1.48.0`, `next@16.3.6`, `react@19.2.8`, `react-dom@19.2.8`, `tailwind-merge@^3.7.0`, `zod@^4.6.5`
- **Dev deps**: Tailwind v4, `tsx@^4.23.15`, `typescript@^5`, `babel-plugin-react-compiler@1.0.0`, `eslint@^9`
- **Database**: 29 models, 5 enums, all `@@map` to snake_case Supabase tables
- **Test coverage**: 39+28 = 67 automated assertions across 11+ testing domains


---
Task ID: 7-INTEGRATION
Agent: Lead Developer (Z.ai Code)
Task: Integrate the patelnetworks codebase into the Next.js 16 sandbox at /home/z/my-project, connect to the live Supabase database non-destructively, start the dev server, and verify all routes work.

Work Log:
- Read previous worklog (Task 3-DOCS exploration report) to understand the full project context (29 models, 37 routes, 12 phases, 19 ADRs, all integrations in simulation mode).
- Investigated admin auth mechanism: admin-auth.service.ts uses env-var fallback (superadmin@patelnetworks.in / patel@admin2026) — no DB seeding needed, no destructive ops.
- Compared patelnetworks src/lib/utils.ts (extended: cn + formatPrice + calculateGstBreakdown) vs sandbox (cn only) — used patelnetworks version (superset).
- Verified sandbox package.json is a dependency superset but missing jose (JWT) and tsx (script runner).
- Stage 1: Cleaned sandbox boilerplate (src/app, src/lib, prisma) — preserved src/components/ui (48 shadcn components) and src/hooks.
- Stage 2: Copied patelnetworks src/app (45 files), src/lib (utils.ts, pincodes.ts), src/server (10 service files), src/components/admin (7) + storefront (10), src/components/ui/Badge.tsx (capital B, coexists with sandbox badge.tsx), src/middleware.ts.
- Stage 3: Copied prisma/ (schema.prisma + seed.ts), scripts/ (8 test files), supabase/config.toml, public/ (svgs), word/, .env.example.
- Stage 4: Replaced next.config.ts with patelnetworks version (image remote patterns for Unsplash/Cloudinary/Supabase). Later disabled reactCompiler (plugin not installed — caused 500 errors).
- Stage 5: Merged package.json — added jose ^6.2.12, tsx ^4.23.15; added scripts (db:seed, test:loopback, test:master, typecheck); renamed package to "patelnetworks" v1.3.0-dev.
- Stage 6: Merged globals.css — kept full shadcn oklch variable system + overrode --primary to sky-600 (brand) + added patelnetworks custom classes (.surveillance-badge-pulse, .bg-grid-pattern, scrollbar styling).
- Stage 7: Created .env with live Supabase credentials + freshly generated 64-byte JWT_SECRET (openssl rand). All third-party integrations left in simulation mode (placeholder keys).
- Stage 8: bun install — added jose + tsx (5 packages).
- Stage 9: prisma generate — generated Prisma Client v6.19.2 with all 29 models (local-only, no DB contact).
- Stage 10: Read-only DB verification via raw SQL — confirmed all 29 tables intact with 376 total rows. ZERO writes performed.
  - Tables: addresses(17), admin_profiles(1), audit_logs(62), brands(10), cart_items(3), carts(4), categories(7), customers(7), inventory(19), inventory_movements(44), order_items(28), order_status_history(22), orders(27), otp_verifications(2), payments(3), product_images(20), product_variants(18), products(10), shipment_events(19), shipments(26), skus(19), users(8).
- Stage 11: Started dev server (next dev -p 3000) detached via setsid. Fixed reactCompiler error (disabled in next.config.ts). Server runs cleanly: Next.js 16.1.3 Turbopack, ready in ~700ms.
- Diagnosed system-level DATABASE_URL=file:... override (sandbox SQLite default) — resolved by exporting correct PostgreSQL env vars in persistent shell before launching dev server.
- Route verification via curl: 14 routes return HTTP 200 (/, /products, /kit-builder, /cart, /checkout, /account/login, /about, /contact, /faq, /shipping-policy, /return-policy, /privacy-policy, /terms, /admin/login). /admin returns 307 redirect (middleware works). 404 page renders. Homepage has correct title + DB-driven brand data. Dev log clean.
- Installed agent-browser Chrome binary for visual QA — agent-browser open on localhost:3000 hangs (likely HMR websocket in dev mode prevents page load event). Visual QA deferred to webDevReview cron job.
- Copied all 13 markdown documentation files from patelnetworks repo.
- Updated changelog.md with v1.3.0 entry documenting the full integration.
- Appended ADR-020 to decisions.md documenting the sandbox integration decision (non-destructive DB, shadcn/ui preservation, theme merge, env workaround).
- bun run lint: 1 warning (react-hooks/set-state-in-effect in cart component — non-blocking).

Stage Summary:
- **Database SAFETY CONFIRMED**: Live Supabase database is 100% intact. 376 rows across 29 tables verified via read-only queries. Zero writes, zero migrations, zero schema changes.
- **Dev server WORKING**: Next.js 16.1.3 on port 3000, 14 routes return 200, clean dev.log, DB data renders on homepage.
- **shadcn/ui PRESERVED**: All 48 shadcn components available alongside the custom storefront/admin components for progressive UI enhancement.
- **Documentation CURRENT**: changelog.md (v1.3.0), decisions.md (ADR-020), worklog.md updated. All 13 docs synced.
- **Known issues**: middleware.ts deprecation (→proxy.ts migration planned), 1 lint warning (cart set-state-in-effect), agent-browser QA deferred to cron.
- **Next steps**: Set up webDevReview cron (every 15 min) for ongoing QA + feature development. Begin UI enhancement with shadcn/ui. Address Medusa migration as a documented future decision (not actioned — existing 12-phase custom architecture preserved).


---
Task ID: 9-AESTHETIC-REWORK
Agent: Lead Developer (Z.ai Code)
Task: Execute a full aesthetic rework of the Patel Networks storefront per the user's detailed "aesthetic_rework" brief — transform the AI-generated SaaS-template UI into a premium, deliberately designed product with Apple-level polish, editorial sensibility, restrained neutrals, sharp corners, and a single controlled accent.

Work Log:
- Studied the baseline storefront (Header, Footer, ProductCard, homepage, Badge) — confirmed it exhibited every anti-pattern from the brief: gradient orbs, glassmorphism header, sky→indigo gradient buttons, glow shadows, rainbow category tiles, rounded-2xl everywhere, pulsing dots, emoji in links, gradient clip-text headlines.
- Defined a coherent design direction: "Quiet Hardware / Editorial Security" — warm near-black ink + paper neutrals + single ember (#C2410C) accent, Fraunces serif + Geist sans, sharp corners, hairline borders, no gradients/glow/glass.
- Implemented the design system in src/app/globals.css: full token set (ink/paper/bone/stone/hairline/ember), light + dark themes mapped to shadcn-compatible CSS variables, editorial utility classes (.eyebrow, .display, .btn-ink, .btn-ghost, .link-underline, .media-frame, .dot-rec, .reveal), reduced-motion support.
- Updated src/app/layout.tsx: added Fraunces (variable editorial serif, optical sizing) alongside Geist Sans, set paper background + flex-col sticky-footer structure.
- Created src/hooks/use-scroll-reveal.ts and src/components/storefront/Reveal.tsx: IntersectionObserver-based subtle scroll reveals with a 2.5s fallback so content is never permanently hidden (also fixes full-page screenshot capture).
- Reworked src/components/ui/Badge.tsx: restrained variants (transparent fills, hairline borders, uppercase tracked labels, 2px radius).
- Reworked src/components/storefront/Header.tsx: hairline meta strip replacing the dense announcement bar, editorial "Patel.Networks" wordmark lockup, hairline-underline search input, sharp-corner cart/account buttons, monochrome mobile drawer. Removed gradient logo tile, glassmorphism, sky→indigo gradient CTA.
- Reworked src/components/storefront/Footer.tsx: single hairline trust row replacing the 4-colored-icon-tile SaaS pattern, refined 12-column link grid, mt-auto sticky-bottom preserved.
- Reworked src/components/storefront/ProductCard.tsx: editorial card with sharp corners, hairline border, serif title, reserved top-left badge slot so the grid never jitters. Sold-out items get grayscale + opacity + "Sold out" badge; ₹0 prices show "Price on request".
- Generated two art-directed images via the image-generation skill: public/editorial/hardware-still-life.jpg (864×1152, disassembled CCTV components) and public/editorial/kit-builder-camera.jpg (1344×768, cinematic low-key camera close-up).
- Reworked src/components/storefront/WhatsAppSupportWidget.tsx: replaced the clashing bright-green gradient floating button with a restrained monochrome ink toggle + matching dialogue (resolves the "catastrophic clash" flagged in VLM review).
- Rewrote src/app/page.tsx: cinematic ink hero ("Surveillance hardware, precisely specified." with italic ember accent), new editorial still-life band ("Hardware chosen by people who install it."), categories as a numbered hairline-row index (replacing rainbow tiles), editorial featured-products grid, kit builder section with the cinematic camera image + denser numbered steps (replacing the empty black void), restrained brand wordmark index.
- Debugged a Turbopack panic caused by Fraunces' exotic `SOFT` axis — removed the axis and the panic resolved.
- Diagnosed that the "void" the VLM reported in v3 was a screenshot artifact: the .reveal opacity:0 state hid below-the-fold content in full-page screenshots because IntersectionObserver never fired without scrolling. Fixed via the 2.5s fallback in Reveal + scroll-before-screenshot workflow.
- VLM design review iterations: v3 graded A- (void artifact), v4 graded A- (sold-out card misalignment), v5 graded A (sold-out fix applied — grid now "mathematically and visually sound").
- Updated changelog.md with v1.4.0 entry; appended ADR-021 to decisions.md.

Stage Summary:
- **Aesthetic rework COMPLETE and VLM-graded A** ("one of the best B2B hardware e-commerce designs I have seen", "deliberately designed premium product", "not a Shopify/WooCommerce theme").
- **Design system**: "Quiet Hardware / Editorial Security" — warm neutrals + single ember accent, Fraunces serif + Geist sans, sharp corners, hairline borders, no gradients/glow/glass.
- **All anti-patterns removed**: 0 matches for the old gradient/glassmorphism patterns. Replaced with editorial restraint.
- **Art-directed imagery**: 2 generated cinematic images integrated (hardware still-life + camera close-up).
- **Functionality preserved**: all routes still HTTP 200, DB untouched, shadcn/ui library intact and theme-compatible.
- **Remaining (content, not code)**: some DB product images are generic Unsplash stock (pink gift box, woman with folder) — a photography audit is the next content task.
- **Cron**: webDevReview job (every 15 min, job_id 415773) is active for ongoing QA + feature development.
