#!/bin/bash
set -e
BACKEND_BASE=${1:-"http://localhost:3000"}
FRONTEND_BASE=${2:-"http://localhost:5174"}
PASS=0
FAIL=0

check() {
  local name=$1
  local url=$2
  local expected=$3
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "$expected" ]; then
    echo "[PASS] $name ($status)"
    PASS=$((PASS+1))
  else
    echo "[FAIL] $name (expected $expected, got $status)"
    FAIL=$((FAIL+1))
  fi
}

echo "=== Smoke Test ==="
check "backend health" "$BACKEND_BASE/health" "200"
check "frontend login" "$FRONTEND_BASE/login" "200"
check "frontend dashboard route" "$FRONTEND_BASE/dashboard" "200"

echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
