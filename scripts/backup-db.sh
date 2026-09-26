#!/usr/bin/env bash
# ==============================================================================
# Patel Networks — PostgreSQL backup script (self-hosted VPS)
# Run via cron on the VPS: 0 2 * * * /opt/patelnetworks/scripts/backup-db.sh
# Produces a compressed pg_dump in /var/lib/patelnetworks/backups.
# Retains the last 14 days of backups.
# ==============================================================================
set -euo pipefail

BACKUP_DIR="/var/lib/patelnetworks/backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/patelnetworks-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup → ${BACKUP_FILE}"

# Dump via the db container. Adjust container name / db user if different.
docker exec patelnetworks-db \
  pg_dump -U postgres -d patelnetworks --no-owner --no-privileges --clean --if-exists \
  | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup complete: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Retention: keep the last 14 days
find "${BACKUP_DIR}" -name "patelnetworks-*.sql.gz" -mtime +14 -delete
echo "[$(date)] Pruned backups older than 14 days."
