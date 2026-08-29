#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Installing dependencies..."
bun install

echo ""
echo "Installation complete."
echo "Start the server with: bun run index.ts"
