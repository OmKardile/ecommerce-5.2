# Patel Networks — Physical Server Setup Guide

> **Complete guide** for deploying the Patel Networks CCTV e-commerce platform on the client's own physical server (bare metal). Covers hardware selection → OS installation → remote SSH access → full application deployment.
>
> **Read this entire document once before starting.** Each phase has a ✅ checkpoint.
>
> This guide supersedes the prior VPS deployment docs (ADR-022 still applies for the architecture decision).

---

## Table of Contents

1. [Hardware requirements](#1-hardware-requirements)
2. [Architecture overview](#2-architecture-overview)
3. [Phase A — Install the operating system](#phase-a--install-the-operating-system)
4. [Phase B — Post-install: updates + create deploy user](#phase-b--post-install-updates--create-deploy-user)
5. [Phase C — Remote SSH access setup](#phase-c--remote-ssh-access-setup)
6. [Phase D — Network configuration (static IP + firewall)](#phase-d--network-configuration-static-ip--firewall)
7. [Phase E — Install Docker](#phase-e--install-docker)
8. [Phase F — Install Node.js + Bun + pm2](#phase-f--install-nodejs--bun--pm2)
9. [Phase G — Deploy PostgreSQL + PgBouncer](#phase-g--deploy-postgresql--pgbouncer)
10. [Phase H — Migrate data from Supabase](#phase-h--migrate-data-from-supabase)
11. [Phase I — Deploy the Next.js application](#phase-i--deploy-the-nextjs-application)
12. [Phase J — Reverse proxy + HTTPS (Caddy)](#phase-j--reverse-proxy--https-caddy)
13. [Phase K — Automated backups](#phase-k--automated-backups)
14. [Phase L — Security hardening](#phase-l--security-hardening)
15. [Phase M — Monitoring basics](#phase-m--monitoring-basics)
16. [Phase N — Final cutover & decommission Supabase](#phase-n--final-cutover--decommission-supabase)
17. [Troubleshooting](#troubleshooting)
18. [Rollback procedure](#rollback-procedure)
19. [Quick reference — the 12 commands](#quick-reference--the-12-commands)

---

## 1. Hardware requirements

### Minimum (testing / <10 concurrent users)

| Component | Minimum spec | Notes |
|---|---|---|
| **CPU** | 2 cores (x86-64) | Intel Core i3 / AMD Ryzen 3 or better. ARM (Raspberry Pi 4 8GB) technically works but x86 is recommended for Docker image compatibility |
| **RAM** | 4 GB | PostgreSQL (~500 MB) + Node.js (~300 MB) + PgBouncer (~50 MB) + Caddy (~50 MB) + OS (~500 MB) + build headroom (~1.5 GB) |
| **Storage** | 40 GB SSD | 4 GB app + 50 MB DB (growing) + 2 GB OS/tools + 14 days backups + headroom |
| **Network** | 100 Mbps | For serving pages + DB replication (if added later) |
| **Power** | Always-on | Server must run 24/7; use a UPS (uninterruptible power supply) to survive outages |

### Recommended (production, comfortable)

| Component | Recommended spec | Notes |
|---|---|---|
| **CPU** | 4 cores | Faster builds, handles 50-100 concurrent users, room for growth |
| **RAM** | 8 GB | Comfortable builds + runtime headroom for traffic spikes |
| **Storage** | 80 GB SSD (or NVMe) | SSD is critical — HDD builds are 5-10× slower |
| **Network** | 1 Gbps | Indian fiber connections typically 100 Mbps+ |
| **Power** | UPS with ≥ 30 min battery | For graceful shutdown during power cuts |

### What the app actually uses (measured)

| Resource | Value |
|---|---|
| Build output (`.next/`) | 431 MB |
| `node_modules` | 1.2 GB |
| Docker images (postgres + pgbouncer + caddy) | ~150 MB |
| Database (29 tables, 412 rows + indexes) | ~50 MB (will grow with orders) |
| 14 days of backups | ~1.5 MB (will grow) |
| Peak RAM during `next build` | ~1-1.5 GB |
| Steady-state RAM (all services running) | ~1.1 GB |

### Hardware don'ts

- ❌ **Don't use a Raspberry Pi or ARM SBC** unless you're experienced — Docker image compatibility issues, slower builds
- ❌ **Don't use an HDD** — builds take 5-10× longer, page loads are sluggish
- ❌ **Don't use < 4 GB RAM** — the Next.js build will OOM (out of memory)
- ❌ **Don't use a shared/cloud VM** — you wanted self-hosted; stick to a machine you control

### If reusing an old PC/laptop

An old desktop (Intel i5/i7, 8-16 GB RAM, 120 GB SSD) works great. Just make sure:
- It's wired to the network (Ethernet, not Wi-Fi — Wi-Fi is unstable for servers)
- It's set to boot after power loss (BIOS setting: "AC Power Recovery" → "Power On")
- Sleep/hibernate is disabled in the OS
- The fans/cooling are adequate for 24/7 operation

---

## 2. Architecture overview

```
                    Internet
                       │
                       ▼
           ┌───────────────────────┐
           │  Router / Firewall    │  ← port forwarding: 80/443 → server
           │  (client's network)   │
           └───────────┬───────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │  Physical Server      │
           │  (static LAN IP)      │
           │                       │
           │  ┌─────────────────┐  │
           │  │  Caddy :443     │  │  ← TLS termination, reverse proxy
           │  └────────┬────────┘  │
           │           │ :3000     │
           │           ▼           │
           │  ┌─────────────────┐  │
           │  │  Next.js app    │  │  ← pm2-managed Node.js
           │  └────────┬────────┘  │
           │           │ :6432      │
           │           ▼           │
           │  ┌─────────────────┐  │
           │  │  PgBouncer      │  │
           │  └────────┬────────┘  │
           │           │ :5432     │
           │           ▼           │
           │  ┌─────────────────┐  │
           │  │  PostgreSQL 16  │  │  ← data on local disk
           │  └─────────────────┘  │
           └───────────────────────┘
```

---

## Phase A — Install the operating system

### A.1 Download Ubuntu Server LTS

**Recommended: Ubuntu Server 24.04 LTS** (supported until 2029)

Download the ISO: https://ubuntu.com/download/server

> Why Ubuntu Server (not Desktop)? No GUI overhead (~500 MB RAM saved), Docker support is excellent, and 90% of tutorials assume it.

**Alternative:** Debian 12 (lighter, more stable, but fewer prebuilt packages).

### A.2 Create a bootable USB

**On Windows** (use Rufus):
```powershell
# Download Rufus: https://rufus.ie/
# Open Rufus → select the Ubuntu ISO → select your USB drive → Start
```

**On Mac/Linux:**
```bash
# Find your USB device
lsblk    # or: diskutil list (Mac)

# Write the ISO (replace /dev/sdX with your USB device)
sudo dd if=ubuntu-24.04-live-server-amd64.iso of=/dev/sdX bs=4M status=progress
sync
```

### A.3 Boot from the USB + install

1. Insert the USB into the server
2. Power on → enter BIOS/UEFI (usually `F2`, `F12`, `Del`, or `Esc`)
3. Set boot order: USB first
4. Save + reboot → Ubuntu installer starts

### A.4 Installer steps

Follow the installer prompts:

| Step | What to choose |
|---|---|
| Language | English |
| Keyboard | Your layout |
| Installation type | "Ubuntu Server" (minimized, no snap bloat) |
| Network | Configure static IP here (see Phase D if unsure — you can also do it later) |
| Storage | "Use an entire disk" → select your SSD → check "Set up this disk as an LVM group" (allows easy resizing later) |
| Profile | Your name + server name (e.g. `patel-prod`) + username (e.g. `deploy`) + a strong password |
| SSH Setup | ✅ Check "Install OpenSSH server" — **critical**, this enables remote access |
| Snaps | Skip (don't install any snap packages) |

### A.5 Reboot + login

```bash
# After install completes, remove USB, reboot, and login at the console:
# username: deploy (or whatever you chose)
# password: the password you set
```

✅ **Checkpoint A**: `ip addr` shows a network interface with an IP address. `ssh deploy@localhost` works locally.

---

## Phase B — Post-install: updates + create deploy user

### B.1 Update the system

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw fail2ban unattended-upgrades
```

### B.2 Enable automatic security updates

```bash
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes" to automatically install security updates
```

### B.3 (If you didn't create a deploy user during install)

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
# Set a strong password:
sudo passwd deploy
```

### B.4 Set the hostname (optional but helpful)

```bash
sudo hostnamectl set-hostname patel-prod
# Add to /etc/hosts:
echo "127.0.1.1 patel-prod" | sudo tee -a /etc/hosts
```

✅ **Checkpoint B**: `sudo apt update` succeeds, `deploy` user can run `sudo` commands.

---

## Phase C — Remote SSH access setup

This phase lets you manage the server remotely from your laptop instead of standing in front of it with a keyboard/monitor.

### C.1 Find the server's IP address

```bash
# On the server console:
ip addr show
# Look for the "inet" line under your Ethernet interface (e.g., eth0, enp3s0)
# Example: inet 192.168.1.50/24 → your LAN IP is 192.168.1.50
```

### C.2 Generate SSH keys on your laptop (if you don't have them)

**On your laptop** (NOT the server):

```bash
# Check if you already have keys:
ls ~/.ssh/id_ed25519.pub 2>/dev/null && echo "You already have a key" || echo "Need to generate one"

# Generate a new key (if needed):
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for all defaults (empty passphrase is fine for convenience, but a passphrase is more secure)
```

### C.3 Copy your public key to the server

**On your laptop:**

```bash
# Replace 192.168.1.50 with your server's IP
ssh-copy-id deploy@192.168.1.50
# Enter the deploy user's password when prompted
```

### C.4 Test passwordless login

**On your laptop:**

```bash
ssh deploy@192.168.1.50
# You should now log in WITHOUT a password (using the key instead)
```

✅ **Checkpoint C**: `ssh deploy@<server-ip>` logs you in without asking for a password.

### C.5 (Recommended) Disable password authentication

Once key-based login works, disable password auth for security:

```bash
# On the server:
sudo nano /etc/ssh/sshd_config
```

Find and change these lines:

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`) and restart SSH:

```bash
sudo systemctl restart ssh
```

> ⚠️ **Keep your current SSH session open** and open a NEW terminal to test passwordless login still works. Only close the original session after confirming.

### C.6 (Optional) Set up an SSH config alias

**On your laptop**, edit `~/.ssh/config`:

```
Host patel-prod
    HostName 192.168.1.50
    User deploy
    IdentityFile ~/.ssh/id_ed25519
```

Now you can just type `ssh patel-prod` instead of the full command.

---

## Phase D — Network configuration (static IP + firewall)

### D.1 Set a static IP (so the server doesn't change address on reboot)

#### Option 1: Router-side (recommended, easiest)

Reserve a static IP for your server's MAC address in your router's DHCP settings. Look for "DHCP Reservation" or "Static Lease" in your router admin panel (usually `http://192.168.1.1`).

#### Option 2: Server-side (Netplan)

```bash
# Find your interface name:
ip link show
# e.g., enp3s0

# Find your router's IP (gateway):
ip route | grep default
# e.g., default via 192.168.1.1

# Edit the netplan config:
sudo nano /etc/netplan/00-installer-config.yaml
```

Replace with (adjust IPs + interface name to your network):

```yaml
network:
  version: 2
  ethernets:
    enp3s0:
      addresses:
        - 192.168.1.50/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
```

Apply:

```bash
sudo netplan apply
# Test: ping google.com
ping -c 3 google.com
```

### D.2 Configure the firewall (UFW)

```bash
# Allow SSH (don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP + HTTPS (for Caddy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable
# Type "y" to confirm

# Verify:
sudo ufw status verbose
```

> ⚠️ **PostgreSQL (5432) and PgBouncer (6432) should NOT be exposed** — they bind to `127.0.0.1` only (configured in docker-compose.yml). Never add them to the UFW allow list.

### D.3 Port forwarding (if behind a router/NAT)

To make the site accessible from the internet, forward ports 80 + 443 from your router to the server's LAN IP:

1. Open your router's admin panel (usually `http://192.168.1.1`)
2. Find "Port Forwarding" / "Virtual Server" / "NAT"
3. Add rules:
   - External port 80 → Internal IP `192.168.1.50` → Internal port 80 (TCP)
   - External port 443 → Internal IP `192.168.1.50` → Internal port 443 (TCP)
4. Save + apply

### D.4 Dynamic DNS (if you don't have a static public IP)

If your ISP gives you a dynamic IP, use a DDNS service (free):
- **DuckDNS** (https://www.duckdns.org/) — free, simple
- **No-IP** (https://www.noip.com/) — free tier

Set up DuckDNS:

```bash
# Follow the instructions at https://www.duckdns.org/install.jsp
# (they give you a domain like patelnetworks.duckdns.org pointing to your dynamic IP)
```

✅ **Checkpoint D**: From outside your network, `curl -I http://<your-public-ip-or-ddns-domain>/` connects (even if it returns a 502 — that means it reached the server but the app isn't running yet).

---

## Phase E — Install Docker

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER
newgrp docker   # apply the group change immediately

# Verify
docker --version          # Docker version 24+
docker compose version    # Compose v2
docker run hello-world    # should print a success message
```

✅ **Checkpoint E**: `docker run hello-world` prints "Hello from Docker!".

---

## Phase F — Install Node.js + Bun + pm2

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Bun (faster than npm for this project)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# pm2 (process manager for the Next.js app)
sudo npm install -g pm2

# Verify
node --version    # v20.x
bun --version     # 1.x
pm2 --version     # 5.x
```

### Create the persistent data directories

```bash
sudo mkdir -p /var/lib/patelnetworks/pgdata
sudo mkdir -p /var/lib/patelnetworks/backups
sudo chown -R 999:999 /var/lib/patelnetworks/pgdata   # 999 = postgres uid inside the container
sudo chmod 700 /var/lib/patelnetworks/pgdata
```

✅ **Checkpoint F**: `node --version`, `bun --version`, `pm2 --version`, `ls -ld /var/lib/patelnetworks/pgdata` all succeed.

---

## Phase G — Deploy PostgreSQL + PgBouncer

### G.1 Get the project code

```bash
cd /opt
sudo git clone https://github.com/OmKardile/patel-5.2.git patelnetworks
sudo chown -R $USER:$USER patelnetworks
cd patelnetworks
```

### G.2 Create the `.env` file

```bash
cp .env.example .env
nano .env
```

Edit these lines — use a strong password (generate with `openssl rand -base64 24`):

```bash
# Use the SAME password in all 3 places (the app connects to PgBouncer with this)
DATABASE_URL="postgresql://patelnetworks:CHANGE_ME@127.0.0.1:6432/patelnetworks?schema=public&sslmode=disable"
DIRECT_URL="postgresql://patelnetworks:CHANGE_ME@127.0.0.1:5432/patelnetworks?schema=public&sslmode=disable"

# Generate: openssl rand -base64 48
JWT_SECRET="paste-the-generated-jwt-secret-here"
JWT_EXPIRES_IN="7d"
```

Leave Razorpay / WhatsApp / Shiprocket / SMS / Cloudinary as placeholders until you procure those services.

### G.3 Create the Docker secrets file

```bash
nano .env.docker
```

Add (the `PGBOUNCER_APP_PASSWORD` must match the password in `.env`):

```bash
POSTGRES_PASSWORD=<generate: openssl rand -base64 24>
PGBOUNCER_APP_PASSWORD=<must match the CHANGE_ME value from .env>
```

### G.4 Start the database stack

```bash
docker compose --env-file .env.docker up -d
```

### G.5 Wait for healthy

```bash
docker compose ps
# Both "db" and "pgbouncer" should show Status = "healthy"
```

### G.6 Create the application database + user

```bash
docker compose exec db psql -U postgres <<SQL
CREATE USER patelnetworks WITH PASSWORD '<PGBOUNCER_APP_PASSWORD value>';
CREATE DATABASE patelnetworks OWNER patelnetworks;
GRANT ALL PRIVILEGES ON DATABASE patelnetworks TO patelnetworks;
SQL
```

### G.7 Test the app role can connect via PgBouncer

```bash
docker compose exec pgbouncer psql -U patelnetworks -d patelnetworks -c "SELECT version();"
# Should print: PostgreSQL 16.x ...
```

✅ **Checkpoint G**: the version query prints `PostgreSQL 16.x`.

---

## Phase H — Migrate data from Supabase

> This is a one-time read-only dump + restore. **No data is deleted from Supabase.**

### H.1 Install PostgreSQL client tools

```bash
sudo apt install -y postgresql-client-16
```

(If apt can't find version 16, use the PostgreSQL APT repo: https://wiki.postgresql.org/wiki/Apt)

### H.2 Dump the Supabase database

```bash
# Replace <SUPABASE_DB_URL> with the DIRECT_URL from the current .env
# (the :5432 URL, NOT the :6543 pooler URL)

pg_dump \
  "<SUPABASE_DB_URL>" \
  --no-owner --no-privileges --clean --if-exists \
  --schema=public \
  --no-tablespaces \
  | gzip > /tmp/supabase-export.sql.gz
```

Verify the dump:

```bash
ls -lh /tmp/supabase-export.sql.gz    # should be ~100 KB for 412 rows
gunzip -c /tmp/supabase-export.sql.gz | head -20   # should show CREATE TABLE statements
```

### H.3 Restore into the server's PostgreSQL

```bash
gunzip -c /tmp/supabase-export.sql.gz | \
  docker compose exec -T db psql -U patelnetworks -d patelnetworks
```

### H.4 Validate the migration

```bash
# Expected: 29 tables, ~412 total rows
docker compose exec db psql -U patelnetworks -d patelnetworks <<'SQL'
SELECT count(*) AS table_count FROM pg_tables WHERE schemaname='public';

SELECT tablename, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY tablename;
SQL
```

Compare against Supabase (run the same query on Supabase via `psql` or the SQL editor). Counts must match.

✅ **Checkpoint H**: 29 tables, row counts match Supabase source.

---

## Phase I — Deploy the Next.js application

### I.1 Install dependencies + generate Prisma client

```bash
cd /opt/patelnetworks
bun install
bun run db:generate
```

### I.2 Typecheck + lint

```bash
bun run typecheck   # should print nothing (0 errors)
bun run lint        # should print nothing (0 errors)
```

### I.3 Build the production bundle

```bash
bun run build
# Expected: "✓ Compiled successfully" + exit code 0, .next/BUILD_ID exists
```

### I.4 Start the app with pm2

```bash
pm2 start "bun run start" --name patelnetworks
pm2 save
pm2 startup   # follow the printed instructions to make pm2 start on boot
```

### I.5 Verify the app responds

```bash
curl -fsS http://localhost:3000/ | grep -o '<title>[^<]*</title>'
# Expected: <title>Patel Networks — Commercial CCTV, Surveillance & Networking Hardware</title>
```

Test more routes:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/products       # 200
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/kit-builder     # 200
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/login     # 200
```

✅ **Checkpoint I**: homepage title renders, all routes return 200.

---

## Phase J — Reverse proxy + HTTPS (Caddy)

### J.1 Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### J.2 Configure Caddy

Edit `/etc/caddy/Caddyfile`:

```bash
sudo nano /etc/caddy/Caddyfile
```

**If you have a domain** (e.g., `patelnetworks.in`):

```caddy
patelnetworks.in {
    reverse_proxy localhost:3000
}
```

**If you only have an IP or DDNS domain** (no real domain → use HTTP):

```caddy
:80 {
    reverse_proxy localhost:3000
}
```

### J.3 Restart Caddy

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

### J.4 Verify

```bash
# Check Caddy logs for errors
sudo journalctl -u caddy --no-pager | tail -20

# Test the site
curl -fsS https://patelnetworks.in/ | grep -o '<title>[^<]*</title>'
# or: curl -fsS http://<your-public-ip>/ | grep -o '<title>[^<]*</title>'
```

✅ **Checkpoint J**: the site loads via the domain or public IP with HTTPS (if you have a domain).

---

## Phase K — Automated backups

### K.1 Test the backup script

```bash
cd /opt/patelnetworks
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
ls -lh /var/lib/patelnetworks/backups/   # should show a new .sql.gz file
```

### K.2 Schedule daily backups via cron

```bash
sudo crontab -e
```

Add (daily at 02:00):

```cron
0 2 * * * /opt/patelnetworks/scripts/backup-db.sh >> /var/log/patelnetworks-backup.log 2>&1
```

### K.3 (Optional) Offsite backup copy

To protect against disk failure, copy backups to an external drive or cloud:

```bash
# Add to the same crontab (after the backup runs):
15 2 * * * rsync -a /var/lib/patelnetworks/backups/ user@backup-server:/backups/patelnetworks/
```

✅ **Checkpoint K**: a backup file exists in `/var/lib/patelnetworks/backups/` and cron is scheduled.

---

## Phase L — Security hardening

### L.1 fail2ban (blocks brute-force SSH attacks)

Already installed in Phase B. Verify + enable:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd    # should show the jail is active
```

### L.2 Confirm firewall is active

```bash
sudo ufw status verbose
# Should show: 22, 80, 443 allowed; 5432/6432 NOT exposed
```

### L.3 Disable SSH root login + password auth (if not done in Phase C)

```bash
sudo nano /etc/ssh/sshd_config
# Set:
#   PermitRootLogin no
#   PasswordAuthentication no
sudo systemctl restart ssh
```

### L.4 Regular security updates (already enabled in Phase B)

Verify automatic updates are on:

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
# Should contain:
# APT::Periodic::Update-Package-Lists "1";
# APT::Periodic::Unattended-Upgrade "1";
```

### L.5 BIOS settings (physical server specific)

Enter BIOS and configure:
- **AC Power Recovery** → "Power On" (server boots after a power cut)
- **Disable USB boot** (prevents physical access attacks via USB)
- **Set a BIOS admin password** (prevents BIOS tampering)

✅ **Checkpoint L**: `sudo ufw status` shows 22/80/443 only, `fail2ban-client status sshd` is active, SSH key-only auth works.

---

## Phase M — Monitoring basics

### M.1 Check system resources

```bash
# CPU + RAM usage:
htop   # install with: sudo apt install htop

# Disk usage:
df -h

# Docker container health:
docker compose ps

# App logs (last 50 lines):
pm2 logs patelnetworks --lines 50

# Database connections:
docker compose exec pgbouncer psql -U patelnetworks -d patelnetworks -c "SHOW POOLS;"
```

### M.2 pm2 status on boot

```bash
pm2 status    # should show patelnetworks as "online"
pm2 monit     # real-time CPU/RAM monitoring of the app
```

### M.3 (Optional) Set up uptime monitoring

Use a free external monitor to alert you if the site goes down:
- **UptimeRobot** (https://uptimerobot.com/) — free, monitors HTTP endpoints every 5 min
- Add your domain or public IP as an HTTP monitor

---

## Phase N — Final cutover & decommission Supabase

> **Only proceed after Phases G–M all pass and you've used the server for 24 hours without issues.**

### N.1 Final validation

```bash
cd /opt/patelnetworks
bun run typecheck && bun run lint && bun run build
curl -fsS https://patelnetworks.in/ | grep -o '<title>[^<]*</title>'
pm2 status                    # patelnetworks "online"
docker compose ps             # db + pgbouncer "healthy"
sudo ufw status               # 22/80/443 only
df -h /var/lib/patelnetworks  # check disk space
```

### N.2 Take a final Supabase backup (safety net)

```bash
pg_dump "<SUPABASE_DB_URL>" --no-owner --no-privileges --schema=public | gzip > /tmp/supabase-final-backup.sql.gz
ls -lh /tmp/supabase-final-backup.sql.gz
```

### N.3 Decommission Supabase

1. Supabase dashboard → Settings → General → **Delete Project**
2. Confirm (irreversible — the final backup above is your safety net)

✅ **Checkpoint N (final)**: app live on the physical server, Supabase decommissioned, backups scheduled, firewall up, fail2ban active.

---

## Troubleshooting

### Can't SSH in after disabling password auth

- Plug a keyboard + monitor into the server
- Login at the console
- `sudo nano /etc/ssh/sshd_config` → set `PasswordAuthentication yes` temporarily
- `sudo systemctl restart ssh`
- Fix your SSH key setup, then re-disable password auth

### `pg_dump` fails with "connection refused"

- You're using the pooler URL (port 6543). Use the **direct** URL (port 5432) for `pg_dump`.
- Check the Supabase project isn't paused (dashboard → Settings).

### Restore fails with "extension pgcrypto does not exist"

```bash
docker compose exec db psql -U postgres -d patelnetworks -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```
Then re-run the restore.

### App shows "Internal Server Error"

```bash
pm2 logs patelnetworks --lines 50
# Common causes: .env DATABASE_URL wrong, password mismatch, DB not running
```

### `docker compose` command not found

You're on older Docker. Use `docker-compose` (hyphen) or upgrade to Docker 24+.

### PgBouncer says "authentication failed"

`PGBOUNCER_APP_PASSWORD` in `.env.docker` doesn't match the password in `.env`. Fix both, then:
```bash
docker compose --env-file .env.docker down
docker compose --env-file .env.docker up -d
```

### Site loads slowly

```bash
# Check CPU/RAM:
htop
# If RAM is full (> 90%):
#   - Add swap: sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
#   - Or upgrade RAM
# Check disk:
df -h   # if > 90% full, clean old backups
```

### Server doesn't boot after power cut

Enter BIOS → set "AC Power Recovery" to "Power On". Also add to `/etc/crontab`:
```
@reboot root sleep 30 && docker compose -f /opt/patelnetworks/docker-compose.yml --env-file /opt/patelnetworks/.env.docker up -d
```

### Public IP changed (dynamic IP)

- If using DDNS (DuckDNS), it auto-updates
- If not, update your DNS A record manually
- The server itself doesn't care — it binds to `0.0.0.0`

---

## Rollback procedure

If the physical server deployment fails and you need to fall back to Supabase temporarily:

1. **Do NOT delete Supabase** until the server is fully validated (Phase N).
2. On the server, edit `/opt/patelnetworks/.env`:
   ```bash
   DATABASE_URL="<SUPABASE_POOLER_URL>"
   DIRECT_URL="<SUPABASE_DIRECT_URL>"
   ```
3. Restart the app:
   ```bash
   pm2 restart patelnetworks
   ```
4. Investigate the server DB issue, fix, re-run Phase H.

The Supabase database is untouched (read-only dump) until you explicitly delete it in Phase N.

---

## Quick reference — the 12 commands

```bash
# 1. Update system + install tools
sudo apt update && sudo apt upgrade -y && sudo apt install -y curl git ufw fail2ban

# 2. Install Docker
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER && newgrp docker

# 3. Install Node + Bun + pm2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs && curl -fsSL https://bun.sh/install | bash && source ~/.bashrc && sudo npm install -g pm2

# 4. Clone the code + create .env
cd /opt && sudo git clone https://github.com/OmKardile/patel-5.2.git patelnetworks && sudo chown -R $USER:$USER patelnetworks && cd patelnetworks && cp .env.example .env && nano .env

# 5. Create data dirs
sudo mkdir -p /var/lib/patelnetworks/{pgdata,backups} && sudo chown -R 999:999 /var/lib/patelnetworks/pgdata

# 6. Start PostgreSQL + PgBouncer
docker compose --env-file .env.docker up -d

# 7. Create the DB user
docker compose exec db psql -U postgres -c "CREATE USER patelnetworks WITH PASSWORD '<PWD>'; CREATE DATABASE patelnetworks OWNER patelnetworks;"

# 8. Migrate data from Supabase
pg_dump "<SUPABASE_DB_URL>" --no-owner --no-privileges --clean --if-exists --schema=public | gzip > /tmp/exp.sql.gz
gunzip -c /tmp/exp.sql.gz | docker compose exec -T db psql -U patelnetworks -d patelnetworks

# 9. Build + start the app
bun install && bun run db:generate && bun run build && pm2 start "bun run start" --name patelnetworks && pm2 save && pm2 startup

# 10. Firewall
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable

# 11. Schedule backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/patelnetworks/scripts/backup-db.sh >> /var/log/pn-backup.log 2>&1") | crontab -

# 12. Decommission Supabase (ONLY after 24h stable operation)
# → Supabase dashboard → Settings → Delete Project
```

---

## What you need before starting

1. **The server hardware** (see §1 — minimum 2 cores / 4 GB RAM / 40 GB SSD)
2. **A USB drive** (≥ 4 GB) to install the OS
3. **Physical access** to the server for Phase A (OS install) — after that, everything is remote via SSH
4. **The current Supabase `DIRECT_URL`** (for the one-time data dump in Phase H)
5. **Chosen passwords** (generate with `openssl rand -base64 24`):
   - `POSTGRES_PASSWORD` (DB superuser)
   - `PGBOUNCER_APP_PASSWORD` (becomes the app's DB password)
   - `JWT_SECRET` (`openssl rand -base64 48`)
6. **A domain name** (optional but recommended for HTTPS — otherwise use the server's public IP)
7. **Router admin access** (to set up port forwarding in Phase D)

That's it. Everything else is in this guide.
