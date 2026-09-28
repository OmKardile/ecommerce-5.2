# Patel Networks — Render Deployment Guide

> **Goal**: Auto-deploy the app to a live URL on every GitHub commit. No local dev server needed — just `git push` and Render rebuilds + publishes automatically.
>
> This is a **staging/preview environment**, not the final production deployment (which will be the physical server per `PHYSICAL-SERVER-SETUP-GUIDE.md`). Render gives you a public URL to view the app during development.

---

## How it works

```
  You commit to GitHub (patel-5.2)
         │
         ▼
  Render detects the push
         │
         ▼
  Render runs: npm install → prisma generate → npm run build
         │
         ▼
  Render starts: node .next/standalone/server.js
         │
         ▼
  Live URL: https://patel-5.2.onrender.com  (auto-updated)
         │
         ▼
  App connects to: Supabase PostgreSQL (existing DB, temporary)
```

**You push → Render builds → site is live in ~2-3 minutes.** Zero local setup.

---

## Prerequisites

1. The GitHub repo: https://github.com/OmKardile/patel-5.2 (already exists)
2. A Render account (free signup at https://render.com — sign in with GitHub)
3. The current Supabase DB credentials (for the env vars)

---

## Step 1 — Create a Web Service on Render

1. Go to https://dashboard.render.com → **New +** → **Web Service**

2. Connect your GitHub account if prompted, then select the repo:
   ```
   OmKardile/patel-5.2
   ```

3. Configure the service:

   | Field | Value |
   |---|---|
   | **Name** | `patel-5.2` (or whatever you like — this becomes the URL subdomain) |
   | **Runtime** | `Node` |
   | **Region** | Choose the closest to your users (e.g., `Singapore` for India — lowest latency) |
   | **Branch** | `main` |
   | **Root Directory** | (leave blank) |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `node .next/standalone/server.js` |
   | **Instance Type** | `Free` (sleeps after 15 min inactivity) or `Starter` ($7/mo, always-on) |

   > ⚠️ **Why `node .next/standalone/server.js`?** The repo's `next.config.ts` has `output: "standalone"`, which produces a self-contained server that automatically respects Render's `PORT` environment variable. Using `next start` would require overriding the port manually.

4. Click **Create Web Service**. Render will start the first build immediately.

---

## Step 2 — Set environment variables

After creating the service, go to the **Environment** tab and add these variables. **These are the same values as your local `.env`** (Render stores them securely — they're not committed to git):

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.yhqgogsednnarjfspado:AJ9J8PM4iS2q8D0C@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true` | The existing Supabase pooler URL (read/write, temporary) |
| `DIRECT_URL` | `postgresql://postgres.yhqgogsednnarjfspado:AJ9J8PM4iS2q8D0C@aws-0-ap-northeast-1.supabase.com:5432/postgres?sslmode=require` | The Supabase direct URL (needed by Prisma during build for `generate`) |
| `JWT_SECRET` | `f8Torv3csTSc+GFaIOxzyvu74tpz0vzcSjudKHYpRb9Efburdq0KzeyT0pzulEMo` | The current JWT secret (same as local) |
| `JWT_EXPIRES_IN` | `7d` | |
| `NODE_ENV` | `production` | |
| `NEXT_PUBLIC_APP_URL` | `https://patel-5.2.onrender.com` | Replace with your actual Render URL once assigned |

> ⚠️ **About the database**: This connects the Render app to the **existing Supabase DB** (which has the 412 rows of data). This is temporary — when the physical server PostgreSQL is ready (per `PHYSICAL-SERVER-SETUP-GUIDE.md`), update `DATABASE_URL` and `DIRECT_URL` to point to the physical server instead. Then Supabase can be decommissioned.

Click **Save Changes**. Render will rebuild with the new env vars.

---

## Step 3 — Enable auto-deploy

1. Go to **Settings** → scroll to **Auto-Deploy**
2. Ensure **"Deploy the latest commit on every push to the main branch"** is ✅ enabled
3. Now every `git push` to `main` triggers a rebuild automatically

---

## Step 4 — Verify the deployment

1. Wait for the first build to finish (~2-3 minutes). Watch the **Events** tab or the build logs.

2. Once it shows **"Live"**, open the URL Render assigned (e.g., `https://patel-5.2.onrender.com`).

3. Verify:
   ```bash
   # The homepage should render
   curl -fsS https://patel-5.2.onrender.com/ | grep -o '<title>[^<]*</title>'
   # Expected: <title>Patel Networks — Commercial CCTV, Surveillance & Networking Hardware</title>
   ```

4. Test a few routes:
   - `https://patel-5.2.onrender.com/products` — product catalog
   - `https://patel-5.2.onrender.com/admin/login` — admin login (use `superadmin@patelnetworks.in` / `patel@admin2026`)
   - `https://patel-5.2.onrender.com/kit-builder` — CCTV kit builder

✅ **Checkpoint**: the site is live and renders correctly.

---

## Your new workflow

Instead of running locally, you now:

```bash
# 1. Make changes
# 2. Commit + push
git add -A
git commit -m "feat: <your change>"
git push origin main

# 3. Wait ~2-3 minutes
# 4. View the live site: https://patel-5.2.onrender.com
```

Render auto-detects the push, rebuilds, and deploys. You see the change live on the internet.

---

## Cost

| Tier | Price | Behavior |
|---|---|---|
| **Free** | $0 | Sleeps after 15 min of inactivity. First request after sleep takes ~30 seconds to wake. 750 build minutes/month. Fine for staging/preview. |
| **Starter** | $7/month | Always-on (no sleep). 750 build minutes/month. Better for demos/showing clients. |
| **Standard** | $25/month | More RAM + CPU. Only needed at scale. |

**Recommendation for now**: start on **Free**. If the 30-second wake delay annoys you, upgrade to **Starter** ($7/mo).

---

## Important notes

### 1. The standalone server needs static files

The `output: "standalone"` build produces `.next/standalone/server.js` but it doesn't automatically include the `public/` folder and `.next/static/` assets. **If CSS/images are missing on Render**, update the Build Command to:

```
npm install && npx prisma generate && npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

This copies the static assets into the standalone directory so the server can serve them.

### 2. Build-time database access

The build runs `prisma generate` (local-only, no DB contact) and `next build` (which statically pre-renders some pages by querying the DB). This means **`DATABASE_URL` must be set and reachable during the build**. Supabase's pooler URL works fine for this.

### 3. The database is shared

The Render app connects to the **same Supabase database** as the sandbox. Any orders, carts, or audit logs created on the Render URL will appear in the shared DB. This is fine for staging — when you switch to the physical server DB later, those staging rows won't carry over (they stay in Supabase until decommissioned).

### 4. Free tier cold starts

On the Free tier, the app sleeps after 15 minutes of no requests. The first request after sleep takes ~30 seconds (Render spins up the instance). Subsequent requests are fast. If this is a problem for demos, upgrade to Starter ($7/mo) which is always-on.

### 5. When the physical server is ready

Once the client's physical server PostgreSQL is provisioned (per `PHYSICAL-SERVER-SETUP-GUIDE.md`):

1. Update the Render env vars `DATABASE_URL` and `DIRECT_URL` to point to the physical server
2. The physical server must be internet-accessible (port 5432/6432 forwarded, or use a tunnel like Cloudflare Tunnel / Tailscale if behind NAT)
3. Render rebuilds + reconnects automatically
4. Decommission Supabase

Or, if the physical server isn't internet-accessible, keep Render connected to Supabase for staging and run production on the physical server directly.

---

## Troubleshooting

### Build fails with "Prisma can't reach the database"

- Check `DATABASE_URL` and `DIRECT_URL` are set in Render's Environment tab
- The Supabase project must not be paused (check the Supabase dashboard)
- The `DIRECT_URL` (port 5432) is needed during build for `prisma generate` — don't use the pooler URL for that

### App deploys but shows "Internal Server Error"

- Check the **Logs** tab in Render for the error
- Common cause: env var typo, or the DB password is wrong
- Test the connection: `DATABASE_URL` must work from Render's network (Supabase allows external connections by default)

### CSS/images missing on the live site

The standalone build doesn't copy static files by default. Update the Build Command (see note #1 above):
```
npm install && npx prisma generate && npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

### Build takes too long

- First build: ~2-3 minutes (installs deps, generates Prisma, builds Next.js)
- Subsequent builds: faster (Render caches `node_modules`)
- If builds are slow on Free tier, consider upgrading to Starter

### "Port already in use" error

Render assigns the `PORT` env var automatically. The standalone `server.js` respects it. If you're using `next start` instead, make sure the Start Command is `next start -p $PORT` (not hardcoded to 3000).

---

## Quick reference — Render setup in 4 steps

1. **Render dashboard** → New Web Service → connect `OmKardile/patel-5.2`
2. **Build Command**: `npm install && npx prisma generate && npm run build`
3. **Start Command**: `node .next/standalone/server.js`
4. **Environment vars**: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `NEXT_PUBLIC_APP_URL`

That's it. Push to `main` → live in 2-3 minutes.

---

<p align="center">
<em>Authored by Omkar Kardile — Omkar Kardile</em><br/>
<sub>Surveillance hardware procurement platform · India</sub>
</p>
