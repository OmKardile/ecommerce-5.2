# Patel Networks — VPS Deployment Guide

> **Architecture change (ADR-022):** the database has been migrated from Supabase-managed PostgreSQL to **self-hosted PostgreSQL on the client's VPS**. No managed database services. This document supersedes the prior Supabase deployment instructions.

---

## 1. Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client VPS                                                  │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Next.js app │───▶│  PgBouncer   │───▶│  PostgreSQL  │   │
│  │  (port 3000) │    │  (port 6432) │    │   16 (5432)  │   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                  │           │
│                              /var/lib/patelnetworks/pgdata ◀──┘           │
│                              (persistent volume)            │
└─────────────────────────────────────────────────────────────┘
```

- **Database**: PostgreSQL 16 (Alpine) in Docker, persistent bind-mount on the VPS host.
- **Connection pooler**: PgBouncer (transaction mode) for application queries.
- **Direct connection**: used by Prisma for migrations (`DIRECT_URL`).
- **Backups**: `pg_dump` → compressed `.sql.gz`, 14-day retention (`scripts/backup-db.sh`).
- **No managed services**: no Supabase, no Firebase, no RDS.

---

## 2. Prerequisites on the VPS

- Docker Engine 24+ and Docker Compose v2
- A non-root deploy user with `docker` group membership
- Firewall: expose only the app port (3000 or 80/443 via Caddy). PostgreSQL (5432) and PgBouncer (6432) bind to `127.0.0.1` only.
- Persistent disk at `/var/lib/patelnetworks/` (≥ 20 GB recommended for DB + backups)

---

## 3. Database Provisioning

### 3.1 Create the persistent volume directory

```bash
sudo mkdir -p /var/lib/patelnetworks/pgdata
sudo mkdir -p /var/lib/patelnetworks/backups
sudo chown -R 999:999 /var/lib/patelnetworks/pgdata   # postgres uid in the container
```

### 3.2 Create the `.env` on the VPS

Copy `.env.example` to `.env` and set strong secrets:

```bash
# .env on the VPS (Docker host)
POSTGRES_PASSWORD="<a-strong-random-password>"        # superuser
PGBOUNCER_APP_PASSWORD="<a-different-strong-password>" # app role
```

Create a separate `.env` for the Next.js app:

```bash
# .env (app)
DATABASE_URL="postgresql://patelnetworks:<PGBOUNCER_APP_PASSWORD>@127.0.0.1:6432/patelnetworks?schema=public&sslmode=disable"
DIRECT_URL="postgresql://patelnetworks:<PGBOUNCER_APP_PASSWORD>@127.0.0.1:5432/patelnetworks?schema=public&sslmode=disable"
JWT_SECRET="<openssl rand -base64 48>"
# … (Razorpay, WhatsApp, Shiprocket, SMS, Cloudinary as needed)
```

### 3.3 Start the database stack

```bash
docker compose up -d
docker compose ps   # both db + pgbouncer should be healthy
```

### 3.4 Create the application role + database

```bash
docker compose exec db psql -U postgres <<'SQL'
  CREATE USER patelnetworks WITH PASSWORD '<PGBOUNCER_APP_PASSWORD>';
  CREATE DATABASE patelnetworks OWNER patelnetworks;
  GRANT ALL PRIVILEGES ON DATABASE patelnetworks TO patelnetworks;
SQL
```

---

## 4. Schema Deployment

The Prisma schema (`prisma/schema.prisma`) is already standard PostgreSQL — no Supabase-specific types. The 29 models map to snake_case tables via `@@map`.

> ⚠️ **For a fresh VPS database** (empty): run `bun run db:push` (or `prisma migrate dev --name init` to start a migration history).
>
> ⚠️ **To migrate the existing live data from Supabase**: see §5 below — do **not** run `db:push` against an empty VPS DB if you want to preserve the 376 rows of existing orders/products.

---

## 5. Migrating Existing Data from Supabase (one-time)

Until the data is migrated, the app can keep pointing at the live Supabase database (the current `.env`). Once the VPS database is provisioned:

### 5.1 Dump from Supabase

```bash
# From a machine with network access to the Supabase pooler:
pg_dump \
  "postgresql://postgres.yhqgogsednnarjfspado:AJ9J8PM4iS2q8D0C@aws-0-ap-northeast-1.supabase.com:5432/postgres?sslmode=require" \
  --no-owner --no-privileges --clean --if-exists \
  --schema=public \
  | gzip > supabase-export.sql.gz
```

### 5.2 Restore into the VPS

```bash
# Copy supabase-export.sql.gz to the VPS, then:
gunzip -c supabase-export.sql.gz | docker compose exec -T db psql -U postgres -d patelnetworks
```

### 5.3 Verify row counts

```bash
docker compose exec db psql -U postgres -d patelnetworks -c \
  "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
```

Expected: 29 tables, 376 total rows (verify against the documented counts in `worklog.md`).

### 5.4 Switch the app `.env`

Update the app's `.env` `DATABASE_URL` / `DIRECT_URL` to the VPS PostgreSQL strings (§3.2), then restart the app.

---

## 6. Backups

The included `scripts/backup-db.sh` runs `pg_dump` via the db container and retains 14 days.

```bash
# Manual backup
/opt/patelnetworks/scripts/backup-db.sh

# Cron (daily at 02:00)
sudo crontab -e
0 2 * * * /opt/patelnetworks/scripts/backup-db.sh >> /var/log/patelnetworks-backup.log 2>&1
```

Backups land in `/var/lib/patelnetworks/backups/patelnetworks-YYYYMMDD-HHMMSS.sql.gz`.

**Restore from backup:**

```bash
gunzip -c /var/lib/patelnetworks/backups/patelnetworks-<timestamp>.sql.gz | \
  docker compose exec -T db psql -U postgres -d patelnetworks
```

---

## 7. Application Deployment

The Next.js app can run on the same VPS (recommended) or a separate host:

- **Same VPS**: build the standalone output (`bun run build`), run `bun .next/standalone/server.js`, set `DATABASE_URL` to `127.0.0.1:6432`.
- **Separate host**: replace `127.0.0.1` in the connection strings with the VPS private IP; ensure the firewall allows the app host to reach ports 5432/6432.

Caddy (already configured in `Caddyfile`) terminates TLS and reverse-proxies to port 3000.

---

## 8. Validation Checklist

After deployment, run on the VPS:

```bash
# 1. Database connectivity
docker compose exec db psql -U patelnetworks -d patelnetworks -c "SELECT count(*) FROM users;"

# 2. Prisma client generation (from the app host)
bun run db:generate

# 3. Typecheck + lint + build
bun run typecheck
bun run lint
bun run build

# 4. Smoke test the app
curl -fsS http://localhost:3000/ | grep -o '<title>[^<]*</title>'
```

---

## 9. What Was Removed (from the prior Supabase setup)

- `supabase/` directory (Supabase CLI scaffold — `config.toml`, `.temp/`)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars (were declared but never used by the app)
- `**.supabase.co` image hostname pattern in `next.config.ts`
- All Supabase references in `.env.example`, README, technical docs, and ADRs
- Supabase deployment instructions (this document supersedes them)

## 10. What Was Kept

- The Prisma schema (29 models, 5 enums) — already standard PostgreSQL, no changes
- All business entities and relationships (Category → Brand → Product → Variant → SKU → Inventory)
- All application logic (orders, payments, inventory, OTP auth, kit builder)
- The current working `.env` (still pointing to the live Supabase database) — so the app keeps running during the transition. **Switch it to the VPS strings once §5 is complete.**

---

## 11. Blockers Requiring VPS Information

To complete the cutover, the client needs to provide:

1. **VPS access** (SSH) or confirm Docker is installed.
2. **A strong `POSTGRES_PASSWORD`** and **`PGBOUNCER_APP_PASSWORD`** (or have us generate them).
3. **Confirmation** of whether the Next.js app runs on the same VPS or a separate host (affects firewall rules).
4. **Decision** on data migration: keep the existing 376 rows (run §5) or start fresh.

Once the VPS database is up and the app `.env` is switched, the Supabase project can be paused/deleted by the client.
