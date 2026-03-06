#!/bin/bash
# Run on the VPS (as root) to install MySQL, create database/user, then:
# 1) Import server/sql/hqmrvoda_lasglowtechserver.sql (main dump)
# 2) Run every other .sql file in server/sql/ (migrations/seeds). Then set DATABASE_* in .env.production.
#
# Usage:
#   chmod +x scripts/setup-mysql-vps.sh
#   sudo ./scripts/setup-mysql-vps.sh
#
# Or set env vars first (recommended):
#   export MYSQL_DB_NAME=lasglowtechserver
#   export MYSQL_DB_USER=lasglowapp
#   export MYSQL_DB_PASSWORD='your_strong_password'
#   sudo -E ./scripts/setup-mysql-vps.sh

set -e

# Defaults (override with env vars)
MYSQL_DB_NAME="${MYSQL_DB_NAME:-lasglowtechserver}"
MYSQL_DB_USER="${MYSQL_DB_USER:-lasglowapp}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_FILE="$REPO_ROOT/sql/hqmrvoda_lasglowtechserver.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Using database: $MYSQL_DB_NAME"
echo "Using user:     $MYSQL_DB_USER"
echo "SQL file:       $SQL_FILE"
echo ""

# Install MySQL if not present (Debian/Ubuntu)
if ! command -v mysql &>/dev/null; then
  echo "Installing MySQL server..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y mysql-server
  systemctl start mysql
  systemctl enable mysql
fi

# Prompt for password if not set
if [ -z "$MYSQL_DB_PASSWORD" ]; then
  read -sp "Enter password for MySQL user $MYSQL_DB_USER: " MYSQL_DB_PASSWORD
  echo ""
  if [ -z "$MYSQL_DB_PASSWORD" ]; then
    echo "Password cannot be empty."
    exit 1
  fi
fi

echo "Creating database and user (use sudo if root has socket auth)..."
# Use sudo mysql if "mysql -u root" fails (common on Ubuntu)
if mysql -u root -e "SELECT 1" 2>/dev/null; then
  MYSQL_CMD="mysql -u root"
elif sudo mysql -u root -e "SELECT 1" 2>/dev/null; then
  MYSQL_CMD="sudo mysql -u root"
else
  echo "Run as root or use: mysql -u root -p"
  MYSQL_CMD="mysql -u root -p"
fi

$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS \`$MYSQL_DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER IF NOT EXISTS '$MYSQL_DB_USER'@'localhost' IDENTIFIED BY '$MYSQL_DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$MYSQL_DB_NAME\`.* TO '$MYSQL_DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Importing main SQL dump..."
$MYSQL_CMD "$MYSQL_DB_NAME" < "$SQL_FILE"

SQL_DIR="$REPO_ROOT/sql"
MAIN_DUMP_NAME="hqmrvoda_lasglowtechserver.sql"
echo "Running remaining SQL files in sql/ (migrations/seeds)..."
for f in "$SQL_DIR"/*.sql; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  if [ "$name" = "$MAIN_DUMP_NAME" ]; then
    continue
  fi
  echo "  -> $name"
  $MYSQL_CMD "$MYSQL_DB_NAME" < "$f"
done

echo "Done. Add to .env.production:"
echo "  DATABASE_HOST=127.0.0.1"
echo "  DATABASE_USER=$MYSQL_DB_USER"
echo "  DATABASE_PASSWORD=<your password>"
echo "  DATABASE=$MYSQL_DB_NAME"
echo "  DATABASE_PORT=3306"
