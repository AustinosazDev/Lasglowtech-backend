#!/bin/bash
# Load sql/datas.sql and other SQL files into the database ONCE.
# Run from the backend app directory on the VPS (e.g. ~/backend/Lasglowblog).
#
# Uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE so it's safe to run
# when some tables/data already exist (no duplicate-key errors).
#
# Usage:
#   cd ~/backend/Lasglowblog
#   chmod +x scripts/load-sql-once.sh
#   ./scripts/load-sql-once.sh
#
# Or set env vars first (same as .env.production):
#   export DATABASE=lasglowdb
#   export DATABASE_USER=lasglow_tech
#   export DATABASE_PASSWORD='your_password'
#   ./scripts/load-sql-once.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_DIR="$REPO_ROOT/sql"

# DB config: set DATABASE, DATABASE_USER, DATABASE_PASSWORD in env, or edit below
DB_NAME="${DATABASE:-lasglowdb}"
DB_USER="${DATABASE_USER:-lasglow_tech}"
DB_PASS="${DATABASE_PASSWORD:-}"

if [ -z "$DB_PASS" ]; then
  read -sp "MySQL password for $DB_USER: " DB_PASS
  echo ""
  if [ -z "$DB_PASS" ]; then
    echo "Password required. Set DATABASE_PASSWORD or run again and enter it."
    exit 1
  fi
fi

echo "Database: $DB_NAME"
echo "User:     $DB_USER"
echo ""

# 1) Create missing tables (posts, contacts, email_subscriptions) if not present
if [ -f "$SQL_DIR/create_missing_tables.sql" ]; then
  echo "[1/3] Running create_missing_tables.sql ..."
  mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_DIR/create_missing_tables.sql"
  echo "  Done."
fi

# 2) Load main dump (datas.sql) with IF NOT EXISTS and INSERT IGNORE so it's safe
# --force: continue on errors (e.g. "Multiple primary key" when keys already exist)
if [ -f "$SQL_DIR/datas.sql" ]; then
  echo "[2/3] Running datas.sql (CREATE IF NOT EXISTS, INSERT IGNORE) ..."
  sed -e 's/CREATE TABLE `/CREATE TABLE IF NOT EXISTS `/g' \
      -e 's/INSERT INTO `/INSERT IGNORE INTO `/g' \
      "$SQL_DIR/datas.sql" | mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" --force
  echo "  Done."
else
  echo "[2/3] datas.sql not found, skipping."
fi

# 3) Run other migrations/seeds (order matters for ALTER / dependencies)
OTHER_SQL="add_certificate_settings.sql add_certificate_detail_columns.sql add_issue_certificate_column.sql create_added_tables_once.sql seed_admin_user.sql seed_lms_module_details.sql seed_monetization_offers.sql update_offer_images.sql"
echo "[3/3] Running other SQL files ..."
for name in $OTHER_SQL; do
  f="$SQL_DIR/$name"
  if [ -f "$f" ]; then
    echo "  -> $name"
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$f" 2>/dev/null || echo "    (some statements may have been skipped if already applied)"
  fi
done

echo ""
echo "Done. Data loaded into $DB_NAME."
