#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ENCRYPTION_SEED:-}" ]]; then
  echo "ENCRYPTION_SEED is required" >&2
  exit 1
fi

export ENCRYPTION_KEY="$(node -e 'const crypto=require("crypto"); process.stdout.write(crypto.createHash("sha256").update(process.env.ENCRYPTION_SEED).digest("hex"))')"
export NODE_ENV="${NODE_ENV:-production}"
export HOST="${HOST:-0.0.0.0}"

exec node server/dist/index.js
