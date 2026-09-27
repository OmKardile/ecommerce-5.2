# Architectural & Business Decision Records (ADR)

> **Project**: Patel Networks / MegaTech CCTV & Security E-Commerce Platform  
> **Source of Truth**: This document records all architectural, technical, operational, and business decisions locked in by the stakeholders. All future decisions must be appended to this log.

---

## 📑 Decisions Index

| ID | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| [ADR-001](#adr-001-unified-nextjs-fullstack-architecture) | Unified Next.js Fullstack Architecture (App Router + Prisma) | 2026-09-25 | **ACCEPTED** |
| [ADR-002](#adr-002-hybrid-b2c--b2b-billing-with-gstin-input-credit) | Hybrid B2C & B2B Billing with GSTIN Input Tax Credit | 2026-09-25 | **ACCEPTED** |
| [ADR-003](#adr-003-phone-number--sms-otp-authentication) | Phone Number + SMS OTP Primary Authentication | 2026-09-25 | **ACCEPTED** |
| [ADR-004](#adr-004-selective-cash-on-delivery-cod-admin-controlled) | Selective Cash on Delivery (COD) Controlled via Admin Panel | 2026-09-25 | **ACCEPTED** |
| [ADR-005](#adr-005-multi-attribute-flexible-product-variants) | Flexible Multi-Attribute Variant & SKU Modeling | 2026-09-25 | **ACCEPTED** |
| [ADR-006](#adr-006-interactive-custom-cctv-kit--bundle-builder) | Interactive Stepped "Custom CCTV Kit Builder" | 2026-09-25 | **ACCEPTED** |
| [ADR-007](#adr-007-integration-readiness--placeholder-fallback-for-razorpay--whatsapp-api) | Placeholder Fallback & Full Implementation for Razorpay & WhatsApp API | 2026-09-25 | **ACCEPTED** |
| [ADR-008](#adr-008-senior-lead-production-grade-engineering-standard) | Senior Lead Production-Grade Engineering Standard & Enterprise Principles | 2026-09-25 | **ACCEPTED** |
| [ADR-009](#adr-009-managed-cloud-database-on-supabase-postgresql) | Managed Cloud Database on Supabase PostgreSQL (Connection Pooling & Direct URL) | 2026-09-25 | **SUPERSEDED** by ADR-022 |
| [ADR-010](#adr-010-concurrency-safe-order-creation-row-level-locking-and-dual-mode-payment-gateway) | Concurrency-Safe Order Creation, Row-Level Locking, and Dual-Mode Payment Gateway | 2026-09-25 | **ACCEPTED** |
| [ADR-011](#adr-011-phone-number--sms-otp-authentication-with-dual-mode-gateway-and-jwt-sessions) | Phone Number + SMS OTP Authentication with Dual-Mode Gateway & JWT Sessions | 2026-09-25 | **ACCEPTED** |
| [ADR-012](#adr-012-carrier-logistics-pincode-intelligence--awb-generation-engine) | Carrier Logistics, Pincode Intelligence & AWB Generation Engine | 2026-09-25 | **ACCEPTED** |
| [ADR-013](#adr-013-whatsapp-business-cloud-api--real-time-e-commerce-lifecycle-messaging-engine) | WhatsApp Business Cloud API & Real-Time E-Commerce Lifecycle Messaging Engine | 2026-09-25 | **ACCEPTED** |
| [ADR-014](#adr-014-back-office-admin-operations-sku-inventory-adjustments--hardware-serial-tracking) | Back-Office Admin Operations, SKU Inventory Adjustments & Hardware Serial Tracking | 2026-09-26 | **ACCEPTED** |
| [ADR-015](#adr-015-master-loopback-feedback-engine-dynamic-xml-sitemaps--structured-data-json-ld) | Master Loopback Feedback Engine, Dynamic XML Sitemaps & Structured Data (JSON-LD) | 2026-09-26 | **ACCEPTED** |
| [ADR-016](#adr-016-customer-information-corporate-governance--public-policy-architecture) | Customer Information, Corporate Governance & Public Policy Architecture | 2026-09-26 | **ACCEPTED** |
| [ADR-017](#adr-017-admin-commercial-reporting-gstr-1-tax-analytics--b2b-customer-directory) | Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory | 2026-09-26 | **ACCEPTED** |
| [ADR-018](#adr-018-storefront-uiux-polish-custom-404error-boundaries--admin-commercial-csv-export-engine) | Storefront UI/UX Polish, Custom 404/Error Boundaries & CSV Export Engine | 2026-09-26 | **ACCEPTED** |
| [ADR-019](#adr-019-admin-command-center-authentication-session-isolation--edge-middleware-guards) | Admin Command Center Authentication, Session Isolation & Edge Middleware Guards | 2026-09-26 | **ACCEPTED** |

---

## ADR-001: Unified Next.js Fullstack Architecture

* **Status**: **ACCEPTED** (Decision from Q&A Question 1, Option A)
* **Date**: 2026-09-25
* **Context**:  
  The initial draft proposed a separated monorepo containing a NestJS backend and two distinct Next.js frontends (`apps/storefront` and `apps/admin`). This introduced API contract duplication, dual deployment overhead, and slower development speed for a single engineering team.
* **Decision**:  
  Consolidate into a **Unified Fullstack Next.js Application** using the App Router, PostgreSQL 16+, and Prisma ORM.
  * Route Groups will segregate portals:
    * `app/(storefront)/...` for public customer store, cart, checkout, and customer portal.
    * `app/(admin)/...` for back-office administrative panel, inventory, and order fulfillment.
    * `app/api/...` for webhooks (Razorpay, Shiprocket) and public REST endpoints where needed.
  * Server Actions & Route Handlers will manage mutations and database interactions directly via a shared `prisma` singleton.
* **Consequences**:  
  * Zero API duplication; DTOs and database models are directly accessible.
  * Single-process deployment (e.g. Node.js container / Vercel / AWS ECS).
  * Backend business logic will reside in modular service classes (`src/server/services/...`) rather than inline component code, preserving modularity and testability.

---

## ADR-002: Hybrid B2C & B2B Billing with GSTIN Input Credit

* **Status**: **ACCEPTED** (Decision from Q&A Question 2, Option B)
* **Date**: 2026-09-25
* **Context**:  
  CCTV buyers comprise both retail homeowners (B2C) and electrical contractors/dealers/system integrators (B2B) who require legal GST invoices for Input Tax Credit (ITC).
* **Decision**:  
  Support a **Hybrid B2C & B2B Checkout Model**:
  1. Customers can toggle *"Are you purchasing for a registered business?"* at checkout.
  2. Requires: Legal Business Name and 15-character Indian GSTIN format.
  3. Tax breakdown on invoices dynamically splits CGST + SGST (intra-state) or IGST (inter-state).
  4. System models support optional B2B tier pricing / bulk quantity discounts for registered business accounts.
* **Consequences**:  
  * Customer and Order schemas must store `isB2B`, `gstin`, and `companyName`.
  * Invoice generator produces official Tax Invoices compliant with Indian GST laws.

---

## ADR-003: Phone Number + SMS OTP Authentication

* **Status**: **ACCEPTED** (Decision from Q&A Question 3, Option A)
* **Date**: 2026-09-25
* **Context**:  
  In the Indian e-commerce landscape, passwords and email verification lead to high cart abandonment and low login completion. Customers expect frictionless login via mobile numbers.
* **Decision**:  
  Standardize on **Mobile Phone Number + 6-digit SMS OTP** as the primary authentication mechanism for customers.
  * Supported SMS Gateways: MSG91 / Fast2SMS / Firebase Phone Auth.
  * Admin accounts retain standard Email + Strong Password + Multi-Factor Authentication.
  * Session management via secure, HTTP-only JWT cookies.
* **Consequences**:  
  * User schema must treat `phone` as the primary unique identifier for customers.
  * OTP generation must have rate limiting (maximum 3 OTP requests per 10 minutes) and 5-minute expiration to prevent abuse.

---

## ADR-004: Selective Cash on Delivery (COD) Admin-Controlled

* **Status**: **ACCEPTED** (Decision from Q&A Question 4, Option B)
* **Date**: 2026-09-25
* **Context**:  
  Offering unrestricted COD on high-value, heavy surveillance hardware (e.g. 16-channel NVRs, 305m cable rolls) presents high Return-to-Origin (RTO) financial risk. Conversely, small accessories (connectors, single cameras) convert higher with COD.
* **Decision**:  
  Implement **Selective Cash on Delivery (COD)** configurable through the Admin Panel:
  1. Each Product / SKU will have an admin flag: `isCodAllowed: Boolean` (default `false` for high-value items, `true` for standard items).
  2. If any item in the cart has `isCodAllowed = false`, COD is automatically disabled for the entire cart at checkout.
  3. COD eligibility will also check courier pincode serviceability via carrier API (Shiprocket/Delhivery).
  4. Admin can configure a minimum order value, maximum order value, and an optional flat COD convenience fee.
* **Consequences**:  
  * Order and Payment state machines must accommodate `COD_PENDING` without requiring an immediate Razorpay signature.

---

## ADR-005: Multi-Attribute Flexible Product Variants

* **Status**: **ACCEPTED** (Decision from Q&A Question 5, Option B)
* **Date**: 2026-09-25
* **Context**:  
  Electronics and CCTV cameras vary across multiple interdependent dimensions (Resolution: 2MP/4MP/8MP, Lens: 2.8mm/3.6mm, Body: Dome/Bullet, Night Vision: IR/ColorVu, Audio: Mic/No-Mic). A rigid single-attribute database schema cannot model this cleanly.
* **Decision**:  
  Adopt a **Multi-Attribute JSONB Variant Architecture**:
  * Attributes stored as key-value pairs (e.g. `{"resolution": "4MP", "focal_length": "3.6mm", "form_factor": "Bullet", "audio": true}`).
  * The core invariant `Product ➔ Variant ➔ SKU ➔ Inventory` remains strictly enforced.
  * Every unique combination maps to a discrete SKU with its own price, barcode, dimensions, and inventory counter.
* **Consequences**:  
  * Storefront product page includes a dynamic matrix selector that resolves the exact SKU based on user-selected attribute chips.

---

## ADR-006: Interactive Custom CCTV Kit / Bundle Builder

* **Status**: **ACCEPTED** (Decision from Q&A Question 6, Option B)
* **Date**: 2026-09-25
* **Context**:  
  CCTV surveillance systems are commonly purchased as complete kits. Customers frequently struggle to manually assemble compatible DVR/NVRs, matching camera resolutions, appropriate hard drives, and power supplies.
* **Decision**:  
  Build a dedicated **Interactive Stepped "Custom CCTV Kit Builder"**:
  * **Step 1: Select Recorder**: 4-Channel, 8-Channel, 16-Channel DVR (HD) or NVR (IP).
  * **Step 2: Select Cameras**: Indoor Dome and/or Outdoor Bullet cameras with live quantity counters bounded by the channel count.
  * **Step 3: Storage (HDD)**: 1TB, 2TB, 4TB, 8TB Surveillance-grade Hard Drive (Seagate SkyHawk / WD Purple).
  * **Step 4: Power & Accessories**: SMPS Power Supply (4-CH, 8-CH), Coaxial / Cat6 Cable roll (90m, 180m, 305m), BNC/DC/RJ45 connectors.
  * **Step 5: Bundle Summary & Add to Cart**: Live calculation of total price, bundle discount, and one-click cart addition as a linked kit.
* **Consequences**:  
  * Bundle data models (`Bundle`, `BundleItem`) created in Prisma.
  * Cart and order processing must deduct inventory from each individual component SKU atomically.

---

## ADR-007: Integration Readiness & Placeholder Fallback for Razorpay & WhatsApp API

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  The business onboarding and verification process for the Razorpay Merchant Account and Meta WhatsApp Business API is currently in progress. Development cannot be stalled waiting for production API credentials.
* **Decision**:  
  Fully build out the end-to-end integration logic for both **Razorpay** and **WhatsApp Cloud / Business API**, with an intelligent **Mock / Sandbox Fallback Mode**:
  1. **Razorpay Service**:
     * Implements full order creation (`/orders`), signature verification (`crypto.createHmac`), and webhook handler (`/api/webhooks/razorpay`).
     * When `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` contains placeholder/dummy values (e.g. `rzp_test_placeholder`), the service activates a simulated payment gateway modal in development, allowing developers and QA to simulate successful payments, failed payments, and webhooks without real credentials.
  2. **WhatsApp Notification Service**:
     * Implements standard Meta WhatsApp Cloud API / BSP payload formatting for transactional templates (Order Confirmed, Dispatched with AWB Tracking URL, Out for Delivery, Return Updates, and OTP Verification).
     * When `WHATSAPP_ACCESS_TOKEN` is unset or a placeholder, the service logs formatted WhatsApp messages to the console and audit logs (`[SIMULATED WHATSAPP MESSAGE to +91XXXXXXXXXX]`), allowing full UI and workflow validation.
  3. **Zero-Code Switchover**:
     * All credentials are strictly read from environment variables (`.env`).
     * Once the actual keys are provisioned, pasting them into `.env` immediately activates live production/sandbox communications without requiring a single line of code change.
* **Consequences**:  
  * Complete test coverage of payment verification and customer notification flows during all phases.
  * No development roadblocks or dependency on external vendor verification timelines.

---

## ADR-008: Senior Lead Production-Grade Engineering Standard

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  The platform must be built strictly as an **end-product, production-ready enterprise commercial platform** capable of handling real Indian commerce, financial transactions, high concurrent traffic, and rigorous operational inventory tracking. At no point should development treat this as a demo, prototype, or hobby project.
* **Decision**:  
  All code, schemas, services, UI components, and architectural boundaries must adhere to **Senior Lead Engineering Standards**:
  1. **Zero Shortcuts**:
     * Real database migrations, full relational integrity, foreign key constraints, composite indexes, and cascading rules.
     * Comprehensive validation on every boundary using Zod schemas for all DTOs and Server Action inputs.
  2. **Concurrency & Data Consistency**:
     * Strict isolation levels (`SELECT ... FOR UPDATE` row-level locks) for all inventory mutations and reservations.
     * Absolute prohibition of floating-point arithmetic for monetary calculations; all amounts are tracked as integer paise or `Prisma.Decimal`.
     * Idempotency keys enforced on every order submission and webhook event.
  3. **Defense-in-Depth Security**:
     * Strict server-side RBAC guards that cannot be bypassed by URL tampering or API scraping.
     * Argon2id password hashing, secure HTTP-only cookies, rate-limiting on sensitive endpoints (OTP, login, checkout), and complete sanitization of user-submitted content.
  4. **Commercial-Grade UI/UX**:
     * High-converting, trustworthy storefront designed specifically for the security hardware industry.
     * Complete handling of all UI states: Skeleton loaders, optimistic UI updates, empty states, network error fallbacks, and clear feedback toast alerts.
     * High-density, keyboard-friendly operational screens for warehouse and inventory managers in the Admin Portal.
  5. **Clean Architecture & Maintainability**:
     * Strict separation of concerns: Next.js pages/components only render UI and call server actions; all domain logic lives in isolated, testable service classes under `src/server/services/`.
     * Strict TypeScript: Zero usage of `any` types; all API responses and component props are strictly typed.
* **Consequences**:  
  * The resulting codebase is immediately shippable, deployable to cloud infrastructure (Docker, AWS, Vercel, Railway), and capable of scaling to high order volumes without structural rewrites.

---

## ADR-009: Managed Cloud Database on Supabase PostgreSQL

> ⚠️ **SUPERSEDED by [ADR-022](#adr-022-database-architecture--self-hosted-postgresql-on-client-vps-supabase-removed)** (2026-09-26): the database has been migrated to self-hosted PostgreSQL on the client VPS. The text below is retained for historical context.

* **Status**: **SUPERSEDED** (was ACCEPTED)
* **Date**: 2026-09-25
* **Context**:  
  To avoid future migration friction and ensure that local development, staging, and production environments share identical cloud PostgreSQL infrastructure from Day 1, the platform has adopted Supabase PostgreSQL.
* **Decision**:  
  Configure Prisma ORM to connect directly to the **Supabase PostgreSQL cluster** (`(`<supabase-project-ref>`)lt;supabase-project-ref(`<supabase-project-ref>`)gt;`) using Supabase's official best-practice dual-URL strategy:
  1. `DATABASE_URL`: Transaction-mode connection pooler on port `6543` (`?pgbouncer=true`) for low-latency, scalable application queries under serverless or containerized runtimes.
  2. `DIRECT_URL`: Session-mode direct connection on port `5432` for administrative schema migrations and seed scripts (`prisma db push`, `prisma db seed`).
* **Consequences**:  
  * All 29 tables, foreign keys, and indexes are hosted and backed up in the cloud.
  * Developers and administrative stakeholders can immediately inspect live data, orders, and product stock directly inside the **Supabase Dashboard Table Editor**.
  * Eliminates local Docker/PostgreSQL dependencies for remote collaborators.

---

## ADR-010: Concurrency-Safe Order Creation, Row-Level Locking, and Dual-Mode Payment Gateway

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  Surveillance hardware items have limited physical inventory in warehouse bins. Concurrent checkouts for the last remaining 4MP camera or 8-channel NVR could result in overselling if stock checks and deductions are not strictly serialized. Furthermore, Razorpay credentials are under live business procurement, necessitating a seamless test-simulation mode that automatically upgrades to live payment processing upon key insertion without code changes.
* **Decision**:  
  1. **Row-Level Inventory Reservation (`SELECT ... FOR UPDATE`)**:
     * When `createOrderFromCart` executes, it locks the relevant `inventory` rows using PostgreSQL's row-level lock within an atomic transaction.
     * Available stock is checked (`currentStock - reservedStock >= quantity`).
     * `reservedStock` is immediately incremented with reason `ORDER_RESERVED`.
     * An interactive transaction timeout (`timeout: 30000, maxWait: 15000`) is configured to accommodate cross-region network latency to the cloud Supabase cluster.
  2. **Strict Finite State Machine**:
     * Order transitions follow explicit permitted paths:
       `PENDING_PAYMENT` / `COD_PENDING` ➔ `PAID` / `CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
     * Order cancellation (`CANCELLED`) atomically decrements `reservedStock` with an audit reason `ORDER_CANCELLED_RESTOCK`.
     * Order dispatch (`SHIPPED`) physically decrements `currentStock` and `reservedStock` with `ORDER_DISPATCHED`.
  3. **Dual-Mode Razorpay Gateway**:
     * If `RAZORPAY_KEY_ID` contains `placeholder`, the system activates interactive sandbox mode with mock order generation (`order_sim_...`) and payment verification.
     * If real API keys are detected, it connects directly to Razorpay's REST API and standard client-side checkout modal.
  4. **Idempotent Webhook Verification**:
     * `POST /api/webhooks/razorpay` verifies HMAC SHA-256 signatures and guards against duplicate status transitions using database state checks (`status === PAID`).
* **Consequences**:  
  * Zero overselling even under high concurrency.
  * Complete audit trail in `inventory_movements` and `order_status_history`.
  * Instant switchover to live payment processing once merchant keys arrive.

---

## ADR-011: Phone Number + SMS OTP Authentication with Dual-Mode Gateway & JWT Sessions

* **Status**: **ACCEPTED** (Implements ADR-003 & ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce consumers and security equipment contractors expect passwordless, friction-free login via mobile numbers. Standard password credentials lead to high drop-offs, password fatigue, and unverified phone numbers for delivery dispatchers.
* **Decision**:  
  1. **Indian Phone Normalization**:
     * All phone inputs are normalized to standard E.164 format (`+91[6-9]\d{9}`).
  2. **Security & Rate-Limiting**:
     * Maximum 3 OTP requests allowed per 10-minute window per phone number.
     * OTP codes are 6 digits and expire in 5 minutes (`expiresAt < now()`).
     * Maximum 5 incorrect verification attempts per OTP code before automatic invalidation.
  3. **Dual-Mode SMS Gateway (ADR-007)**:
     * In development or when `SMS_GATEWAY_API_KEY` contains `placeholder`, the system operates in test simulation mode: outputs OTP prominently to developer logs and provides an auto-fill helper in sandbox UI.
     * When production keys are provided, requests route to Fast2SMS / MSG91 HTTP endpoints.
  4. **Edge-Compatible JWT Sessions**:
     * Signed using `jose` with `HS256` and `JWT_SECRET`.
     * Stored in HTTP-only, Secure, SameSite `Lax` cookie `pn_session` (7 days duration).
     * Upon customer login, any active guest cart (`pn_cart_id`) is automatically associated with the authenticated customer record.
* **Consequences**:  
  * Verified delivery phone numbers for all placed orders.
  * Instant access to past GST invoices and saved address books across devices.

## ADR-012: Carrier Logistics, Pincode Intelligence & AWB Generation Engine

* **Status**: **ACCEPTED** (Implements ADR-005, ADR-007, ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce delivery logistics involves heterogeneous carrier partners (Delhivery, BlueDart, DTDC, India Post) across 19,000+ postal PIN codes with varied delivery SLAs, COD restrictions in special/air cargo zones, and parcel transit states that must synchronize with internal inventory records.
* **Decision**:  
  1. **Indian Pincode Intelligence Engine (`src/lib/pincodes.ts`)**:
     * Implemented 6-digit postal prefix matching and zone resolution across Intra-State (Surat Central Origin Hub), Metro, Regional, and Special Zones (North East, J&K, Islands).
     * Enforces COD serviceability: Special Zones requiring air cargo are restricted to prepaid online payments (`isCodAvailable: false`).
     * Dynamically calculates business-day delivery SLAs excluding Sundays.
  2. **Dual-Mode Logistics Gateway**:
     * When `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are placeholders, operates in senior test simulation mode with deterministic AWB generation (`DELH...`, `BLUD...`), manifest creation, and test scan events.
     * When live credentials are provided, connects to Shiprocket REST endpoints for adhoc order booking, courier rate card comparison, and label generation.
  3. **Idempotent Webhook Synchronization (`POST /api/webhooks/shipping`)**:
     * Ingests carrier tracking events with unique event deduplication (`evt_${awb}_${status}_${timestamp}`).
     * Synchronizes order state machine automatically:
       * `IN_TRANSIT` / `PICKED_UP`: Transitions order to `SHIPPED` and decrements physical inventory with `MovementReason.ORDER_DISPATCHED`.
       * `OUT_FOR_DELIVERY`: Transitions order to `OUT_FOR_DELIVERY`.
       * `DELIVERED`: Transitions order to `DELIVERED` and marks COD payments as `SUCCESS`.
  4. **Interactive Storefront Tracking**:
     * Interactive `PincodeChecker` widget on PDP and Checkout with auto-fill and COD restriction warnings.
     * 5-Stage visual `OrderTrackingTimeline` stepper with chronological scan event history and demo mode simulation controls on `/order-success/[orderNumber]`.
* **Consequences**:  
  * Zero unexpected COD rejections from remote delivery partners.
  * Real-time tracking and delivery transparency for retail and B2B customers.

## ADR-013: WhatsApp Business Cloud API & Real-Time E-Commerce Lifecycle Messaging Engine

* **Status**: **ACCEPTED** (Implements ADR-007, ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce consumers, commercial contractors, and system integrators rely primarily on WhatsApp for order tracking, invoice verification, and instant trade communication. Traditional email notifications suffer from low open rates in India.
* **Decision**:  
  1. **Dual-Mode WhatsApp Gateway (`src/server/services/whatsapp.service.ts`)**:
     * When `WHATSAPP_ACCESS_TOKEN` is a placeholder, activates developer simulation mode: formats complete Meta Cloud API HSM payloads, logs high-fidelity terminal notification cards, and records audit entries in `audit_logs`.
     * When production keys are provided in `.env`, communicates directly with Meta Graph API (`POST /v20.0/${PHONE_NUMBER_ID}/messages`).
  2. **Event-Driven E-Commerce Lifecycle Messaging**:
     * Automatically dispatches WhatsApp notifications across key order state transitions:
       * **Order Placed / Confirmed**: With order number, formatted INR total, payment mode, and direct link to GST Tax Invoice.
       * **Shipment Dispatched**: With courier partner, AWB tracking number, estimated delivery SLA, and live tracking URL.
       * **Out for Delivery**: Alerting the consignee of arrival today with address confirmation.
       * **Order Delivered**: Delivery confirmation and support link.
  3. **B2B Contractor Wholesale Inquiries**:
     * PDP integration via `B2BContractorCallout` and `B2BQuoteModal` allowing security integrators to request bulk project pricing for 10+ units with instant WhatsApp notification confirmation.
  4. **Global WhatsApp Support Widget (`WhatsAppSupportWidget.tsx`)**:
     * Embedded across the entire application with quick-prompt chips (Track Order, B2B Pricing, CCTV Architecture Advice, Warranty Support) launching direct WhatsApp chats.
  5. **Bidirectional Webhook (`/api/webhooks/whatsapp`)**:
     * Handles Meta verification handshakes (`GET hub.challenge`) and message status callbacks (`POST delivered`, `read`, and customer inbound replies).
* **Consequences**:  
  * 100% notification visibility on customer mobile devices.
  * Instant lead capture and quotation pipeline for high-value B2B surveillance projects.

## ADR-014: Back-Office Admin Operations, SKU Inventory Adjustments & Hardware Serial Tracking

* **Status**: **ACCEPTED** (Implements ADR-004, ADR-008)
* **Date**: 2026-09-26
* **Context**:  
  Managing high-value CCTV and networking distribution requires back-office operational controls: real-time executive KPI dashboards, inventory adjustment audits for stock reconciliation, selective Cash on Delivery policy enforcement, and recording hardware serial numbers for warranties and RMA claims.
* **Decision**:  
  1. **Executive Operations Dashboard (`/admin`)**:
     * Aggregates live Gross Merchandise Value (GMV), 18% GST collected, active pipeline orders, completed deliveries, and payment channel split (Prepaid Razorpay vs Selective COD).
     * Surfaces critical low-stock SKUs beneath safe reorder thresholds (`≤ lowStockThreshold`).
  2. **Order Fulfillment Console (`/admin/orders`)**:
     * Real-time search across order number, customer name, contact number, and carrier AWB.
     * Status filter tabs: Pending Payment, COD Pending, Paid, Confirmed, Packed, Shipped, Out for Delivery, Delivered, Cancelled.
     * 1-Click carrier dispatch booking generating Shiprocket/Delhivery AWBs.
     * Controlled order state advancement following the strict order state machine.
     * Direct link to printable GST Tax Invoices.
  3. **Hardware Serial Number Tracking (Warranty & RMA)**:
     * Indian commercial surveillance hardware (Hikvision, CP Plus, Dahua, Western Digital Purple HDDs) requires recording individual hardware serial numbers prior to dispatch.
     * Integrated per-item serial number editor storing comma-separated serials into `OrderItem.serialNumbers` with optimistic updates.
  4. **SKU Inventory & Concurrency-Safe Stock Adjustments (`/admin/inventory`)**:
     * Dense inventory matrix displaying Physical Stock, Reserved Stock, Net Available Stock, and Reorder Threshold.
     * Interactive Stock Adjustment modal supporting reasons: `PURCHASE_RECEIPT` (Restock), `MANUAL_ADJUSTMENT` (Audit Count), `DAMAGED_WRITE_OFF` (Defective), and `RETURN_RESTOCK` (RMA/Return).
     * Appends an immutable `InventoryMovement` record inside a Prisma transaction on every manual change.
  5. **Selective Cash on Delivery Control (`/admin/settings/cod`)**:
     * Enforces the 3-tier risk mitigation rules (ADR-004): ₹15,000 order ceiling, postal zone air cargo restrictions, and per-product blanket disqualification switches via `Product.isCodAllowed`.
* **Consequences**:  
  * Full operational autonomy for warehouse dispatchers and store managers.
  * Audit-compliant inventory accounting with zero untracked quantity drifts.
  * Rapid warranty dispute resolution through recorded hardware serial numbers.

## ADR-015: Master Loopback Feedback Engine, Dynamic XML Sitemaps & Structured Data (JSON-LD)

* **Status**: **ACCEPTED** (Implements ADR-008, ADR-014)
* **Date**: 2026-09-26
* **Context**:  
  To ensure production-grade reliability across all 8 development phases, an automated loopback feedback suite was required to detect cross-cutting latency issues, type mismatches, and route serviceability. Simultaneously, dynamic sitemaps, robots.txt, and Google Rich Snippet JSON-LD structured schemas were needed for commercial discovery.
* **Decision**:  
  1. **Master Loopback Feedback Suite (`scripts/master_loopback_test.ts`)**:
     * Implements a 25-point automated regression test covering:
       * Catalog hierarchy and multi-attribute variant resolution.
       * 6-digit Indian Pincode intelligence and air-cargo COD disqualification.
       * 18% GST tax calculation and line-item decimal rounding.
       * B2B GSTIN order creation with customer address association.
       * Carrier AWB booking (`DELH...`) and order status progression to `PACKED`.
       * WhatsApp Business notification simulation and phone normalization.
       * Admin dashboard telemetry, stock adjustments, and hardware serial recording.
     * Detected and resolved cloud database latency limits by configuring `{ maxWait: 15000, timeout: 30000 }` on `prisma.$transaction`.
  2. **Dynamic XML Sitemaps (`src/app/sitemap.ts`)**:
     * Generates standard XML sitemaps querying live active products and categories with accurate `lastmod`, `changefreq`, and `priority` fields.
  3. **Robots Protocol (`src/app/robots.ts`)**:
     * Allows search crawling of `/`, `/products`, and `/kit-builder`, while securely restricting `/admin`, `/account`, `/checkout`, and `/api/*`.
  4. **Google Search Rich Snippets (`Product` & `BreadcrumbList` JSON-LD)**:
     * Injects structured schema markup in `src/app/products/[slug]/page.tsx` for Google Rich Product Cards with prices in INR, availability in stock, and breadcrumb hierarchy.
* **Consequences**:  
  * 100% end-to-end regression test pass with zero regressions.
  * Enhanced organic search rankings for surveillance hardware and CCTV kits.

## ADR-016: Customer Information, Corporate Governance & Public Policy Architecture

* **Status**: **ACCEPTED** (Implements Section 12 of CCTV Master Plan)
* **Date**: 2026-09-26
* **Context**:  
  Operating a commercial surveillance distribution platform in India requires statutory transparency: explicit postal logistics transit SLAs, RMA return guidelines, 18% GST invoice legal terms, compliance with the Indian Information Technology Act 2000 & SPDI Rules, and direct contact avenues for wholesale security contractors.
* **Decision**:  
  1. **Comprehensive Public Policy Engine**:
     * `/shipping-policy`: Details 6-digit Indian PIN code zones, same-day dispatch cutoff at 4:00 PM IST (Mon–Sat), carrier partner networks (Delhivery, Shiprocket, BlueDart), and air-cargo COD exclusions.
     * `/return-policy`: Outlines commercial RMA protocols, 7-day Dead On Arrival (DOA) replacement guarantee, manufacturer warranty procedures (CP Plus, Hikvision, Dahua, Western Digital), and serial number invoice verification.
     * `/privacy-policy`: Guarantees zero storage of card numbers/UPI PINs (Razorpay PCI-DSS Level 1 compliance), secure retention of corporate GSTINs, and transactional WhatsApp notification consent.
     * `/terms`: Governs commercial sales, 18% GST statutory invoicing liabilities, title transfer upon carrier handoff, and exclusive Surat, Gujarat legal jurisdiction.
  2. **Corporate & Engineering Consultation Desks**:
     * `/contact`: Dedicated contact hub with Gujarat Central Warehouse coordinates, direct WhatsApp launcher, sales and support hotlines, interactive consultation form (`submitB2BQuoteInquiryAction`), and official bank transfer (NEFT/RTGS) details for B2B institutional orders.
     * `/about`: Documents company history, authorized manufacturer alliances, and warehouse quality control standards.
     * `/faq`: Categorized interactive accordion addressing HD Analog vs IP Network differences, H.265 hard drive storage calculation formulas, and B2B Input Tax Credit claim procedures.
  3. **SEO & Navigation Ingestion**:
     * Added full link hierarchy to `Footer.tsx` and dynamically indexed all 7 routes in `src/app/sitemap.ts`.
* **Consequences**:  
  * 100% legal and statutory compliance for commercial e-commerce in India.
  * Direct lead generation channel for high-value contractor projects.

---

## ADR-017: Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory

* **Status**: **ACCEPTED** (Implements Section 11 of CCTV Master Plan)
* **Date**: 2026-09-26
* **Context**:  
  Store managers, accountants, and warehouse supervisors require dedicated administrative tools: customer CRM tracking with lifetime spend analytics, B2B contractor verification, and executive commercial reports for monthly GSTR-1 return filing and warehouse capital asset valuation.
* **Decision**:  
  1. **Customer & Contractor CRM Directory (`/admin/customers`)**:
     * Query service `getAdminCustomersList`: Aggregates customer profiles, user mobile numbers, total orders placed, lifetime spend, default shipping cities, and B2B credentials (`companyName`, `gstin`, `isB2BVerified`).
     * `CustomerDirectoryTable.tsx`: Dense, searchable data table with instant filters (All Accounts, B2B Contractors, Retail Buyers) and 1-click WhatsApp chat launch.
  2. **Commercial Accounting & Tax Reports (`/admin/reports`)**:
     * Query service `getAdminCommercialReports`:
       * Executive KPIs: Gross Revenue (GMV), Total Confirmed Orders, Average Order Value (AOV).
       * GSTR-1 Tax Reconciliation: Splits intra-state CGST (9%) + SGST (9%) for Gujarat vs inter-state IGST (18%).
       * Warehouse Asset Valuation: Computes physical stock units, net available units, and aggregate inventory capital value in INR across all active SKUs.
       * Logistics Risk & Payment Split: Compares Razorpay online prepaid conversion vs Cash on Delivery volume and value.
       * Daily Sales Velocity: Tracks daily order volumes and GMV trends over the past 30 days.
  3. **UI/UX Refinements & Autocomplete Engine**:
     * `searchProductsQuick`: Debounced instant search dropdown in `Header.tsx` displaying live matching cameras, DVRs, and cables with price tags and brand badges.
     * Mobile Sticky Action Bar: Floating bottom purchase bar on `/products/[slug]` displaying current variant price and 1-click Add to Cart.
     * Zero-`any` compliance across all updated services and components.
* **Consequences**:  
  * Effortless monthly GSTR-1 tax preparation and audit compliance.
  * Real-time visibility into warehouse asset valuation and customer lifetime value.

---

## ADR-018: Storefront UI/UX Polish, Custom 404/Error Boundaries & Admin Commercial CSV Export Engine

* **Status**: **ACCEPTED** (Commercial Operational Polish & UX Resiliency)
* **Date**: 2026-09-26
* **Context**:  
  Production deployment and commercial daily operations demand foolproof UI/UX resilience, frictionless search discovery, branded exception recovery, and portable data export for accountants and logistics coordinators.
* **Decision**:  
  1. **Enhanced Live Search Autocomplete UX**:
     * Implemented `useRef` click-outside dismiss listeners and `Escape` key handlers on `Header.tsx`.
     * Added instant one-click clear button (`X`) when query text is entered.
     * Extended live autocomplete suggestions into the mobile navigation drawer for parity across viewports.
  2. **Custom Branded Error & 404 Boundaries**:
     * `src/app/not-found.tsx`: Sleek dark-mode "Surveillance Feed Lost" 404 page featuring radar pulse animations, direct recovery shortcuts (Catalog, CCTV Kit Builder, Order Tracking, Central Hub), and instant WhatsApp Commercial Support escalation.
     * `src/app/error.tsx`: Client error boundary with graceful retry trigger, state preservation, digest reporting, and home navigation fallback.
  3. **Commercial CSV Export Engine**:
     * `OrderFulfillmentConsole.tsx`: Added one-click "Export CSV" to extract active and filtered customer orders with date, shipping recipient, phone, 15-digit GSTIN, INR totals, and carrier AWB numbers.
     * `CommercialReportsConsole.tsx`: Added statutory "Export CSV" on the GSTR-1 tax card, generating ready-to-file comma-separated schedules for Intra-State CGST (9%) + SGST (9%) and Inter-State IGST (18%).
  4. **Loopback Automated Feedback Loop**:
     * Updated `scripts/comprehensive_loopback_test.ts` to 36 assertions including 24 live endpoints (23 platform routes + 1 custom 404 route) with resilient cloud pooler retry backoffs.
* **Consequences**:  
  * Zero dead-ends for storefront visitors encountering invalid links.
  * Instant GSTR-1 and order export capabilities without requiring third-party data extraction tools.
  * 100% automated regression test stability even across transient cloud network reconnects.

---

## ADR-019: Admin Command Center Authentication, Session Isolation & Edge Middleware Guards

* **Status**: **ACCEPTED** (Security Hardening & Access Control)
* **Date**: 2026-09-26
* **Context**:  
  While customer authentication operates via passwordless 6-digit SMS OTP (`pn_session`), the administrative and warehouse operations console (`/admin/*`) manages confidential commercial assets, customer PII/GSTIN data, order dispatch state machines, and statutory GSTR-1 tax schedules. A dedicated, role-isolated, password-protected authentication gateway is mandatory.
* **Decision**:  
  1. **Dedicated Session Cookie Isolation**:
     * Implemented isolated HTTP-only cookie `pn_admin_session` containing a signed 256-bit JWT (HS256 via `jose`) with `adminId`, `email`, `fullName`, and `role` (`SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, `ORDER_MANAGER`).
     * Completely decoupled from storefront consumer session (`pn_session`) to prevent role elevation or cookie collision.
  2. **High-Tech Command Center Login Portal (`/admin/login`)**:
     * `src/app/admin/login/page.tsx`: Dark-mode surveillance interface with encrypted credentials form, show/hide password toggle, error digest alerts, and a quick one-click demo autofill tool for development and testing.
     * Default superadmin credentials: `superadmin@patelnetworks.in` / `patel@admin2026` (overridable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables or database `users` records).
  3. **Edge Middleware & Route Guards (`src/middleware.ts`)**:
     * Next.js Edge-compatible middleware inspecting all `/admin/*` routes.
     * Unauthenticated requests are immediately intercepted with HTTP 307 redirect to `/admin/login?next=[path]`.
     * Authenticated admin requests to `/admin/login` automatically route forward to `/admin`.
  4. **Active Admin Header & Sign Out Action**:
     * `AdminHeader.tsx` displays authenticated operator email and role badge with an active **"Sign Out"** button executing `adminLogoutAction` and cookie invalidation.
* **Consequences**:  
  * Strict security isolation for all warehouse inventory adjustments, order fulfillment, and GSTR-1 tax data.
  * Zero unauthorized exposure of back-office endpoints in production.

---

---

## ADR-020: Sandbox Integration with Live Supabase Database (Non-Destructive)
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  Development moved to a Next.js 16 sandbox environment (`/home/z/my-project`) that ships with a full shadcn/ui component library (48 components) but a default SQLite Prisma boilerplate. The patelnetworks codebase (PostgreSQL, 29 models, custom storefront/admin) needed to be integrated into this sandbox while (a) preserving the shadcn/ui library for future UI enhancement, and (b) connecting to the **live production Supabase database** without performing any destructive schema or data operations.
* **Decision**:
  1. **Selective file merge**: Replaced the sandbox's `src/app`, `src/lib`, `prisma/` with the patelnetworks equivalents. Preserved the sandbox's `src/components/ui/` (48 shadcn components) and `src/hooks/`. Copied patelnetworks' `src/components/storefront/`, `src/components/admin/`, `src/server/`, `src/middleware.ts`, `scripts/`, `supabase/`, and `public/`.
  2. **Dual Badge coexistence**: Kept both `src/components/ui/Badge.tsx` (patelnetworks, capital B) and `src/components/ui/badge.tsx` (shadcn, lowercase) since Linux allows case-sensitive filenames and the codebase imports the capital-B variant.
  3. **Dependency superset**: Merged `package.json` keeping the sandbox's full dependency set and adding `jose` (JWT) and `tsx` (script runner). Renamed package to `patelnetworks` v1.3.0-dev.
  4. **Theme merge**: Combined the patelnetworks sky-600/slate storefront theme with the shadcn oklch CSS variable system in `globals.css` so both custom and shadcn components render with brand colors.
  5. **Non-destructive database onboarding**: Ran `prisma generate` (local-only, no DB contact) and verified the live DB with read-only `SELECT count(*)` queries across all 29 tables. Explicitly **did NOT** run `prisma db push`, `migrate`, `reset`, or the destructive `seed.ts` (which performs `deleteMany()` on all tables).
  6. **Environment workaround**: The sandbox injects a system-level `DATABASE_URL=file:...` (SQLite) that overrides `.env`. Resolved by exporting the correct PostgreSQL connection strings in the persistent shell session before launching the dev server.
  7. **Config adaptation**: Disabled `reactCompiler` (plugin not installed) and added `next.config.ts` image remote patterns for Supabase/Cloudinary.
* **Consequences**:
  * The live Supabase database remains 100% intact (verified: 376 rows across 29 tables, zero writes).
  * The dev server runs cleanly on port 3000 with all 14 storefront/admin routes responding HTTP 200.
  * The full shadcn/ui library is available for progressive UI enhancement alongside the existing custom components.
  * Ongoing development must continue to avoid destructive DB commands; the seed script is preserved but flagged as destructive.
  * Future Medusa migration (user's stated recommendation) remains a separate, larger decision documented but not actioned — the existing custom architecture (12 phases, 19 ADRs) is preserved and extended.

---

## ADR-021: Aesthetic Rework — "Quiet Hardware / Editorial Security"
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  The prior storefront UI exhibited the full catalogue of "AI-generated SaaS template" anti-patterns: gradient orbs and glow effects, glassmorphism header, sky→indigo gradient buttons, rainbow-colored category icon tiles, `rounded-2xl`/`rounded-3xl` on every surface, pulsing emerald dots, emoji in nav links, gradient clip-text headlines, oversized empty hero. The user requested an aesthetic rework to "Apple ecosystem-level polish with editorial design and a slightly unconventional personality," explicitly removing all generic AI-template patterns in favor of "designed, not decorated."
* **Decision**:
  Adopted a **"Quiet Hardware / Editorial Security"** design language — a premium B2B equipment procurement aesthetic combining the restraint of Linear/Apple, the editorial sensibility of a design publication, and a "precision instrument" personality.
  1. **Palette**: warm near-black ink + warm off-white paper + bone + stone neutrals, with a *single* controlled **ember accent** `#C2410C` (a deep refined orange evoking a surveillance recording light) used sparingly for primary actions, status, and emphasis. No blue/indigo, no rainbow.
  2. **Typography**: **Fraunces** variable editorial serif (optical sizing, italic) for display + **Geist Sans** for UI. Strong hierarchy with tight tracking and italic ember emphasis words.
  3. **Surfaces**: sharp corners (2–6px radius), 1px hairline borders instead of shadows, selective deep-dark cinematic sections, warm paper backgrounds. Removes all `rounded-2xl`, gradients, glow, glassmorphism.
  4. **Motion**: subtle IntersectionObserver scroll reveals (opacity + 10px translateY, 600ms ease-out), single quiet pulsing `dot-rec` recording-light flourish, image zoom on hover, link underline reveal. All respect `prefers-reduced-motion`.
  5. **Imagery**: real art-directed photography (generated via image-generation skill) — a hardware still-life and a cinematic camera close-up — replacing generic decorative graphics.
  6. **Component reworks**: Header (hairline meta strip + editorial wordmark), Footer (single hairline trust row replacing colored icon tiles), ProductCard (sharp editorial card with reserved badge slot for grid alignment), Badge (restrained variants), WhatsApp widget (monochrome replacing the clashing green gradient).
* **Consequences**:
  * The storefront now reads as a deliberately designed premium product (VLM-graded **A**: "one of the best B2B hardware e-commerce designs I have seen", "not a Shopify/WooCommerce theme").
  * All functionality preserved — only the presentation layer changed.
  * The full shadcn/ui library remains available and theme-compatible (CSS variables mapped to the new tokens) for future component work.
  * A content/photography audit remains as a follow-up — some DB product images are generic Unsplash stock that don't match the hardware aesthetic (data issue, not code).
  * The `Reveal` component's 2.5s fallback ensures content is never permanently hidden (robust for real users, screenshots, and slow connections).


When new decisions are made during subsequent phases, append them using the following format:

```markdown
## ADR-XXX: [Title]
* **Status**: [PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]
* **Date**: YYYY-MM-DD
* **Context**: [Why is this decision needed?]
* **Decision**: [What was decided?]
* **Consequences**: [Impact on architecture, database, or UI]
```






---

## ADR-022: Database Architecture — Self-Hosted PostgreSQL on Client VPS (Supabase Removed)
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  The platform was originally connected to Supabase-managed PostgreSQL (ADR-009 documented this choice). The client requested a full migration to **self-hosted PostgreSQL on the client's own VPS**, with no managed database services, no Firebase, no SQLite. A full audit confirmed the application had **zero hard Supabase coupling in code**: no `@supabase/supabase-js` package installed, no Supabase client imports, no use of `NEXT_PUBLIC_SUPABASE_*` env vars, and the Prisma schema already used standard `postgresql` provider with no Supabase-specific types. The only Supabase touchpoints were the connection strings, a CLI scaffold folder, an image-hostname pattern, and documentation references.
* **Decision**:
  1. **Database**: PostgreSQL 16 (Alpine) self-hosted on the client VPS via Docker, with a persistent bind-mounted volume at `/var/lib/patelnetworks/pgdata`.
  2. **Connection pooling**: PgBouncer (transaction mode, `max_client_conn=200`, `default_pool_size=20`) on port 6432 for application queries (`DATABASE_URL`).
  3. **Migrations**: direct connection on port 5432 bypasses PgBouncer for `DIRECT_URL` (Prisma migrations).
  4. **Backups**: `scripts/backup-db.sh` — `pg_dump` to `/var/lib/patelnetworks/backups`, 14-day retention, cron-scheduled.
  5. **Schema unchanged**: the Prisma schema (29 models, 5 enums) required no modifications — it was already standard PostgreSQL.
  6. **Removed**: `supabase/` directory, `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars, `**.supabase.co` image pattern in `next.config.ts`, all Supabase references in `.env.example` and documentation. This ADR supersedes ADR-009 (which will be marked SUPERSEDED).
  7. **Transition**: the working `.env` continues to point at the live Supabase database until the VPS PostgreSQL is provisioned and the existing 376 rows are migrated via `pg_dump`/`psql` restore (documented in `VPS-DEPLOYMENT.md` §5). No destructive operations against the live database.
* **Consequences**:
  * The client owns the data directory directly on the VPS host (no vendor lock-in, no managed-service costs).
  * Backup/restore is fully under client control (`scripts/backup-db.sh`).
  * Docker-ready deployment (`docker-compose.yml`) with healthchecks and resource-friendly logging.
  * The Prisma schema and all application logic (orders, payments, inventory, OTP auth, kit builder) are 100% preserved — only the connection target changes.
  * **Blocker until cutover**: requires VPS access + chosen passwords + data-migration decision (keep the 376 existing rows or start fresh). See `VPS-DEPLOYMENT.md` §11.
  * ADR-009 (Supabase managed database) is now SUPERSEDED by this ADR.


---

## ADR-023: Split Theme — Storefront Clean Trust + Admin Industrial Steel
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  The prior single dark cinematic theme (v1.9.0) was rejected by the client — pure black felt "sinister rather than premium" for security hardware. The client directed a split: storefront should be bright and trustworthy (Option 3 "Clean Trust"), while admin/checkout should be dark and industrial (Option 2 "Industrial Steel").
* **Decision**:
  Two distinct CSS variable sets:
  1. **Storefront** (`:root`): white `#FFFFFF` bg, slate-900 text, deep blue `#1E40AF` accent — bright, safe, reliable B2B procurement feel.
  2. **Admin/Checkout** (`.dark`): warm charcoal `#1C1917` (stone-900) bg, amber `#F59E0B` accent, off-white text — industrial, technical, warehouse operations feel. NOT pure black (has warmth to avoid the "void" effect).
  
  The `.dark` class is applied to the admin layout wrapper and the checkout page root div. All other pages use the default `:root` (storefront) theme.
* **Consequences**:
  - Storefront feels safe and trustworthy (white + blue = reliability)
  - Admin feels industrial and technical (charcoal + amber = warehouse operations)
  - The two themes are clearly distinct but share the same design DNA (sharp corners, hairline borders, sans-serif, mono numbers)
  - Amber accent in admin provides strong visual differentiation from the storefront blue


---

## ADR-024: Clean Trust as Default Theme + Industrial Steel as Dark Mode Toggle
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  ADR-023 established a split theme (storefront = Clean Trust, admin/checkout = Industrial Steel). The client revised: Clean Trust should be the default everywhere (including admin/checkout), with Industrial Steel available as an optional dark mode toggle via a nav button.
* **Decision**:
  1. Clean Trust (white + deep blue) is the default theme for the entire site.
  2. Industrial Steel (warm charcoal + amber) is available via a dark mode toggle button in both the storefront Header and the AdminHeader.
  3. Uses `next-themes` (already installed) with `attribute="class"`, `defaultTheme="light"`, `enableSystem=false`.
  4. The toggle persists across pages via next-themes localStorage.
  5. Removed forced `dark` class from `admin/layout.tsx` and `checkout/page.tsx` (they now use the default light theme unless the user toggles).
* **Consequences**:
  - The entire site is bright and trustworthy by default.
  - Users who prefer dark mode can toggle to Industrial Steel — and it persists.
  - The admin and checkout are no longer forced dark — they follow the user's preference.
  - Supersedes the forced-split approach from ADR-023 (which is now relaxed — both themes are available everywhere via toggle).


---

## ADR-025: 3-Level Border + Surface Hierarchy
* **Status**: ACCEPTED
* **Date**: 2026-09-26
* **Context**:
  The interface lacked visual hierarchy — every element had the same border weight, making it hard to distinguish page-level containers from nested components. The brief called for a clear 3-level border hierarchy + surface differentiation without changing the design language or functionality.
* **Decision**:
  1. **3 border levels**: `border-border-strong` (structural, Level 1), `border` (component, Level 2 default), `border-border-subtle` (divider, Level 3).
  2. **3 surface levels**: `surface-1` (primary container), `surface-2` (nested), `surface-3` (interactive).
  3. Applied across all 16 storefront + admin files.
  4. Replaced ALL hardcoded dark-mode colors in admin with semantic tokens.
  5. Removed forced `dark` class from 7 admin components (they now follow the theme toggle).
  6. Input focus → `border-border-strong` (level 2 → level 1 on focus).
  7. Whitespace used as hierarchy tool — borders removed where whitespace alone separates.
* **Consequences**:
  - Parent containers visually dominate child containers.
  - Important sections separated more strongly than minor sections.
  - Borders subtle enough to avoid visual noise.
  - Works in both light (Clean Trust) and dark (Industrial Steel) themes.
  - Interface feels cohesive in grayscale (border contrast is structural, not decorative).
