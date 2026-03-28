#!/bin/bash
set -e

echo "==> Installing dependencies with bun..."
bun install

echo "==> Building TypeScript..."
bunx tsc

echo "==> Build completed successfully"
