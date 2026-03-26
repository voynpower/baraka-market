#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${APP_ROOT:-}" ]]; then
  echo "APP_ROOT is required"
  exit 1
fi

SERVER_DIR="$APP_ROOT/server"
ENV_FILE="$SERVER_DIR/.env"

mkdir -p "$SERVER_DIR"

cat > "$ENV_FILE" <<EOF
DATABASE_URL=${DATABASE_URL:-}
JWT_SECRET=${JWT_SECRET:-}
APP_BASE_URL=${APP_BASE_URL:-}
ENABLE_ADMIN_SETUP=${ENABLE_ADMIN_SETUP:-false}
MAIL_HOST=${MAIL_HOST:-}
MAIL_PORT=${MAIL_PORT:-}
MAIL_USER=${MAIL_USER:-}
MAIL_PASS=${MAIL_PASS:-}
MAIL_FROM=${MAIL_FROM:-}
EOF

cd "$SERVER_DIR"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

if [[ -n "${BACKEND_RESTART_COMMAND:-}" ]]; then
  eval "$BACKEND_RESTART_COMMAND"
else
  echo "BACKEND_RESTART_COMMAND is not set. Build completed without restart."
fi
