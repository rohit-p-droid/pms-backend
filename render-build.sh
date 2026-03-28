#!/bin/bash
set -e

echo "==> Installing dependencies..."
bun install

echo "==> Building TypeScript..."
bun run build

echo "==> Build completed successfully"
