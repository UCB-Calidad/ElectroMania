#!/bin/bash

set -e

echo "====================================="
echo "ElectroMania SonarQube Analysis"
echo "====================================="

START_TIME=$(date +%s)

ROOT_DIR=$(pwd)
BACKEND_DIR="$ROOT_DIR/Back_Electromanía"
FRONTEND_DIR="$ROOT_DIR/electromania-frontend"

echo ""
echo "Cleaning previous coverage reports..."

rm -rf "$BACKEND_DIR/coverage"
rm -rf "$FRONTEND_DIR/coverage"

# =========================
# LOAD ENV
# =========================
if [ -f "$ROOT_DIR/.env" ]; then
  echo "Loading .env variables..."
  export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

# =========================
# BACKEND
# =========================
echo ""
echo "[Backend] Running tests with coverage..."

cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "[Backend] Installing dependencies..."
  pnpm install
fi

pnpm run test:cov

echo "[Backend] Coverage completed"

# =========================
# FRONTEND
# =========================
echo ""
echo "[Frontend] Running tests with coverage..."

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "[Frontend] Installing dependencies..."
  npm install
fi

env NG_CLI_ANALYTICS=false npm run test:co 

echo "[Frontend] Coverage completed"

# =========================
# SONARQUBE
# =========================
cd "$ROOT_DIR"

echo ""
echo "Running SonarQube scanner..."

sonar-scanner

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "====================================="
echo "ElectroMania Analysis Completed"
echo "Total time: ${DURATION}s"
echo "====================================="