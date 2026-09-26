# Patel Networks — VPS Setup Guide

> **Note**: The client may also deploy on their own **physical server** instead of a VPS. See [`PHYSICAL-SERVER-SETUP-GUIDE.md`](./PHYSICAL-SERVER-SETUP-GUIDE.md) for that path (includes hardware specs, OS installation, remote SSH setup, BIOS configuration).
>
> This guide covers the **VPS path** — for when the client prefers a cloud-hosted virtual machine over bare metal.
>
> **Single source of truth** for migrating the database from Supabase to self-hosted PostgreSQL on the client's VPS, and deploying the application.
>
> **Read this entire document once before running any command.**
> Each phase has a ✅ checkpoint. Do not proceed until the checkpoint passes.

---

## Table of Contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Architecture overview](#2-architecture-overview)
3. [Phase A — Prepare the VPS](#phase-a--prepare-the-vps)
4. [Phase B — Deploy the PostgreSQL stack](#phase-b--deploy-the-postgresql-stack)
5. [Phase C — Migrate data from Supabase](#phase-c--migrate-data-from-supabase)
6. [Phase D — Validate the migrated data](#phase-d--validate-the-migrated-data)
7. [Phase E — Deploy the Next.js application](#phase-e--deploy-the-nextjs-application)
8. [Phase F — Reverse proxy + HTTPS (Caddy)](#phase-f--reverse-proxy--https-caddy)
9. [Phase G — Automated backups](#phase-g--automated-backups)
10. [Phase H — Firewall & security hardening](#phase-h--firewall--security-hardening)
11. [Phase I — Final cutover & decommission Supabase](#phase-i--final-cutover--decommission-supabase)
12. [Troubleshooting](#troubleshooting)
13. [Rollback procedure](#rollback-procedure)

---

## 1. What you need before starting

| Item | Why | How to get it |
|---|---|---|
| A VPS (root or sudo user) | Hosts PostgreSQL + the app | Hetzner / DigitalOcean / Linode / AWS Lightsail — 2 vCPU / 4 GB RAM minimum |
| VPS OS | Docker compatibility | Ubuntu 22.04 or 24.04 LTS recommended |
| Domain name (optional but recommended) | HTTPS + production URL | Point DNS A record to the VPS public IP |
| The current `.env` values (from the dev sandbox) | Source DB connection for the one-time dump | Ask the developer, or read from the current `.env` file |
| ~30 minutes | Total setup time | — |

**You do NOT need**: Supabase CLI, any cloud DB account, Firebase, or a managed database service.

---

## 2. Architecture overview

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   Caddy :443    │  ← TLS termination, reverse proxy
              │   (HTTPS)       │
              └────────┬────────┘
                       │ :3000
                       ▼
              ┌─────────────────┐
              │  Next.js app    │  ← Node.js production server
              │  (pm2/systemd)  │
              └────────┬────────┘
                       │ :6432 (PgBouncer, pooled)
                       ▼
              ┌─────────────────┐
              │   PgBouncer     │
              └────────┬────────┘
                       │ :5432
                       ▼
              ┌─────────────────┐
              │  PostgreSQL 16  │  ← persistent volume
              │  /var/lib/      │
              │  patelnetworks/ │
              │  pgdata         │
              └─────────────────┘
```

- **PostgreSQL 16** in Docker, data persisted on the VPS disk
- **PgBouncer** connection pooler (transaction mode)
- **Next.js** production build, managed by pm2 or systemd
- **Caddy** reverse proxy with automatic HTTPS
- **Backups** via cron + `pg_dump`

---

## Phase A — Prepare the VPS

### A.1 SSH into the VPS

```bash
ssh root@YOUR_VPS_IP
# or: ssh deploy@YOUR_VPS_IP  (recommended: use a non-root sudo user)
```

### A.2 Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

### A.3 Install Docker + Docker Compose

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER
newgrp docker   # apply the group change immediately

# Verify
docker --version          # should print Docker version 24+
docker compose version    # should print Compose v2
```

✅ **Checkpoint A**: `docker run hello-world` prints a success message.

### A.4 Install Node.js 20 LTS + Bun (for the Next.js app)

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Bun (faster than npm for this project)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Verify
node --version    # v20.x
bun --version     # 1.x
```

### A.5 Install pm2 (process manager for the app)

```bash
sudo npm install -g pm2
pm2 --version
```

### A.6 Create the persistent data directories

```bash
sudo mkdir -p /var/lib/patelnetworks/pgdata
sudo mkdir -p /var/lib/patelnetworks/backups
sudo chown -R 999:999 /var/lib/patelnetworks/pgdata   # 999 = postgres uid inside the container
sudo chmod 700 /var/lib/patelnetworks/pgdata
```

✅ **Checkpoint A (final)**: `docker --version`, `bun --version`, `pm2 --version`, `ls -ld /var/lib/patelnetworks/pgdata` all succeed.

---

## Phase B — Deploy the PostgreSQL stack

### B.1 Get the project code onto the VPS

**Option 1 — Clone from GitHub (if the repo is pushed):**
```bash
cd /opt
git clone https://github.com/OmKardile/patelnetworks.git
cd patelnetworks
```

**Option 2 — Transfer via scp from the dev machine:**
```bash
# From your dev machine:
scp -r /home/z/my-project deploy@YOUR_VPS_IP:/opt/patelnetworks
```

### B.2 Create the `.env` file on the VPS

```bash
cd /opt/patelnetworks   # or wherever you cloned/transferred
cp .env.example .env
nano .env
```

Edit these lines in `.env`:

```bash
# Use a strong random password — generate one with: openssl rand -base64 24
# Replace CHANGE_ME below with that password (use the SAME value in all 3 places)

DATABASE_URL="postgresql://patelnetworks:CHANGE_ME@127.0.0.1:6432/patelnetworks?schema=public&sslmode=disable"
DIRECT_URL="postgresql://patelnetworks:CHANGE_ME@127.0.0.1:5432/patelnetworks?schema=public&sslmode=disable"

# Generate a strong JWT secret: openssl rand -base64 48
JWT_SECRET="paste-the-generated-jwt-secret-here"
JWT_EXPIRES_IN="7d"
```

Leave the Razorpay / WhatsApp / Shiprocket / SMS / Cloudinary values as placeholders for now — you'll fill those in when you procure those services.

### B.3 Create the Docker secrets file (for the DB superuser + pooler)

Create a separate env file for the database containers (do NOT commit this):

```bash
nano .env.docker
```

Add these two lines (use strong, DIFFERENT passwords):

```bash
POSTGRES_PASSWORD=<generate: openssl rand -base64 24>
PGBOUNCER_APP_PASSWORD=<must match the CHANGE_ME value from .env above>
```

> ⚠️ **Critical**: `PGBOUNCER_APP_PASSWORD` in `.env.docker` must exactly equal the password in `.env`'s `DATABASE_URL` / `DIRECT_URL`. The app authenticates to PgBouncer with this password; PgBouncer then authenticates to PostgreSQL with it.

### B.4 Start the PostgreSQL + PgBouncer stack

```bash
cd /opt/patelnetworks
docker compose --env-file .env.docker up -d
```

### B.5 Wait for the DB to be healthy

```bash
docker compose ps
# Both "db" and "pgbouncer" should show Status = "healthy"
```

### B.6 Create the application database + user

```bash
docker compose exec db psql -U postgres <<SQL
CREATE USER patelnetworks WITH PASSWORD '<same-as-PGBOUNCER_APP_PASSWORD>';
CREATE DATABASE patelnetworks OWNER patelnetworks;
GRANT ALL PRIVILEGES ON DATABASE patelnetworks TO patelnetworks;
SQL
```

### B.7 Test the app role can connect via PgBouncer

```bash
docker compose exec pgbouncer psql -U patelnetworks -d patelnetworks -c "SELECT version();"
```

✅ **Checkpoint B**: the command above prints the PostgreSQL version string. If it fails with "authentication failed", your `PGBOUNCER_APP_PASSWORD` doesn't match — fix `.env` and `.env.docker` and restart with `docker compose --env-file .env.docker restart`.

---

## Phase C — Migrate data from Supabase

> This phase copies the existing 412 rows (29 tables) from the live Supabase database into your new VPS PostgreSQL. **No data is deleted from Supabase** — this is a read-only dump + restore.

### C.1 Install `psql` + `pg_dump` on the VPS (to run the dump)

```bash
sudo apt install -y postgresql-client-16
```

(If apt can't find version 16, use the PostgreSQL APT repo: https://wiki.postgresql.org/wiki/Apt)

### C.2 Dump the Supabase database

You need the current Supabase connection string (from the dev `.env`). Ask the developer for it, or copy it from the existing `.env`'s `DIRECT_URL` line.

```bash
# Replace <SUPABASE_DB_URL> with the full DIRECT_URL from the dev .env
# (the one that ends in :5432/postgres?sslmode=require — NOT the pooler :6543 URL)

pg_dump \
  "<SUPABASE_DB_URL>" \
  --no-owner --no-privileges --clean --if-exists \
  --schema=public \
  --no-tablespaces \
  | gzip > /tmp/supabase-export.sql.gz
```

This produces a compressed SQL file (~100 KB for 412 rows). Verify it's non-empty:

```bash
ls -lh /tmp/supabase-export.sql.gz
gunzip -c /tmp/supabase-export.sql.gz | head -20   # should show CREATE TABLE statements
```

### C.3 Restore into the VPS PostgreSQL

```bash
gunzip -c /tmp/supabase-export.sql.gz | \
  docker compose exec -T db psql -U patelnetworks -d patelnetworks
```

Watch for errors. Common ones:
- `role "postgres" does not exist` → harmless (we used `--no-owner`)
- `extension "pgcrypto" does not exist` → see Troubleshooting below

### C.4 Regenerate the Prisma client (if the schema uses `gen_random_uuid()`)

```bash
docker compose exec db psql -U postgres -d patelnetworks -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

---

## Phase D — Validate the migrated data

### D.1 Count tables + rows (must match Supabase)

```bash
# Expected: 29 tables, ~412 total rows
docker compose exec db psql -U patelnetworks -d patelnetworks <<'SQL'
SELECT count(*) AS table_count FROM pg_tables WHERE schemaname='public';

SELECT tablename, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;
SQL
```

Compare the row counts against the Supabase source (run the same query on Supabase via `psql` or the Supabase SQL editor). They must match.

### D.2 Generate the Prisma client against the VPS DB

```bash
cd /opt/patelnetworks
bun install
bun run db:generate
```

✅ **Checkpoint D**: `Generated Prisma Client (v6.x)` printed, no errors.

### D.3 Typecheck + lint

```bash
bun run typecheck   # should print nothing (0 errors)
bun run lint        # should print nothing (0 errors)
```

---

## Phase E — Deploy the Next.js application

### E.1 Build the production bundle

```bash
cd /opt/patelnetworks
bun run build
```

✅ **Checkpoint E**: `✓ Compiled successfully` + an exit code of 0, and `.next/BUILD_ID` exists.

### E.2 Start the app with pm2

```bash
pm2 start "bun run start" --name patelnetworks
pm2 save
pm2 startup   # follow the instructions it prints to make pm2 start on boot
```

### E.3 Verify the app is responding

```bash
curl -fsS http://localhost:3000/ | grep -o '<title>[^<]*</title>'
# Expected: <title>Patel Networks — Commercial CCTV, Surveillance & Networking Hardware</title>
```

✅ **Checkpoint E (final)**: the homepage title renders. Try a few more routes:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/products          # 200
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/kit-builder        # 200
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/login        # 200
```

---

## Phase F — Reverse proxy + HTTPS (Caddy)

### F.1 Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### F.2 Configure Caddy

Edit `/etc/caddy/Caddyfile`:

```caddy
# Replace patelnetworks.in with your domain (or use the VPS IP without HTTPS)
patelnetworks.in {
    reverse_proxy localhost:3000
}
```

### F.3 Restart Caddy

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

Caddy automatically provisions a Let's Encrypt TLS certificate (requires DNS to point to the VPS). Check:

```bash
sudo journalctl -u caddy --no-pager | tail -20
curl -fsS https://patelnetworks.in/ | grep -o '<title>[^<]*</title>'
```

✅ **Checkpoint F**: `https://patelnetworks.in/` loads with a valid certificate and shows the homepage title.

---

## Phase G — Automated backups

### G.1 Make the backup script executable + test it

```bash
cd /opt/patelnetworks
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
ls -lh /var/lib/patelnetworks/backups/   # should show a new .sql.gz file
```

### G.2 Schedule daily backups via cron

```bash
sudo crontab -e
```

Add this line (daily at 02:00):

```cron
0 2 * * * /opt/patelnetworks/scripts/backup-db.sh >> /var/log/patelnetworks-backup.log 2>&1
```

✅ **Checkpoint G**: a backup file exists in `/var/lib/patelnetworks/backups/` and cron is scheduled.

---

## Phase H — Firewall & security hardening

### H.1 Enable UFW

```bash
sudo apt install -y ufw

# Allow SSH (don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP + HTTPS (for Caddy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable
sudo ufw status verbose
```

### H.2 Confirm PostgreSQL is NOT exposed to the internet

```bash
sudo ufw status
# You should NOT see port 5432 or 6432 in the allowed list — they bind to 127.0.0.1 only (docker-compose.yml)
```

### H.3 (Optional) Set up SSH key auth + disable password login

```bash
# Add your public key to ~/.ssh/authorized_keys first, then:
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

✅ **Checkpoint H**: `sudo ufw status` shows only 22, 80, 443 allowed. SSH still works.

---

## Phase I — Final cutover & decommission Supabase

> **Only proceed after Phase D–H all pass and you've used the VPS-hosted app for at least 24 hours without issues.**

### I.1 Final validation — re-run everything

```bash
cd /opt/patelnetworks
bun run typecheck && bun run lint && bun run build
curl -fsS https://patelnetworks.in/ | grep -o '<title>[^<]*</title>'
pm2 status   # patelnetworks should be "online"
docker compose ps   # db + pgbouncer healthy
```

### I.2 Take a final Supabase backup (in case anything was missed)

```bash
pg_dump "<SUPABASE_DB_URL>" --no-owner --no-privileges --schema=public | gzip > /tmp/supabase-final-backup.sql.gz
ls -lh /tmp/supabase-final-backup.sql.gz
```

### I.3 Decommission Supabase

1. Go to the Supabase dashboard → Settings → General → **Delete Project**
2. Confirm deletion (this is irreversible — the final backup above is your safety net)

### I.4 Rotate the Supabase DB password (if you ever push the repo to GitHub)

The git history contains the old Supabase credentials. If you push this repo to a public/private remote:

```bash
# Option A: rotate the password in Supabase BEFORE pushing (but you already deleted Supabase in I.3, so this is moot)
# Option B: purge .env from git history using BFG Repo-Cleaner
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

✅ **Checkpoint I (final)**: the app is live at `https://patelnetworks.in`, Supabase is decommissioned, backups are scheduled, firewall is up.

---

## Troubleshooting

### `pg_dump` fails with "connection refused"

- You're using the pooler URL (port 6543). Use the **direct** URL (port 5432) for `pg_dump`.
- Check the Supabase project isn't paused (dashboard → Settings).

### Restore fails with "extension pgcrypto does not exist"

Run on the VPS DB before restoring:
```bash
docker compose exec db psql -U postgres -d patelnetworks -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```
Then re-run the restore.

### Restore fails with "role postgres does not exist"

This is harmless (we used `--no-owner`). The restore still succeeds. Verify with the row count in Phase D.

### App shows "Internal Server Error" after starting

```bash
pm2 logs patelnetworks --lines 50
# Common cause: .env DATABASE_URL points to the wrong host/port, or the password doesn't match .env.docker
```

### `docker compose` command not found

You're on an older Docker. Use `docker-compose` (with a hyphen) instead, or upgrade Docker to v24+.

### PgBouncer says "authentication failed"

Your `PGBOUNCER_APP_PASSWORD` (in `.env.docker`) doesn't match the password in the app's `.env` `DATABASE_URL`. Fix both to use the same value, then:
```bash
docker compose --env-file .env.docker down
docker compose --env-file .env.docker up -d
```

### The app builds but pages return 500 at runtime

```bash
# Check the app can reach the DB
docker compose exec pgbouncer psql -U patelnetworks -d patelnetworks -c "SELECT 1;"
# If that works, the .env DATABASE_URL is correct. Check pm2 logs for the actual error.
pm2 logs patelnetworks --lines 100
```

### Port 3000 is already in use

```bash
sudo lsof -i :3000
# Kill the process or change the port in the pm2 start command + Caddyfile
```

---

## Rollback procedure

If the VPS deployment fails and you need to fall back to Supabase temporarily:

1. **Do NOT delete Supabase** until the VPS is fully validated (Phase I).
2. To revert the app to Supabase, edit `.env` on the VPS:
   ```bash
   DATABASE_URL="<SUPABASE_POOLER_URL>"
   DIRECT_URL="<SUPABASE_DIRECT_URL>"
   ```
3. Restart the app:
   ```bash
   pm2 restart patelnetworks
   ```
4. Investigate the VPS DB issue, fix, re-run Phase C–D.

The Supabase database is untouched by this entire process (read-only dump only) until you explicitly delete it in Phase I.3.

---

## Quick reference — the 9 commands that matter

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER && newgrp docker

# 2. Install Node + Bun + pm2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs && curl -fsSL https://bun.sh/install | bash && source ~/.bashrc && sudo npm install -g pm2

# 3. Get the code + create .env
cd /opt && git clone https://github.com/OmKardile/patelnetworks.git && cd patelnetworks && cp .env.example .env && nano .env

# 4. Start PostgreSQL + PgBouncer
docker compose --env-file .env.docker up -d

# 5. Create the DB user
docker compose exec db psql -U postgres -c "CREATE USER patelnetworks WITH PASSWORD '<PWD>'; CREATE DATABASE patelnetworks OWNER patelnetworks;"

# 6. Dump from Supabase + restore
pg_dump "<SUPABASE_DB_URL>" --no-owner --no-privileges --clean --if-exists --schema=public | gzip > /tmp/exp.sql.gz
gunzip -c /tmp/exp.sql.gz | docker compose exec -T db psql -U patelnetworks -d patelnetworks

# 7. Build + start the app
bun install && bun run build && pm2 start "bun run start" --name patelnetworks && pm2 save && pm2 startup

# 8. Schedule backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/patelnetworks/scripts/backup-db.sh >> /var/log/pn-backup.log 2>&1") | crontab -

# 9. Decommission Supabase (ONLY after 24h of stable VPS operation)
# → Supabase dashboard → Settings → Delete Project
```

---

## What you need to tell the developer (to unblock Phase C)

Before starting Phase C, provide these to the developer (or generate them yourself):

1. **The current Supabase `DIRECT_URL`** — from the existing `.env` (the `:5432` URL, not the `:6543` pooler URL). Needed for `pg_dump`.
2. **A chosen `POSTGRES_PASSWORD`** — `openssl rand -base64 24`
3. **A chosen `PGBOUNCER_APP_PASSWORD`** — `openssl rand -base64 24` (this becomes the app's DB password)
4. **A chosen `JWT_SECRET`** — `openssl rand -base64 48`
5. **Your domain name** (or confirm you'll use the VPS IP without HTTPS)

That's it. Everything else is in this guide.

---

<p align="center">
<em>Authored by Omkar Kardile — Patel Networks / MegaTech</em><br/>
<sub>Surveillance hardware procurement platform · India</sub>
</p>
