# Patel Networks — Route Map

> **Complete reference** for every route in the application.
> Use this to quickly find login pages, admin panels, API endpoints, etc.

---

## Quick Access — Login Pages

| Route | Purpose | Default Credentials |
|---|---|---|
| `/admin/login` | Superadmin / Staff login | `superadmin@patelnetworks.in` / `patel@admin2026` |
| `/stock/login` | Stock employee panel login | `stock@patelnetworks.in` / `stock@2026` |
| `/account/login` | Customer login (phone OTP) | Phone: `+91 98765 43210` → OTP sent (simulation mode logs to console) |

---

## Storefront (Customer-facing)

| Route | Type | Description |
|---|---|---|
| `/` | Static (ISR 60s) | Homepage — hero, categories, featured products, kit builder CTA, brands |
| `/products` | Dynamic | Product catalog with filters (category, brand, search, in-stock) |
| `/products/[slug]` | Dynamic | Product detail — gallery, variant selector, specs table, add to cart |
| `/kit-builder` | Static | Interactive 5-step CCTV kit builder (recorder → cameras → storage → accessories → review) |
| `/cart` | Client | Shopping cart — items, quantity steppers, order summary, GST breakdown |
| `/checkout` | Client | Checkout — shipping address, GSTIN, payment method (Razorpay/COD), order placement |
| `/order-success/[orderNumber]` | Dynamic | Order confirmation — invoice, tracking timeline, delivery info |
| `/account` | Protected | Customer account portal (requires `pn_session` cookie) — orders, profile, addresses |
| `/account/login` | Client | Customer OTP login (phone number → 6-digit OTP) |

### Policy & Info Pages

| Route | Description |
|---|---|
| `/about` | Company story, brand partners, operating principles |
| `/contact` | Contact form + wholesale inquiry desk |
| `/faq` | Frequently asked questions (CCTV & GST) |
| `/shipping-policy` | Shipping & dispatch policy |
| `/return-policy` | Warranty & returns policy |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |

### SEO Routes

| Route | Description |
|---|---|
| `/sitemap.xml` | Dynamic XML sitemap (28 URLs) |
| `/robots.txt` | Robots.txt (allows storefront, disallows admin/api/account) |

---

## Admin Console (Protected — `pn_admin_session` cookie)

> All `/admin/*` routes redirect to `/admin/login` if not authenticated.
> Staff members only see sidebar items they have permissions for.

| Route | Permission Required | Description |
|---|---|---|
| `/admin/login` | — | Login page (superadmin + staff) |
| `/admin` | `DASHBOARD_VIEW` | Operations dashboard — KPIs, payment split, recent orders, low-stock alerts |
| `/admin/orders` | `ORDERS_VIEW` | Order fulfillment console — order list, status transitions, shipment creation |
| `/admin/products` | `PRODUCTS_VIEW` | Product catalog table — search, COD toggle, storefront link |
| `/admin/inventory` | `INVENTORY_VIEW` | Inventory management — SKU stock levels, stock adjustments, movement log |
| `/admin/customers` | `CUSTOMERS_VIEW` | Customer directory — B2B/B2C filter, GSTIN, total spend, WhatsApp contact |
| `/admin/reports` | `REPORTS_VIEW` | Commercial reports — GSTR-1 tax analytics, payment split, daily sales, CSV export |
| `/admin/employees` | `EMPLOYEES_VIEW` | Staff management — create/edit/deactivate staff, permission wizard, reset password |
| `/admin/settings/cod` | `SETTINGS_VIEW` | COD settings — per-product COD eligibility rules |

---

## Stock Panel (Protected — `pn_stock_session` cookie)

> All `/stock/*` routes redirect to `/stock/login` if not authenticated.
> Requires `STOCK_VIEW` permission in the JWT payload.

| Route | Permission | Description |
|---|---|---|
| `/stock/login` | — | Employee login page |
| `/stock` | `STOCK_VIEW` | Stock dashboard — KPIs (total SKUs, stock value, low-stock count), recent alerts + movements |
| `/stock/alerts` | `STOCK_VIEW` | Alert management — filterable table, acknowledge/resolve (requires `STOCK_ALERTS_MANAGE`) |
| `/stock/movements` | `STOCK_VIEW` | Movement log — paginated, filterable, CSV export (requires `STOCK_EXPORT`) |
| `/stock/count` | `STOCK_VIEW` | Count sessions — list + create (requires `STOCK_COUNT`) |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/webhooks/razorpay` | POST | Razorpay payment webhook (captures payments, verifies signature) |
| `/api/webhooks/shipping` | POST | Shipping carrier webhook (tracking status sync) |
| `/api/webhooks/whatsapp` | GET, POST | WhatsApp Cloud API webhook (GET = Meta verification, POST = status callbacks) |

---

## Error Boundaries

| Route | Description |
|---|---|
| `/not-found` (implicit) | Custom 404 page — large "404", dot-rec, return home + browse catalog CTAs |
| `/error` (implicit) | Client error boundary — "System alert", try again + return home, error digest |
| `/_global-error` (implicit) | Global error boundary — renders own `<html>/<body>`, minimal inline styles |

---

## Authentication & Sessions

| Cookie | Scope | Purpose |
|---|---|---|
| `pn_admin_session` | `/admin/*` | Admin/staff JWT (HS256, 7-day expiry) |
| `pn_stock_session` | `/stock/*` | Stock employee JWT (HS256, 7-day expiry) |
| `pn_session` | `/account/*` | Customer OTP session JWT (HS256, 7-day expiry) |

### Proxy (middleware) Guards

| Path Pattern | Guard |
|---|---|
| `/admin/*` (except `/admin/login`) | Verify `pn_admin_session` JWT, check role = SUPER_ADMIN or STAFF |
| `/stock/*` (except `/stock/login`) | Verify `pn_stock_session` JWT, check `STOCK_VIEW` in permissions |
| `/account/*` (except `/account/login`) | Verify `pn_session` JWT |

---

## Permission System (18 permissions, 9 modules)

| Module | Permissions |
|---|---|
| Dashboard | `DASHBOARD_VIEW` |
| Orders | `ORDERS_VIEW`, `ORDERS_MANAGE` |
| Products | `PRODUCTS_VIEW`, `PRODUCTS_MANAGE` |
| Inventory | `INVENTORY_VIEW`, `INVENTORY_ADJUST` |
| Customers | `CUSTOMERS_VIEW`, `CUSTOMERS_MANAGE` |
| Reports | `REPORTS_VIEW`, `REPORTS_EXPORT` |
| Stock Panel | `STOCK_VIEW`, `STOCK_ALERTS_MANAGE`, `STOCK_COUNT`, `STOCK_EXPORT` |
| Employees | `EMPLOYEES_VIEW`, `EMPLOYEES_MANAGE` |
| Settings | `SETTINGS_VIEW`, `SETTINGS_MANAGE` |

**SUPER_ADMIN** bypasses all permission checks. **STAFF** is filtered by their assigned permissions. See `src/lib/permissions.ts` for the full definition.

---

## Default Users

| Email | Role | Password | Purpose |
|---|---|---|---|
| `superadmin@patelnetworks.in` | SUPER_ADMIN | `patel@admin2026` | Full admin access |
| `stock@patelnetworks.in` | STAFF | `stock@2026` | Stock panel (VIEW + ADJUST + EXPORT) |
| `admin@patelnetworks.com` | SUPER_ADMIN | (DB-seeded) | Original admin from seed script |

---

## File-to-Route Mapping (key files)

| Route | File |
|---|---|
| `/` | `src/app/page.tsx` |
| `/products` | `src/app/products/page.tsx` |
| `/products/[slug]` | `src/app/products/[slug]/page.tsx` |
| `/cart` | `src/app/cart/page.tsx` |
| `/checkout` | `src/app/checkout/page.tsx` |
| `/kit-builder` | `src/app/kit-builder/page.tsx` |
| `/admin/login` | `src/app/admin/login/page.tsx` |
| `/admin` | `src/app/admin/page.tsx` |
| `/admin/employees` | `src/app/admin/employees/page.tsx` |
| `/stock/login` | `src/app/stock/login/page.tsx` |
| `/stock` | `src/app/stock/page.tsx` |
| `/stock/alerts` | `src/app/stock/alerts/page.tsx` |
| `/stock/movements` | `src/app/stock/movements/page.tsx` |
| `/stock/count` | `src/app/stock/count/page.tsx` |
| Proxy (middleware) | `src/proxy.ts` |
| Permissions library | `src/lib/permissions.ts` |

---

<p align="center">
<em>Authored by Omkar Kardile — Patel Networks / MegaTech</em><br/>
<sub>Surveillance hardware procurement platform · India</sub>
</p>
