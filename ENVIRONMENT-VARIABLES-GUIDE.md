# Patel Networks — Environment Variables Guide

> **Complete reference** for every environment variable the application uses.
> Each variable has its own section: what it does, where it's used, how to get it, required vs optional, and example values.
>
> See also: `.env.example` (the template) and the deployment guides (`VPS-SETUP-GUIDE.md`, `PHYSICAL-SERVER-SETUP-GUIDE.md`, `RENDER-DEPLOYMENT.md`).

---

## Quick Reference Table

| Variable | Required? | Where used | Default / Simulation |
|---|---|---|---|
| [`DATABASE_URL`](#database_url) | ✅ Required | Prisma schema | — |
| [`DIRECT_URL`](#direct_url) | ✅ Required | Prisma schema (migrations) | — |
| [`JWT_SECRET`](#jwt_secret) | ✅ Required | Auth + admin services | — |
| [`NODE_ENV`](#node_env) | ✅ Required | Next.js, app | `production` (set by platform) |
| [`NEXT_PUBLIC_APP_URL`](#next_public_app_url) | ✅ Required | Sitemaps, metadata | `http://localhost:3000` |
| [`ADMIN_EMAIL`](#admin_email) | ⚠️ Optional | Admin auth fallback | `superadmin@patelnetworks.in` |
| [`ADMIN_PASSWORD`](#admin_password) | ⚠️ Optional | Admin auth fallback | `patel@admin2026` |
| [`RAZORPAY_KEY_ID`](#razorpay_key_id) | 🔶 Simulation | Payment service | `rzp_test_placeholder_key_id` |
| [`RAZORPAY_KEY_SECRET`](#razorpay_key_secret) | 🔶 Simulation | Payment service | `placeholder_secret_key` |
| [`RAZORPAY_WEBHOOK_SECRET`](#razorpay_webhook_secret) | 🔶 Simulation | Webhook verification | `placeholder_webhook_secret` |
| [`NEXT_PUBLIC_RAZORPAY_KEY_ID`](#next_public_razorpay_key_id) | 🔶 Simulation | Checkout (client-side) | `rzp_test_placeholder_key_id` |
| [`WHATSAPP_API_URL`](#whatsapp_api_url) | 🔶 Simulation | WhatsApp service | `https://graph.facebook.com/v20.0` |
| [`WHATSAPP_ACCESS_TOKEN`](#whatsapp_access_token) | 🔶 Simulation | WhatsApp service | `placeholder_whatsapp_access_token` |
| [`WHATSAPP_PHONE_NUMBER_ID`](#whatsapp_phone_number_id) | 🔶 Simulation | WhatsApp service | `placeholder_phone_number_id` |
| [`WHATSAPP_BUSINESS_ACCOUNT_ID`](#whatsapp_business_account_id) | 🔶 Simulation | WhatsApp service | `placeholder_business_account_id` |
| [`WHATSAPP_VERIFY_TOKEN`](#whatsapp_verify_token) | 🔶 Simulation | Webhook verification | `placeholder_whatsapp_verify_token` |
| [`SHIPROCKET_EMAIL`](#shiprocket_email) | 🔶 Simulation | Shipping service | `placeholder@patelnetworks.com` |
| [`SHIPROCKET_PASSWORD`](#shiprocket_password) | 🔶 Simulation | Shipping service | `placeholder_shiprocket_password` |
| [`SHIPROCKET_API_URL`](#shiprocket_api_url) | 🔶 Simulation | Shipping service | `https://apiv2.shiprocket.in/v1/external` |
| [`SMS_GATEWAY_API_KEY`](#sms_gateway_api_key) | 🔶 Simulation | OTP service | `placeholder_sms_api_key` |
| [`SMS_SENDER_ID`](#sms_sender_id) | 🔶 Simulation | OTP service | `PTLNET` |
| [`CLOUDINARY_CLOUD_NAME`](#cloudinary_cloud_name) | 🔶 Simulation | (Not yet used) | `placeholder_cloud_name` |
| [`CLOUDINARY_API_KEY`](#cloudinary_api_key) | 🔶 Simulation | (Not yet used) | `placeholder_api_key` |
| [`CLOUDINARY_API_SECRET`](#cloudinary_api_secret) | 🔶 Simulation | (Not yet used) | `placeholder_api_secret` |

**Legend**: ✅ Required (app won't run without it) · ⚠️ Optional (has a default) · 🔶 Simulation (placeholder; real keys needed for live integration)

---

## Required Variables (app won't start without these)

### DATABASE_URL

**What it does**: The primary PostgreSQL connection string used by Prisma for all application database queries. Must be a pooled connection (via PgBouncer) in production.

**Where used**: `prisma/schema.prisma` (`url = env("DATABASE_URL")`) — read by every service that touches the database (catalog, cart, orders, auth, admin, etc.)

**How to get it**:
- **Temporary (now)**: Use the Supabase pooler URL (port 6543 with `pgbouncer=true`)
- **Production (VPS/physical server)**: `postgresql://patelnetworks:<password>@127.0.0.1:6432/patelnetworks?schema=public&sslmode=disable` (PgBouncer on port 6432)

**Format**: `postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public&sslmode=<require|disable>`

**Example (VPS)**:
```bash
DATABASE_URL="postgresql://patelnetworks:your_strong_password@127.0.0.1:6432/patelnetworks?schema=public&sslmode=disable"
```

**Example (Supabase, temporary)**:
```bash
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

> ⚠️ The `pgbouncer=true` parameter is REQUIRED when connecting to Supabase's pooler (port 6543) — without it, Prisma prepared statements fail.

---

### DIRECT_URL

**What it does**: A direct (non-pooled) PostgreSQL connection used by Prisma for migrations and schema operations (`prisma migrate`, `prisma db push`). PgBouncer runs in transaction mode, which breaks Prisma's migration engine — so migrations bypass the pooler.

**Where used**: `prisma/schema.prisma` (`directUrl = env("DIRECT_URL")`)

**How to get it**:
- **Temporary**: Use the Supabase direct URL (port 5432, NO `pgbouncer=true`)
- **Production (VPS)**: `postgresql://patelnetworks:<password>@127.0.0.1:5432/patelnetworks?schema=public&sslmode=disable`

**Format**: Same as `DATABASE_URL` but **without** `pgbouncer=true`, and typically port `5432` (not 6432).

**Example (VPS)**:
```bash
DIRECT_URL="postgresql://patelnetworks:your_strong_password@127.0.0.1:5432/patelnetworks?schema=public&sslmode=disable"
```

---

### JWT_SECRET

**What it does**: The secret key used to sign and verify JWT tokens for customer OTP sessions (`pn_session` cookie) and admin sessions (`pn_admin_session` cookie). Without it, authentication is impossible.

**Where used**:
- `src/server/services/auth.service.ts` — customer JWT signing/verification
- `src/server/services/admin-auth.service.ts` — admin JWT signing/verification
- `src/proxy.ts` — middleware JWT verification for `/admin/*` and `/account/*` routes

**How to get it**: Generate a strong random string:
```bash
openssl rand -base64 48
# Output example: f8Torv3csTSc+GFaIOxzyvu74tpz0vzcSjudKHYpRb9Efburdq0KzeyT0pzulEMo
```

**Format**: Any string ≥ 32 bytes. Base64-encoded is standard.

**Example**:
```bash
JWT_SECRET="f8Torv3csTSc+GFaIOxzyvu74tpz0vzcSjudKHYpRb9Efburdq0KzeyT0pzulEMo"
```

> ⚠️ **Never change this on a production system with active users** — doing so invalidates all existing sessions (everyone gets logged out). If you must rotate it, coordinate a maintenance window.

---

### NODE_ENV

**What it does**: Tells Node.js (and Next.js) which environment mode to run in. Next.js uses this to enable production optimizations, minification, and static prerendering.

**Where used**: Next.js internals, Prisma client (log level), the app's `db.ts` (logging).

**Allowed values**: `production`, `development`, `test` — **anything else breaks Next.js** (causes the `/_global-error` prerender crash we debugged).

**How to set it**:
- **Local dev**: `NODE_ENV="development"`
- **Production (Render/VPS)**: `NODE_ENV="production"` — most platforms set this automatically; do NOT override it with a non-standard value
- **Tests**: `NODE_ENV="test"`

**Example**:
```bash
NODE_ENV="production"
```

> ⚠️ **Critical**: On Render, do NOT set `NODE_ENV=development` or `NODE_ENV=staging` in the Environment tab. Either set it to `production` or remove it entirely (Render defaults to `production`). A non-standard value causes `Cannot read properties of null (reading 'useContext')` during the build.

---

### NEXT_PUBLIC_APP_URL

**What it does**: The public URL of the deployed application. Used for generating canonical URLs in metadata, sitemaps (`sitemap.xml`), JSON-LD structured data, and OAuth redirects.

**Where used**: SEO routes (`sitemap.ts`, `robots.ts`), product detail page JSON-LD, metadata generation.

**How to set it**:
- **Local dev**: `http://localhost:3000`
- **Render**: `https://patel-5-2.onrender.com` (your Render URL)
- **Production**: `https://patelnetworks.in` (your domain)

**Format**: Full URL with protocol, NO trailing slash.

**Example**:
```bash
NEXT_PUBLIC_APP_URL="https://patel-5-2.onrender.com"
```

> Note: The `NEXT_PUBLIC_` prefix means this variable is exposed to the browser (client-side). It's safe to share — it's just a URL.

---

## Optional Variables (have built-in defaults)

### ADMIN_EMAIL

**What it does**: The fallback admin email used when no admin user exists in the database. The admin login form prefills this, and `admin-auth.service.ts` accepts it as a valid credential.

**Where used**: `src/server/services/admin-auth.service.ts` (fallback), `src/app/admin/login/page.tsx` (prefill).

**Default**: `superadmin@patelnetworks.in`

**When to override**: Only if you want a different admin email. Otherwise, leave it commented out and the default applies.

**Example**:
```bash
ADMIN_EMAIL="ops@patelnetworks.in"
```

---

### ADMIN_PASSWORD

**What it does**: The fallback admin password (paired with `ADMIN_EMAIL`). Used when no admin user exists in the database.

**Where used**: `src/server/services/admin-auth.service.ts` (fallback).

**Default**: `patel@admin2026` (defined in `admin-auth.service.ts`)

**When to override**: Only if you want a different password. **In production, you should override this** (or better, seed an admin user into the DB with a bcrypt-hashed password).

**Example**:
```bash
ADMIN_PASSWORD="a-much-stronger-password-here"
```

> ⚠️ The default `patel@admin2026` is documented in the code and should NOT be used in production. Rotate it before going live.

---

## Simulation Variables (placeholders — real keys needed for live integrations)

These variables are currently set to placeholder values. The app runs in **simulation mode** for each integration — meaning the feature appears to work but doesn't actually call the real API. To go live with real payments, WhatsApp, shipping, or SMS, replace the placeholders with real credentials.

### Payment Gateway — Razorpay

#### RAZORPAY_KEY_ID

**What it does**: The Razorpay API key ID (public identifier). Used server-side to create orders and verify payments.

**Where used**: `src/server/services/payment.service.ts` (Razorpay order creation, payment verification).

**How to get it**:
1. Sign up at https://dashboard.razorpay.com/
2. Go to **Settings → API Keys → Generate Key**
3. Copy the **Key ID** (starts with `rzp_test_` for test mode, `rzp_live_` for live)

**Example**:
```bash
RAZORPAY_KEY_ID="rzp_test_ABcd1234EfGh5678"
```

Official docs: https://razorpay.com/docs/api/

---

#### RAZORPAY_KEY_SECRET

**What it does**: The Razorpay API key secret (paired with `RAZORPAY_KEY_ID`). Used server-side for signing requests and verifying payment signatures.

**Where used**: `src/server/services/payment.service.ts`.

**How to get it**: Generated alongside `RAZORPAY_KEY_ID` (shown once when you generate the key — save it immediately).

**Example**:
```bash
RAZORPAY_KEY_SECRET="AbCdEf123456GhIjKl7890MnOpQrSt"
```

> ⚠️ This is a secret. Never expose it to the client. Never commit it to git.

---

#### RAZORPAY_WEBHOOK_SECRET

**What it does**: The secret used to verify that incoming Razorpay webhook calls (payment captured, payment failed) are genuinely from Razorpay and not spoofed.

**Where used**: `src/app/api/webhooks/razorpay/route.ts` (signature verification).

**How to get it**:
1. Razorpay Dashboard → **Settings → Webhooks**
2. Create a webhook with URL: `https://<your-domain>/api/webhooks/razorpay`
3. Copy the **Secret** shown

**Example**:
```bash
RAZORPAY_WEBHOOK_SECRET="webhook_secret_from_razorpay_dashboard"
```

Official docs: https://razorpay.com/docs/webhooks/

---

#### NEXT_PUBLIC_RAZORPAY_KEY_ID

**What it does**: The Razorpay key ID exposed to the browser (client-side). Used by the Razorpay checkout JS SDK to initialize the payment modal.

**Where used**: `src/app/checkout/page.tsx` (passed to the Razorpay `options.key`).

**How to get it**: Same value as `RAZORPAY_KEY_ID` (the key ID is public-safe; it's the secret that must stay server-side).

**Example**:
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_ABcd1234EfGh5678"
```

> The `NEXT_PUBLIC_` prefix means Next.js inlines this into the client bundle. This is by design — Razorpay's SDK needs it in the browser.

---

### WhatsApp Business Cloud API

#### WHATSAPP_API_URL

**What it does**: The Meta Graph API base URL for sending WhatsApp messages.

**Where used**: `src/server/services/whatsapp.service.ts`.

**Default**: `https://graph.facebook.com/v20.0`

**When to change**: Only when Meta releases a new API version. v20.0 is current.

Official docs: https://developers.facebook.com/docs/whatsapp/cloud-api

---

#### WHATSAPP_ACCESS_TOKEN

**What it does**: The permanent (or long-lived) access token for the WhatsApp Business Cloud API. Used to authenticate message-sending requests.

**Where used**: `src/server/services/whatsapp.service.ts`.

**How to get it**:
1. Go to https://business.facebook.com/ → your WhatsApp Business Account
2. **Settings → WhatsApp Manager → API Setup**
3. Generate a permanent access token (or use a System User token)

**Example**:
```bash
WHATSAPP_ACCESS_TOKEN="EAAGm0PXabcd1234...long_token_string..."
```

> ⚠️ This is a secret. Never commit it to git.

---

#### WHATSAPP_PHONE_NUMBER_ID

**What it does**: The ID of the phone number registered with WhatsApp Business API (the number that sends messages to customers).

**Where used**: `src/server/services/whatsapp.service.ts`.

**How to get it**: Same dashboard as the access token — **API Setup → Phone Number ID**.

**Example**:
```bash
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
```

---

#### WHATSAPP_BUSINESS_ACCOUNT_ID

**What it does**: The WhatsApp Business Account ID. Used for some API calls (e.g., managing message templates).

**Where used**: Currently declared but not directly used in code (reserved for future template management).

**How to get it**: Meta Business Suite → your Business Account → Settings → Business Account ID.

**Example**:
```bash
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
```

---

#### WHATSAPP_VERIFY_TOKEN

**What it does**: A token YOU choose, used to verify the WhatsApp webhook subscription (Meta calls your webhook with this token during setup to prove you control the endpoint).

**Where used**: `src/app/api/webhooks/whatsapp/route.ts` (GET verification handler).

**How to get it**: You invent this value (any string). When setting up the webhook in Meta's dashboard, you enter the same value you put here.

**Example**:
```bash
WHATSAPP_VERIFY_TOKEN="patel_networks_webhook_verify_2026"
```

> This is NOT a secret from Meta — it's a shared secret between you and Meta to verify webhook ownership. Choose something unique but it doesn't need to be cryptographically strong.

Official docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components

---

### Shipping — Shiprocket

#### SHIPROCKET_EMAIL

**What it does**: The Shiprocket account email used to authenticate with the Shiprocket API (get a token for AWB generation and tracking).

**Where used**: `src/server/services/shipping.service.ts` (token generation).

**How to get it**: Your Shiprocket account email (sign up at https://www.shiprocket.in/).

**Example**:
```bash
SHIPROCKET_EMAIL="logistics@patelnetworks.in"
```

Official docs: https://apidocs.shiprocket.in/

---

#### SHIPROCKET_PASSWORD

**What it does**: The Shiprocket account password (paired with `SHIPROCKET_EMAIL`).

**Where used**: `src/server/services/shipping.service.ts`.

**Example**:
```bash
SHIPROCKET_PASSWORD="your_shiprocket_account_password"
```

> ⚠️ Secret. Never commit.

---

#### SHIPROCKET_API_URL

**What it does**: The Shiprocket API base URL.

**Where used**: `src/server/services/shipping.service.ts`.

**Default**: `https://apiv2.shiprocket.in/v1/external`

**When to change**: Never (unless Shiprocket changes their API URL).

---

### SMS OTP Gateway

#### SMS_GATEWAY_API_KEY

**What it does**: The API key for the SMS gateway used to send OTP messages (MSG91, Fast2SMS, or Firebase).

**Where used**: `src/server/services/auth.service.ts` (OTP sending).

**How to get it** (MSG91, recommended):
1. Sign up at https://msg91.com/
2. **API → Auth Key** → copy your auth key

**Example**:
```bash
SMS_GATEWAY_API_KEY="msg91_auth_key_123456"
```

Official docs: https://docs.msg91.com/

---

#### SMS_SENDER_ID

**What it does**: The sender ID (6-character alphanumeric) that appears as the "from" address on SMS messages sent to customers.

**Where used**: Declared but the OTP service currently uses simulation mode (logs the OTP to console instead of sending SMS). Will be used when SMS is enabled.

**How to get it**: Register a sender ID with your SMS provider (MSG91/DLT registration in India — takes 1-2 days).

**Default**: `PTLNET`

**Example**:
```bash
SMS_SENDER_ID="PTLNET"
```

> In India, sender IDs require DLT (Distributed Ledger Technology) registration per TRAI regulations. Contact your SMS provider to register.

---

### Media Storage — Cloudinary (reserved, not yet implemented)

#### CLOUDINARY_CLOUD_NAME

**What it does**: The Cloudinary cloud name (your account identifier). Used for uploading and serving product images.

**Where used**: Currently declared but NOT used in code (product images use Unsplash URLs in the DB). Reserved for when you migrate to Cloudinary-hosted images.

**How to get it**: Sign up at https://cloudinary.com/ → Dashboard → Cloud Name.

**Example**:
```bash
CLOUDINARY_CLOUD_NAME="patel-networks"
```

---

#### CLOUDINARY_API_KEY

**What it does**: The Cloudinary API key (paired with the cloud name).

**Where used**: Reserved (not yet implemented).

**How to get it**: Cloudinary Dashboard → API Key.

---

#### CLOUDINARY_API_SECRET

**What it does**: The Cloudinary API secret (paired with the API key). Used for signing upload requests.

**Where used**: Reserved (not yet implemented).

**How to get it**: Cloudinary Dashboard → API Secret (hidden — reveal and copy).

> ⚠️ Secret. Never commit.

---

## Removed Variables (no longer used)

These variables were previously used when the database was on Supabase but have been **fully removed** per ADR-022 (migration to self-hosted PostgreSQL):

- ~~`NEXT_PUBLIC_SUPABASE_URL`~~ — removed (no Supabase client SDK in code)
- ~~`NEXT_PUBLIC_SUPABASE_ANON_KEY`~~ — removed (never used by the app)

Do NOT set these. They have no effect.

---

## Environment Setup by Platform

### Local development
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Fill in the required variables (DATABASE_URL, DIRECT_URL, JWT_SECRET)
3. Leave simulation variables as placeholders (the app runs in simulation mode)
4. Run `npm run dev`

### Render (staging)
1. Go to Render → your service → **Environment** tab
2. Add each required + simulation variable as a key-value pair
3. For the database, use the Supabase URLs (temporary) until the VPS PostgreSQL is ready
4. Set `NODE_ENV=production` (or leave unset — Render defaults to it)
5. Set `NEXT_PUBLIC_APP_URL` to your Render URL

### VPS / Physical Server (production)
1. Create `.env` on the server: `cp .env.example .env && nano .env`
2. Fill in the VPS PostgreSQL URLs (port 6432 for pooled, 5432 for direct)
3. Generate a fresh `JWT_SECRET`: `openssl rand -base64 48`
4. Override `ADMIN_PASSWORD` with a strong password
5. Add real Razorpay/WhatsApp/Shiprocket/SMS credentials when procured
6. Set `NEXT_PUBLIC_APP_URL` to your domain
7. Restart the app: `pm2 restart patelnetworks`

---

## Security Best Practices

1. **Never commit `.env` to git** — it's in `.gitignore` (verified). Only `.env.example` is committed (placeholders only).
2. **Rotate the Supabase DB password** before pushing the repo to a public GitHub remote (the old credentials are in git history).
3. **Use different `JWT_SECRET` values** for staging vs production.
4. **Override `ADMIN_PASSWORD`** in production (the default `patel@admin2026` is documented in code).
5. **Keep `RAZORPAY_KEY_SECRET` and `CLOUDINARY_API_SECRET` server-side only** — never use the `NEXT_PUBLIC_` prefix for secrets.
6. **Use HTTPS** (via Caddy on the VPS, or Render's built-in TLS) — otherwise cookies and credentials travel in plaintext.

---

<p align="center">
<em>Authored by Omkar Kardile — Patel Networks / MegaTech</em><br/>
<sub>Surveillance hardware procurement platform · India</sub>
</p>
