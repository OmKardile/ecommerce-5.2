# Patel Networks — Production Deployment & Manual Configuration Checklist (`production-deployment-checklist.md`)

> **Target Audience**: Business Owner, System Administrator, DevOps Engineer  
> **Platform Scope**: Commercial CCTV, Surveillance & Structured Networking Platform (India)  
> **Objective**: Step-by-step instructions for transitioning from local simulation/development into a live, high-reliability commercial production environment.

---

## 📌 Quick Summary of Manual Prerequisites

| Service | Provider | Purpose | Production Action Required |
| :--- | :--- | :--- | :--- |
| **Database** | Supabase | PostgreSQL 16 Relational DB | Create Mumbai instance (`ap-south-1`), set pooler & direct URLs, run migrations |
| **Payments** | Razorpay | UPI, Cards, Netbanking, EMI | Generate live API keys, configure webhook endpoint for payment capture |
| **Logistics** | Shiprocket / Delhivery | Automated AWB & live tracking | Add live account credentials, set Surat warehouse pickup, register tracking webhook |
| **WhatsApp API** | Meta Cloud API | Transactional lifecycle alerts | Generate permanent System User token, submit HSM templates for approval |
| **SMS OTP** | Fast2SMS / MSG91 | Passwordless mobile OTP auth | Add live SMS API key, verify Indian telecom DLT registration (`PTLNET`) |
| **Admin Security** | Custom ADR-019 | 256-bit Command Center Auth | Change default superadmin password, set cryptographically secure `JWT_SECRET` |
| **Hosting & SSL** | Vercel / Railway | Fullstack Next.js hosting | Connect GitHub repo, add production `.env` variables, bind `patelnetworks.in` |

---

## 📋 1. Supabase Production Database Setup

### 1.1 Provision Production Database
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and configure:
   * **Project Name**: `patel-networks-production`
   * **Region**: `ap-south-1` (Mumbai, India) — *Mandatory for lowest sub-30ms latency across Indian telecom networks.*
   * **Database Password**: Generate a secure 24+ character password and record it safely.

### 1.2 Configure Production Environment Variables
In your hosting provider (Vercel/Railway), set both connection strings:
```env
# Transaction Connection Pooler (Port 6543, for runtime queries)
DATABASE_URL="postgresql://postgres.[PROD_REF]:[PROD_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Direct Session Connection (Port 5432, for Prisma migrations and schema push)
DIRECT_URL="postgresql://postgres.[PROD_REF]:[PROD_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 1.3 Deploy Schema & Seed Catalog
Execute the following commands in your deployment pipeline or local terminal connected to production:
```bash
# Push the 29 relational models and indexes to Supabase
npx prisma db push

# Seed categories, brands, multi-attribute products, SKUs, and default accounts
npx tsx prisma/seed.ts
```

---

## 💳 2. Razorpay Payment Gateway (Live Production)

### 2.1 Complete Business KYC & Activate Live Keys
1. Log in to the [Razorpay Merchant Dashboard](https://dashboard.razorpay.com).
2. Complete business KYC verification with company PAN, GSTIN (`24AAACP1234F1Z8`), and linked bank account for daily settlements.
3. Switch the toggle from **Test Mode** to **Live Mode**.
4. Navigate to **Settings ➔ API Keys** and click **Generate Key**.

### 2.2 Configure Production Environment Variables
```env
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_live_razorpay_secret_key"
RAZORPAY_WEBHOOK_SECRET="generate_a_random_32_char_secret_for_webhooks"
```

### 2.3 Register Live Webhook Endpoint
1. In Razorpay Dashboard, navigate to **Settings ➔ Webhooks**.
2. Click **Add New Webhook** and enter:
   * **Webhook URL**: `https://patelnetworks.in/api/webhooks/razorpay`
   * **Secret**: The exact value of your `RAZORPAY_WEBHOOK_SECRET`
   * **Alert Email**: `admin@patelnetworks.in`
3. Select the following active events:
   * `payment.captured`
   * `payment.failed`
   * `order.paid`
4. Click **Save Webhook**.

---

## 📦 3. Carrier Logistics (Shiprocket / Delhivery)

### 3.1 Live Account & Primary Hub Setup
1. Log in to your [Shiprocket Account](https://app.shiprocket.in).
2. Navigate to **Settings ➔ Pickup Addresses** and add the Central Fulfillment Hub:
   * **Address**: Surat Central Logistics Node, Ring Road, Surat, Gujarat
   * **Pincode**: `395003`
   * **Phone**: Official operations contact

### 3.2 Configure Production Environment Variables
```env
SHIPROCKET_EMAIL="ops@patelnetworks.in"
SHIPROCKET_PASSWORD="your_live_shiprocket_password"
SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"
```

### 3.3 Register Tracking Status Webhook
1. In Shiprocket Dashboard, go to **API ➔ Webhooks**.
2. Click **Add Webhook** and configure:
   * **URL**: `https://patelnetworks.in/api/webhooks/shipping`
   * **Events**: Status Updates (`PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RTO_INITIATED`)
3. Save configuration.

---

## 💬 4. WhatsApp Business Cloud API (Meta)

### 4.1 Create Permanent System User Token
1. Open the [Meta for Developers Portal](https://developers.facebook.com) and navigate to your WhatsApp Business App.
2. In **Business Manager ➔ System Users**:
   * Create an Admin System User named `PatelNetworksEcomEngine`.
   * Assign permissions: `whatsapp_business_messaging`, `whatsapp_business_management`.
   * Click **Generate New Token** and set expiration to **Never** (Permanent Access Token).

### 4.2 Submit & Approve WhatsApp HSM Message Templates
In **Meta WhatsApp Manager ➔ Message Templates**, submit the following 4 utility templates:

1. **Template Name**: `order_confirmation` (Category: Utility)
   * *Header*: Video Surveillance Order Confirmed
   * *Body*: `Dear {{1}}, Your Patel Networks CCTV order #{{2}} for ₹{{3}} is confirmed. Payment: {{4}}. Items: {{5}}. View Tax Invoice: {{6}}`
2. **Template Name**: `order_dispatched` (Category: Utility)
   * *Header*: Hardware Dispatched
   * *Body*: `Update on Order #{{1}}: Your surveillance hardware is on the way! Carrier: {{2}}, AWB: {{3}}, Est. Delivery: {{4}}. Track live: {{5}}`
3. **Template Name**: `order_out_for_delivery` (Category: Utility)
   * *Header*: Out for Delivery
   * *Body*: `Your Patel Networks CCTV shipment #{{1}} with courier {{2}} (AWB: {{3}}) is out for delivery today.`
4. **Template Name**: `b2b_inquiry_received` (Category: Utility / Marketing)
   * *Body*: `Commercial Project Inquiry Received! Hi {{1}}, our enterprise dealer desk has received your quotation request for {{2}} units of {{3}}. An authorized representative will contact you within 1 business hour.`

### 4.3 Configure Production Environment Variables
```env
WHATSAPP_API_URL="https://graph.facebook.com/v20.0"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxx...your_permanent_system_user_token"
WHATSAPP_PHONE_NUMBER_ID="your_15_digit_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_15_digit_waba_account_id"
```

### 4.4 Register WhatsApp Webhook
1. In Meta Developer App ➔ **WhatsApp ➔ Configuration ➔ Webhook**:
   * **Callback URL**: `https://patelnetworks.in/api/webhooks/whatsapp`
   * **Verify Token**: `patel_networks_meta_verify_token_2026`
2. Subscribe to field: `messages`.

---

## 📲 5. SMS OTP Gateway (Fast2SMS / MSG91)

### 5.1 DLT Registration Compliance (India)
1. Ensure your DLT Entity is registered with Telecom Operators (Jio/Airtel/VI) with Sender Header `PTLNET`.
2. Ensure the 6-digit OTP Template is approved.

### 5.2 Configure Production Environment Variables
```env
SMS_GATEWAY_API_KEY="your_live_fast2sms_or_msg91_auth_key"
SMS_SENDER_ID="PTLNET"
```

---

## 🔐 6. Production Security & Credentials (ADR-019)

### 6.1 Set Production Superadmin Password
* Never deploy the default development password (`patel@admin2026`) to public hosting.
* Set a cryptographically secure 16+ character password in environment variables:
  ```env
  ADMIN_EMAIL="superadmin@patelnetworks.in"
  ADMIN_PASSWORD="ChooseYourSecureRandomPassword2026!#"
  ```

### 6.2 Set 32-Byte JWT Secret
* Generate a random 32-byte secret string for signing Edge JWT session tokens:
  ```env
  JWT_SECRET="c8f1e94a8392b4510d9e7284b3f80c51729048a12e34d56789abcdef01234567"
  JWT_EXPIRES_IN="7d"
  ```

---

## 🚀 7. Hosting Deployment & Custom Domain (Vercel / Railway)

### 7.1 Connect Git Repository
1. Log in to [Vercel](https://vercel.com) or [Railway](https://railway.app).
2. Import the Git repository: `https://github.com/OmKardile/patelnetworks.git`.
3. Set Framework Preset: **Next.js**.

### 7.2 Configure Production Environment Variables in Hosting Console
Add all the production variables summarized below:
```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://patelnetworks.in"

# Database
DATABASE_URL="postgresql://postgres.[PROD_REF]:[PROD_PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROD_REF]:[PROD_PASS]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Security
JWT_SECRET="your_secure_32_byte_jwt_secret"
JWT_EXPIRES_IN="7d"
ADMIN_EMAIL="superadmin@patelnetworks.in"
ADMIN_PASSWORD="your_strong_admin_password"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_live_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_live_webhook_secret"

# WhatsApp Cloud API
WHATSAPP_API_URL="https://graph.facebook.com/v20.0"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxx...permanent_token"
WHATSAPP_PHONE_NUMBER_ID="your_15_digit_phone_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_15_digit_waba_id"

# Shiprocket
SHIPROCKET_EMAIL="ops@patelnetworks.in"
SHIPROCKET_PASSWORD="your_shiprocket_password"
SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"

# SMS OTP
SMS_GATEWAY_API_KEY="your_sms_gateway_key"
SMS_SENDER_ID="PTLNET"
```

### 7.3 Domain & DNS Binding
1. In Vercel Project ➔ **Settings ➔ Domains**:
   * Add `patelnetworks.in` and `www.patelnetworks.in`.
2. In your DNS Registrar (GoDaddy / Cloudflare / Namecheap):
   * `A` record: `@` ➔ `76.76.21.21` (or your host's IP)
   * `CNAME` record: `www` ➔ `cname.vercel-dns.com`
3. Wait for automatic SSL certificate issuance.

---

## 🧪 8. Final 12-Step Pre-Flight Smoke Test Checklist

Once the production build is live on `https://patelnetworks.in`, perform this test:

- [ ] **1. SSL & Homepage**: Visit `https://patelnetworks.in`, verify SSL padlock, hero banners, and brand logos.
- [ ] **2. Search Autocomplete**: Type "CP Plus" in header search, verify instant model dropdown, test clear button (`X`), and press `Escape`.
- [ ] **3. Dynamic PDP Variants**: Open `/products/cp-plus-cosmic-series-smart-ir-bullet-camera`, switch between 2MP, 4MP, and 8MP, verify dynamic pricing and sticky bottom bar.
- [ ] **4. 5-Step Kit Builder**: Build a 4-channel CCTV kit in `/kit-builder`, add to cart, and verify the 5% bundle discount.
- [ ] **5. Cart Tax Engine**: Open `/cart`, verify 18% GST calculation (₹442.37 on ₹2,900).
- [ ] **6. Pincode Intelligence**: Test Surat PIN `395003` (Intra-State COD allowed) and Imphal PIN `795001` (Special Zone air-cargo, COD blocked).
- [ ] **7. Live Razorpay Payment**: Place a test ₹1 order, complete UPI payment, and verify automatic redirect to `/order-success/[orderNumber]`.
- [ ] **8. 18% GST Tax Invoice**: On the order success screen, click **Print Tax Invoice** and verify 15-character GSTIN, CGST 9% + SGST 9% tax breakdown.
- [ ] **9. WhatsApp Real-Time Alert**: Verify that the test phone number receives the automated Order Confirmation WhatsApp message.
- [ ] **10. Admin Command Center Auth**: Visit `/admin` (verify HTTP 307 redirect to `/admin/login`), log in with production credentials.
- [ ] **11. Fulfillment & CSV Exports**:
  - In `/admin/orders`: Book carrier AWB, record a test serial number, and click **Export CSV**.
  - In `/admin/reports`: Verify GSTR-1 tax schedules and click **Export CSV**.
- [ ] **12. Error Boundaries & 404 Page**: Visit `/non-existent-link-test` and verify the dark-mode "Surveillance Feed Lost" radar screen.
