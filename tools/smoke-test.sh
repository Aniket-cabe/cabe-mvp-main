#!/usr/bin/env bash
set -euo pipefail

echo "=== Backend build & health ==="
pushd backend
npm ci --include=dev
npm run build
PORT=3001 npm start &
BACK_PID=$!
sleep 2
curl -sf http://localhost:3001/health | grep '"ok":true'
kill $BACK_PID || true
popd

echo "=== Frontend build ==="
pushd frontend
npm ci
npm run build
test -d dist
popd

echo "ALL GOOD ✅"
