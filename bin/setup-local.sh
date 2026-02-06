#!/bin/bash
set -e

echo "🔒 Sourcing environment configuration..."
# Enforce Node version if nvm is available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use
fi

echo "📦 Installing Root Dependencies (Deterministic)..."
npm ci

echo "📦 Installing Frontend Dependencies (Deterministic with Legacy Peer Deps)..."
# Angular UI has fragile dependencies requiring legacy-peer-deps
cd angular-ui
npm ci --legacy-peer-deps
cd ..

echo "✅ Local Environment Setup Complete."
